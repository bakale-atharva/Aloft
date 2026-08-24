import {client} from '@/sanity/client'
import {AIRPORTS_QUERY} from '@/sanity/queries'
import {SearchForm} from '@/components/search-form/SearchForm'

export default async function Home() {
  const airports = await client.fetch(AIRPORTS_QUERY, {}, {next: {revalidate: 300}})

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-black/10 bg-gradient-to-b from-blue-50 to-background dark:border-white/10 dark:from-blue-950/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Fly further, sit better.
            </h1>
            <p className="mt-4 text-lg text-black/60 dark:text-white/60">
              Search flights, pick your exact seat on a real map, and book in minutes.
              PRO members skip every seat fee and get their own AI concierge.
            </p>
          </div>
          <SearchForm airports={airports} />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:grid-cols-3">
        <Feature
          title="Visual seat picker"
          description="See the real cabin layout for your aircraft and tap the exact seat you want, exit rows and all."
        />
        <Feature
          title="One-way or round trip"
          description="Search both directions in a single flow, with a running total as you build your itinerary."
        />
        <Feature
          title="AI concierge, PRO only"
          description="Chat your way to a booking, or get support instantly. Free seat selection is included with PRO."
        />
      </section>
    </div>
  )
}

function Feature({title, description}: {title: string; description: string}) {
  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">{description}</p>
    </div>
  )
}
