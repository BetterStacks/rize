import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

// Example moments: the kind of post a call can turn into. These are not
// reviews or real users. Names are made up and there are no photos or ratings.
const moments = [
  {
    name: 'Meera',
    context: 'design student',
    quote: 'Showed my sketchbook to someone for the first time. She asked to see the next one.',
  },
  {
    name: 'Kabir',
    context: 'second-year CS',
    quote: 'Our club site went live at 2am. Six people used it the next morning, which felt like a lot.',
  },
  {
    name: 'Ira',
    context: 'music on weekends',
    quote: 'First open mic. Forgot the second verse and kept going anyway.',
  },
  {
    name: 'Rohan',
    context: 'first-time founder',
    quote: 'Pitched my idea to my professor. He said no. I\'m building it anyway, just smaller.',
  },
  {
    name: 'Sam',
    context: 'junior developer',
    quote: 'Spent the whole week on one bug. It was a missing comma. Keeping the story.',
  },
  {
    name: 'Tara',
    context: 'illustrator',
    quote: 'Took the long train home and drew every station we passed.',
  },
  {
    name: 'Aditya',
    context: 'self-taught developer',
    quote: 'Taught my mom the app I made for her shop. She found a bug in five minutes.',
  },
  {
    name: 'Nisha',
    context: 'product intern',
    quote: 'First week at the internship. Mostly listening. Wrote down every word I didn\'t know.',
  },
]

const cardTone = ['bg-surface', 'bg-subtle', 'bg-highlight']

const CARD_WIDTH = 320

const UserReviews = () => {
  const rowRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' })
    }
  }
  const handleNext = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full flex flex-col items-center ">
      <div className="px-4 mb-6 w-full max-w-5xl mx-auto">
        <h3 className="font-instrument text-4xl md:text-5xl text-ink leading-tight">
          Small moments, <br />
          <span className="italic">said out loud first</span>
        </h3>
        <p className="mt-2 text-ink-secondary max-w-xl text-left">
          The kind of post a call can turn into: small, specific and yours.
          These are examples. The names are made up.
        </p>
        <Separator className="bg-transparent dark:bg-transparent h-4 border-b-2 border-hairline border-dashed" />
      </div>
      <div className="relative w-full max-w-5xl px-4 mx-auto flex items-center justify-start">
        {/* Edge fades so cards slide in and out softly (same tone as the page) */}
        <div className="w-10 h-full bg-gradient-to-l from-ground via-ground/60 to-transparent absolute z-20 top-0 bottom-0 right-4 md:flex hidden " />
        <div className="w-10 h-full bg-gradient-to-r from-ground via-ground/60 to-transparent absolute z-20 top-0 bottom-0 left-4 md:flex hidden " />

        <div
          ref={rowRef}
          className={'flex gap-4 overflow-x-hidden  scroll-smooth py-2 snap-x snap-mandatory will-change-transform transition-all touch-auto duration-700 no-scrollbar'}
          style={{ scrollBehavior: 'smooth' }}
        >
          {moments.map((m, i) => (
            <figure
              key={m.name}
              className={cn(
                'flex flex-col justify-between rounded-3xl border border-hairline min-w-[240px] max-w-[340px] md:max-w-[280px] p-6 w-full h-[340px] overflow-hidden relative snap-center last:mr-10 text-ink',
                cardTone[i % cardTone.length]
              )}
              style={{ flex: '0 0 320px' }}
            >
              <span className="w-fit text-xs font-medium text-ink-secondary border border-hairline bg-surface rounded-full px-2.5 py-1">
                Example
              </span>
              <blockquote className="font-instrument text-[1.75rem] leading-[1.15] text-ink">
                &ldquo;{m.quote}&rdquo;
              </blockquote>
              <figcaption className="text-sm text-ink-secondary dark:text-ink/80 tracking-tight">
                <span className="text-ink font-medium">{m.name}</span>
                {' · '}
                {m.context}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="w-full px-4 max-w-5xl flex  justify-start items-center mx-auto gap-4 mt-6">
        <Button
          aria-label="Previous moments"
          onClick={handlePrev}
          variant="outline"
          className="size-12 rounded-full"
          size="icon"
        >
          <ArrowLeft strokeWidth={1.8} className="text-ink-secondary" />
        </Button>
        <Button
          aria-label="Next moments"
          onClick={handleNext}
          variant="outline"
          className="size-12 rounded-full"
          size="icon"
        >
          <ArrowRight strokeWidth={1.8} className="text-ink-secondary" />
        </Button>
      </div>
    </div>
  )
}

export default UserReviews
