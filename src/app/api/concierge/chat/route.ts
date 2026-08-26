import {createOpenRouter} from '@openrouter/ai-sdk-provider'
import {createMCPClient, type MCPClient} from '@ai-sdk/mcp'
import {convertToModelMessages, stepCountIs, streamText, type UIMessage} from 'ai'

import {getEntitlements} from '@/lib/entitlements'
import {createAgentTools} from '@/lib/agent/tools'
import {CONCIERGE_SYSTEM_PROMPT} from '@/lib/agent/system-prompt'

const DEFAULT_MODEL = 'nvidia/nemotron-3.5-lightning:free'
const MAX_STEPS = 10

let cachedInitialContext: string | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000

function initialContextUrl(mcpUrl: string): string {
  const url = new URL(mcpUrl)
  url.pathname = `${url.pathname.replace(/\/$/, '')}/initial-context`
  return url.toString()
}

async function fetchInitialContext(): Promise<string | null> {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL
  if (!mcpUrl) return null

  const isStale = Date.now() - cacheTimestamp > CACHE_TTL_MS
  if (isStale) {
    try {
      const res = await fetch(initialContextUrl(mcpUrl), {
        headers: {Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`},
      })
      if (res.ok) {
        cachedInitialContext = await res.text()
        cacheTimestamp = Date.now()
      }
    } catch {
      // Fall through with whatever is cached (possibly null) — the base
      // system prompt still works without schema context.
    }
  }

  return cachedInitialContext
}

export async function POST(req: Request) {
  const {userId, canUseConcierge} = await getEntitlements()
  if (!userId || !canUseConcierge) {
    return Response.json({error: 'Concierge access requires an Aloft PRO membership.'}, {status: 403})
  }

  if (!process.env.SANITY_CONTEXT_MCP_URL || !process.env.SANITY_API_READ_TOKEN) {
    return Response.json({error: 'Concierge is not configured.'}, {status: 500})
  }

  const {messages}: {messages: UIMessage[]} = await req.json()

  let mcpClient: MCPClient | null = null

  try {
    const [mcpClientResult, initialContext] = await Promise.all([
      createMCPClient({
        transport: {
          type: 'http',
          url: process.env.SANITY_CONTEXT_MCP_URL,
          headers: {Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`},
        },
      }),
      fetchInitialContext(),
    ])
    mcpClient = mcpClientResult

    const allMcpTools = await mcpClient.tools()
    // Excluded — its data is already folded into the system prompt below.
    const {initial_context: _initialContextTool, ...mcpTools} = allMcpTools

    const system = `${CONCIERGE_SYSTEM_PROMPT}${
      initialContext ? `\n\n## Data reference\n\n${initialContext}` : ''
    }`

    const openrouter = createOpenRouter({apiKey: process.env.OPENROUTER_API_KEY})
    const modelId = process.env.OPENROUTER_MODEL || DEFAULT_MODEL

    const result = streamText({
      model: openrouter(modelId),
      system,
      // createBooking/cancelBooking are confirm-gated and have no `execute`,
      // so an un-clicked confirm card leaves a tool call with no result. That
      // is not an action the user took — drop it rather than replaying a
      // dangling tool call, which strict providers reject outright.
      messages: await convertToModelMessages(messages, {ignoreIncompleteToolCalls: true}),
      tools: {
        ...mcpTools,
        ...createAgentTools({userId}),
      },
      stopWhen: stepCountIs(MAX_STEPS),
      onFinish: async () => {
        await mcpClient?.close()
      },
    })

    return result.toUIMessageStreamResponse({originalMessages: messages})
  } catch (error) {
    await mcpClient?.close()
    return Response.json(
      {error: error instanceof Error ? error.message : 'An unexpected error occurred'},
      {status: 500},
    )
  }
}
