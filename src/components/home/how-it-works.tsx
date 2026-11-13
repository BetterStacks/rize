const steps = [
  {
    title: 'Rize calls you',
    body: "Tap Call me and Rize rings your phone. It's a short call with one good question about your week, in Hindi or English. It tells you up front that it's Rize's AI and that the call is recorded.",
  },
  {
    title: 'It goes in your journal',
    body: 'What you said is kept as a private journal entry. Reread it, delete anything, anytime.',
  },
  {
    title: "Share what's worth sharing",
    body: "When there's a moment worth posting, you get a draft cut from your own sentences, lightly cleaned and never rewritten. Nothing is posted until you approve it.",
  },
]

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="w-full scroll-mt-6 border-t border-hairline"
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 md:py-28">
        <h2 id="how-it-works-title" className="font-instrument text-4xl leading-tight text-ink md:text-5xl">
          How it works
        </h2>
        <ol className="mt-10 grid gap-0 md:mt-14 md:grid-cols-3 md:gap-10">
          {steps.map((step, i) => (
            <li key={step.title} className="border-t border-hairline py-8 md:py-0 md:pt-8">
              <span className="text-sm tabular-nums text-ink-secondary">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 font-instrument text-[1.75rem] leading-tight text-ink">{step.title}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-ink-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default HowItWorks
