const parts = [
  {
    title: 'Moments you chose to share',
    body: 'Posts from your calls, in your own words.',
  },
  {
    title: 'The things you made',
    body: 'Projects, writing and photos, with links to the real thing.',
  },
  {
    title: 'The usual, if you want it',
    body: "Experience and education are there too. They just aren't the whole story.",
  },
]

const YourProfile = () => {
  return (
    <section aria-labelledby="your-profile-title" className="w-full border-t border-hairline">
      <div className="mx-auto grid w-full max-w-5xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16 md:py-28">
        <div>
          <h2 id="your-profile-title" className="font-instrument text-4xl leading-tight text-ink md:text-5xl">
            A profile that shows what you&apos;ve actually done.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-secondary">
            The moments you share build up on your Rize profile, at your own rize.so link. Over time it says more
            about you than a list of job titles.
          </p>
        </div>
        <ul className="md:pt-2">
          {parts.map((part) => (
            <li key={part.title} className="border-t border-hairline py-6 first:pt-6 last:border-b">
              <h3 className="font-medium text-ink">{part.title}</h3>
              <p className="mt-1.5 leading-relaxed text-ink-secondary">{part.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default YourProfile
