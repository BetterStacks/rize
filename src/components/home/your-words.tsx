import { newsreader } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { ChevronDown, Lock, Pencil, Share, type LucideIcon } from 'lucide-react'
import { Fragment } from 'react'

// A static picture of the draft review card (src/components/voice/VoiceJournal.tsx,
// DraftCard + FromYourCall). The example is made up. The draft must be exactly the
// highlighted words below, apart from capitals and punctuation: that's the promise.
type Run = { kind: 'kept' | 'dropped' | 'unused'; text: string }

const transcript: Run[] = [
  { kind: 'dropped', text: 'So, um,' },
  { kind: 'kept', text: 'this week I finally ran our stall at the college fest.' },
  { kind: 'kept', text: 'We' },
  { kind: 'dropped', text: 'like,' },
  { kind: 'kept', text: 'sold out of lemon cake by noon, which' },
  { kind: 'dropped', text: 'you know,' },
  { kind: 'kept', text: 'nobody expected.' },
  { kind: 'unused', text: 'I had to run back to the hostel for more plates.' },
  { kind: 'kept', text: 'Honestly,' },
  { kind: 'dropped', text: 'uh,' },
  { kind: 'kept', text: "next time we're baking double." },
]

const draft =
  "This week I finally ran our stall at the college fest. We sold out of lemon cake by noon, which nobody expected. Honestly, next time we're baking double."

const actions: { icon: LucideIcon; label: string; primary?: boolean }[] = [
  { icon: Lock, label: 'Not now' },
  { icon: Pencil, label: 'Edit' },
  { icon: Share, label: 'Share', primary: true },
]

const DraftExample = () => {
  return (
    <figure className="w-full">
      <div
        className={cn(
          newsreader.variable,
          'space-y-5 rounded-2xl border border-paper-border bg-paper p-5 text-ink sm:p-7'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-secondary">In your words</p>
          <p className="text-xs text-ink-secondary">Example</p>
        </div>

        <p className="rize-display text-[22px] leading-[1.3] sm:text-[24px]">{draft}</p>

        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink-secondary">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
            From your call
          </p>
          <p className="pt-3 text-[15px] leading-relaxed">
            {transcript.map((run, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                {run.kind === 'kept' ? (
                  <mark className="rounded-[3px] bg-brand px-0.5 text-brand-ink">{run.text}</mark>
                ) : run.kind === 'dropped' ? (
                  <s className="text-ink-secondary">
                    <span className="sr-only">(removed: </span>
                    {run.text}
                    <span className="sr-only">)</span>
                  </s>
                ) : (
                  <span className="text-ink-secondary">{run.text}</span>
                )}
              </Fragment>
            ))}
          </p>
        </div>

        <div aria-hidden="true" className="grid grid-cols-3 justify-items-center gap-2 pt-1">
          {actions.map(({ icon: Icon, label, primary }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full border',
                  primary ? 'border-transparent bg-ink text-paper' : 'border-paper-border bg-paper'
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>

        <p className="border-t border-paper-border pt-3 text-xs text-ink-secondary">
          Nothing goes public unless you say so.
        </p>
      </div>
      <figcaption className="mt-4 text-sm leading-relaxed text-ink-secondary">
        A made-up example. Highlighted words were kept from the call; struck-through filler was taken out. Nothing
        else changed.
      </figcaption>
    </figure>
  )
}

const YourWords = () => {
  return (
    <section aria-labelledby="your-words-title" className="w-full border-t border-hairline">
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-28">
        <div className="md:pt-2">
          <h2 id="your-words-title" className="font-instrument text-4xl leading-tight text-ink md:text-5xl">
            AI-written posts all sound the same. Yours won&apos;t.
          </h2>
          <div className="mt-6 max-w-md space-y-4 text-lg leading-relaxed text-ink-secondary">
            <p>
              Most tools hand you a fluent draft, and you end up editing inside someone else&apos;s sentences.
              Rize works the other way round: it listens first, then cuts a draft from what you said.
            </p>
            <p>
              Filler comes out and punctuation gets fixed. That&apos;s it. No new words, no hooks, no hashtags.
              You can see exactly where every line came from.
            </p>
          </div>
        </div>
        <DraftExample />
      </div>
    </section>
  )
}

export default YourWords
