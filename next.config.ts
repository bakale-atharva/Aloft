import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  // Disabled: React Compiler's generated memoization code inside Sanity
  // Studio's dashboard module (DashboardTokenRefresh) trips Turbopack's
  // chunk parser ("Unterminated regexp literal"). Re-enable once that
  // interaction is fixed upstream.
  reactCompiler: false,
  // The embedded Studio at /studio pulls the whole `sanity` package into the
  // RSC graph, where `swr` resolves to a react-server build with no default
  // export. Keeping these out of the server bundle lets Node resolve them
  // normally instead.
  serverExternalPackages: ['sanity', '@sanity/vision', 'styled-components'],
}

export default nextConfig
