import HeroActions from './hero-actions'

const HeroSection = () => {
  return (
    <section aria-labelledby="hero-title" className="w-full">
      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-28">
        <h1
          id="hero-title"
          className="max-w-3xl font-instrument text-[3.25rem] leading-[0.98] tracking-[-0.01em] text-ink sm:text-7xl md:text-[5.5rem]"
        >
          Your story, in your own words.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary md:mt-8 md:text-xl">
          Rize calls you for a few minutes, asks about your week, and keeps it in a private journal. When
          something&apos;s worth sharing, you get a post made from what you actually said.
        </p>
        <HeroActions />
        <p className="mt-5 text-sm text-ink-secondary">
          Private by default. Nothing is posted until you approve it.
        </p>
      </div>
    </section>
  )
}

export default HeroSection
