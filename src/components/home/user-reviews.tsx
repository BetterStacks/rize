import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const testimonials = [
  {
    name: 'Aanya Deshmukh',
    quote: 'Finally, a profile that actually feels like me.',
    image:
      'https://i.pinimg.com/736x/b1/c6/69/b1c66934ed60a3593e3a126ceec2ae16.jpg',
  },
  {
    name: 'Liam O\'Sullivan',
    quote: 'Rize made my portfolio *mine* again.',
    image:
      'https://i.pinimg.com/736x/99/c5/9a/99c59a135ffd76b663996c503985b755.jpg',
  },
  {
    name: 'Mei-Ling Zhang',
    quote: 'Clean, elegant, and incredibly personal.',
    image:
      'https://i.pinimg.com/736x/14/2a/67/142a673cd5af47931717d60a18c868fc.jpg',
  },
  {
    name: 'Diego Fernández',
    quote: 'Feels more human than LinkedIn.',
    image:
      'https://i.pinimg.com/736x/1e/ef/78/1eef78fb4a3dcb7e70c0b81681e898f8.jpg',
  },
  {
    name: 'Fatima Al-Sayed',
    quote: 'Tells my story, not just my job.',
    image:
      'https://i.pinimg.com/736x/f8/25/c6/f825c6ec6c59640b7481e41616234da4.jpg',
  },
  {
    name: 'Jonas Müller',
    quote: 'Exactly what I needed to stand out.',
    image:
      'https://i.pinimg.com/736x/c5/ce/d2/c5ced2733049260438d54184a55fa7d8.jpg',
  },
  {
    name: 'Ayodele Okafor',
    quote: 'Simple, authentic, and powerful.',
    image:
      'https://i.pinimg.com/736x/4a/e4/5b/4ae45b3560cc11438ac63ad43344d25e.jpg',
  },
  {
    name: 'Sofia Rossi',
    quote: 'Built my profile in minutes!',
    image:
      'https://i.pinimg.com/736x/a9/f3/f3/a9f3f3a2ee3d1a66adc533df0ded06b4.jpg',
  },
  {
    name: 'Noah Kim',
    quote: 'My digital self, beautifully displayed.',
    image:
      'https://i.pinimg.com/736x/ae/55/42/ae554214d29bbb91b0f0df13c82f40da.jpg',
  },
  {
    name: 'Zahra El-Masri',
    quote: 'No fluff. Just me.',
    image:
      'https://i.pinimg.com/736x/fd/49/bf/fd49bff8fa06fa1cbcc9e1e1d06151db.jpg',
  },
]

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
        <h3 className="text-2xl md:text-3xl leading-tight  md:font-medium mx-auto font-medium tracking-tighter">
          Profiles that Speak. <br /> People that{' '}
          <span className="font-instrument font-thin text-3xl md:text-4xl italic tracking-normal">
            Rize
          </span>
        </h3>
        <p className="mt-2 opacity-80 max-w-xl text-left">
          Don’t take our word for it — see how the community is using Rize to
          tell their stories their way.
        </p>
        <Separator className="bg-transparent dark:bg-transparent dark:border-dark-border h-4 border-b-2 border-neutral-300 border-dashed" />
      </div>
      <div className="relative w-full max-w-5xl px-4 mx-auto flex items-center justify-start">
        <div className="w-10 h-full bg-gradient-to-l dark:from-dark-bg dark:via-dark-bg/60 from-white via-white/60 to-transparent absolute z-20 top-0 bottom-0 right-4 md:flex hidden " />
        <div className="w-10 h-full bg-gradient-to-r dark:from-dark-bg dark:via-dark-bg/60 from-white via-white/60 to-transparent absolute z-20 top-0 bottom-0 left-4 md:flex hidden " />

        <div
          ref={rowRef}
          className={'flex gap-4 overflow-x-hidden  scroll-smooth py-2 snap-x snap-mandatory will-change-transform transition-all touch-auto duration-700 no-scrollbar'}
          style={{ scrollBehavior: 'smooth' }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex group flex-col  justify-end items-center rounded-3xl shadow-md border border-neutral-200 dark:border-neutral-800 min-w-[240px] max-w-[340px] md:max-w-[280px] px-2 w-full h-[340px] overflow-hidden relative snap-center last:mr-10"
              style={{ flex: '0 0 320px' }}
            >
              {/* Placeholder for image */}
              <Image
                fill
                src={t.image}
                className="w-full h-full object-cover"
                style={{ objectFit: 'cover' }}
                alt=""
              />
              <div className=" z-10 h-[120px] w-full bg-white/90 backdrop-blur-md dark:bg-dark-bg/80 rounded-2xl mb-2  px-6 py-6 flex flex-col justify-between items-start">
                <div className="text-base font-medium tracking-tight font-inter leading-tight text-neutral-900 dark:text-white mb-2">
                  {t.quote}
                </div>
                <div className="text-sm text-neutral-600 tracking-tight dark:text-neutral-400 font-medium">
                  {t.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full px-4 max-w-5xl flex  justify-start items-center mx-auto gap-4 mt-6">
        <Button
          aria-label="Previous"
          onClick={handlePrev}
          variant="outline"
          className="size-12 rounded-full border-neutral-300 bg-white"
          size="icon"
        >
          <ArrowLeft strokeWidth={1.8} className="stroke-neutral-400" />
        </Button>
        <Button
          aria-label="Next"
          onClick={handleNext}
          variant="outline"
          className="size-12 rounded-full border-neutral-300 bg-white"
          size="icon"
        >
          <ArrowRight strokeWidth={1.8} className="stroke-neutral-400" />
        </Button>
      </div>
    </div>
  )
}

export default UserReviews
