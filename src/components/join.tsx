'use client'

import { setCookie } from 'cookies-next'
import { useRouter } from 'next/navigation'
import ClaimUsernameForm from './claim-username'

// Closing call to action on the landing page: claim a username, then sign up.
// The `username` cookie is read by the sign-up form and onboarding.
const Join = () => {
  const router = useRouter()
  const handleSubmit = (username: string) => {
    setCookie('username', username)
    router.push('/signup')
  }

  return (
    <section id="get-started" aria-labelledby="get-started-title" className="w-full scroll-mt-6 border-t border-hairline">
      <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 md:py-28">
        <div className="max-w-xl">
          <h2 id="get-started-title" className="font-instrument text-4xl leading-tight text-ink md:text-5xl">
            Start with your name.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-secondary">
            Claim your rize.so link, sign up, and your first call is one tap away.
          </p>
          <div className="mt-8">
            <ClaimUsernameForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Join
