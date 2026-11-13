import { Lock, Trash2, Volume2, type LucideIcon } from 'lucide-react'

const points: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Lock,
    title: 'Private by default',
    body: 'Your calls, transcripts and drafts are only yours. Nothing is public unless you publish it.',
  },
  {
    icon: Volume2,
    title: 'Honest about being an AI',
    body: "Every call starts by saying it's Rize's AI and that it records. Ask again and it'll say so plainly.",
  },
  {
    icon: Trash2,
    title: 'Yours to delete',
    body: 'Delete a call with its recording, transcript and drafts whenever you like, or delete your whole account.',
  },
]

const TrustSection = () => {
  return (
    <section aria-labelledby="trust-title" className="w-full border-t border-hairline">
      <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 md:py-28">
        <h2 id="trust-title" className="max-w-2xl font-instrument text-4xl leading-tight text-ink md:text-5xl">
          It&apos;s your story. You stay in charge of it.
        </h2>
        <ul className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-10">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-4 font-medium text-ink">{title}</h3>
              <p className="mt-1.5 max-w-sm leading-relaxed text-ink-secondary">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default TrustSection
