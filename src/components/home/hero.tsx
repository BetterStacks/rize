import { cn } from '@/lib/utils'
import { useMediaQuery, useHotkeys } from '@mantine/hooks'
import { setCookie } from 'cookies-next'
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  Variants,
} from 'framer-motion'
import { BookLock, ChevronRight, Lock, PenLine, Phone } from 'lucide-react'
import { useSession } from '@/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useRef, useState } from 'react'
import ClaimUsernameForm from '../claim-username'
import Logo from '../logo'
import { CreativeAvatar } from '../ui/creative-avatar'
import { GalleryTile, ProfileContainer } from '../window'
import { MockProfileWindow } from './mock-profile-card'

const heading = 'Your story, \n in your own words.'
const description =
  'Rize calls you, asks one good question about your week and keeps what you say in a private journal. When something\'s worth sharing, you get a post made from your own words.'

const headingVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.4,
      // staggerChildren: 0.1,
      type: 'spring',
      stiffness: 100,
      damping: 20,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.4,
    y: -50,
  },
}
const imageVariants: Variants = {
  initial: {
    opacity: 0,
    y: -100,
    scale: 0.8,
    rotate: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.75,
      type: 'spring',
      stiffness: 100,
      damping: 20,
      mass: 0.5,
      ease: 'easeInOut',
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
  },
}
const windowVariants: Variants = {
  initial: {
    opacity: 0,
    y: 200,
    scale: 0.8,
    // rotate: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    // rotate: 0,
    transition: {
      duration: 0.75,
      type: 'spring',
      stiffness: 100,
      damping: 20,
      mass: 0.5,
      ease: 'easeInOut',
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
  },
}

const avatarContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 50, rotate: 0 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
}

// Example profiles for the scroll showcase. Names, handles and bios are made up.
// Avatars use initials, not photos. The gallery images are placeholders from Pinterest
// and should be swapped for images we own.
const items: GalleryTile[] = [
  '/mock_profiles/1/image_1.png',
  '/mock_profiles/1/image_2.png',
  { note: 'Showed my sketchbook to someone for the first time.' },
  '/mock_profiles/1/image_4.png',
  '/mock_profiles/1/image_5.png',
]

const displayNames: {
  username: string;
  name: string;
  bio: string;
  avatar: string | null;
  gallery: GalleryTile[];
  projects?: { name: string; link: string; description: string }[];
  writings?: { title: string; description: string; thumbnail: string }[];
}[] = [
  {
    username: 'meera_makes',
    name: 'Meera',
    bio: 'Second-year design student. Sketchbooks, slow mornings and one very good dog.',
    avatar: null,
    gallery: items,
  },
  {
    username: 'kabir_builds',
    name: 'Kabir',
    bio: 'Building small tools for my college club. Shipping things, breaking things, talking about both.',
    avatar: null,
    gallery: items,
    projects: [
      {
        name: 'Hostel lost & found',
        link: '',
        description:
          'A tiny site our hostel uses to return lost things. Built over one long weekend.',
      },
      {
        name: 'Mess menu bot',
        link: '',
        description: 'Sends the day\'s menu to forty friends every morning. Mostly for me.',
      },
    ],
  },
  {
    username: 'tara_wears',
    name: 'Tara',
    bio: 'Café hopping in Delhi, thrifting on weekends, styling my friends for free.',
    avatar: null,
    gallery: [
      'https://i.pinimg.com/736x/d6/c2/e4/d6c2e416f4f5b6f59fad89f6c7f138fe.jpg',
      'https://i.pinimg.com/736x/f6/6b/d6/f66bd6960d1907de075ea330a13d4858.jpg',
      'https://i.pinimg.com/736x/22/34/de/2234ded64d5f3c959017c49c195bc992.jpg',
      'https://i.pinimg.com/736x/97/15/ba/9715bab175b78fa152e11520959c1afc.jpg',
      'https://i.pinimg.com/736x/f5/c8/fa/f5c8fadba5527382a7b28b65f25b4d11.jpg',
    ],
  },
  {
    username: 'dev_after_dark',
    name: 'Dev',
    bio: 'Developer by day, making videos about it at night. Mostly about getting stuck and unstuck.',
    avatar: null,
    writings: [
      {
        title: 'The week recursion finally clicked (on a bus, of all places)',
        description: 'A post from one of my calls',
        thumbnail:
          'https://i.pinimg.com/736x/11/25/7b/11257b84f71336ba7e78574d24189fc2.jpg',
      },
    ],
    gallery: [
      'https://i.pinimg.com/736x/28/8b/98/288b982eee2d40f2ef71b93d4caf8d57.jpg',
      'https://i.pinimg.com/736x/2e/1b/d5/2e1bd5c453aa330eb1e2b064a13bc883.jpg',
      'https://i.pinimg.com/736x/91/fc/87/91fc87e5cc959c89d44f88f80c0c41be.jpg',
      'https://i.pinimg.com/736x/76/c2/c5/76c2c5c95df07c3070c7de0ca9b312c7.jpg',
      'https://i.pinimg.com/736x/a8/4f/2b/a84f2bffe3cb7ce568da6c88f60770ca.jpg',
    ],
  },
]

// What the hero promises, in three small steps (replaces the old avatar stack).
const steps = [
  { icon: Phone, label: 'Rize calls you' },
  { icon: BookLock, label: 'It stays in your journal' },
  { icon: PenLine, label: 'You approve what goes public' },
]

const HeroSection = () => {
  const session = useSession()
  const router = useRouter()
  const imageContainerRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isLoggedIn = !!session?.data
  const isSessionLoading = session.isLoading
  const { scrollYProgress } = useScroll({
    axis: 'y',
    // offset: ["start end", "end end"],
  })

  const [scrolledPastHalf, setScrolledPastHalf] = useState(false)
  const [hasReachedBottom] = useState<boolean | null>(
    null
  )
  const isScreen4k = useMediaQuery('(min-width: 2560px)')
  const [insideProfileContainer, setInsideProfileContainer] = useState(false)

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    setInsideProfileContainer(latest >= 0.09)
    if (isDesktop) {
      setScrolledPastHalf(latest >= 0.22 && latest < 0.95)
    } else {
      setScrolledPastHalf(latest > 0.14 && latest < 0.95)
    }
  })

  const hideClaimUsernameNavbar =
    (!isLoggedIn && scrolledPastHalf) || hasReachedBottom

  const x = useTransform(
    scrollYProgress,
    [0.12, isScreen4k ? 0.39 : 0.3021],
    [isScreen4k ? 0 : 240, isScreen4k ? -4632 : -2800]
  )

  const handleSubmit = (data: string) => {
    setCookie('username', data)
    router.push('/signup')
  }

  const handleGoToDashboard = () => {
    router.push(`/${session?.data?.user?.username || 'profile'}`)
  }

  // Add hotkey for logged-in users to go to dashboard
  useHotkeys([['Enter', handleGoToDashboard]], [], !isLoggedIn)
  const scrollLenghtPerProfile = 100
  const profileContainerHeight = displayNames?.length * scrollLenghtPerProfile

  return (
    <div
      ref={imageContainerRef}
      className={cn(
        'w-full min-h-screen  flex flex-col items-center justify-center  ',
        !isDesktop && 'relative overflow-hidden',
        // isScreen4k && "overflow-auto"
      )}
    >
      {isSessionLoading ? (
        <div className="absolute top-4 right-4 z-50">
          <div className="size-10 md:size-12 rounded-full bg-subtle animate-pulse" />
        </div>
      ) : session?.data?.user ? (
        <Link
          className="absolute top-4 right-4 z-50"
          prefetch
          href={`/${session?.data?.user?.username || 'profile'}`}
        >
          <div className="z-50">
            <CreativeAvatar
              src={session?.data?.user?.profileImage || session?.data?.user?.image || null}
              name={session?.data?.user?.name || 'User'}
              size="md"
              variant="auto"
              showHoverEffect={false}
            />
          </div>
        </Link>
      ) : (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink rounded-lg transition-colors duration-fast ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-ink text-on-ink rounded-lg hover:opacity-90 transition-opacity duration-fast ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
          >
            Sign up
          </Link>
        </div>
      )}
      <div className="w-fit md:mt-16 mb-32 relative">
        <motion.div className="flex flex-col  items-center justify-center md:mt-24 gap-3 relative">
          <motion.div
            className="mb-3 md:mb-6 relative overflow-hidden size-12 md:size-14"
            variants={imageVariants}
            initial="initial"
            animate="animate"
          // animate={logoControls}
          >
            <Logo className="size-12 md:size-14" />
          </motion.div>
          <motion.h1
            variants={headingVariants}
            initial="initial"
            animate="animate"
            className="text-5xl font-instrument text-ink md:text-7xl space-x-2 text-center font-normal tracking-tight leading-[0.95] relative "
          >
            {heading.split(' ').map((line, index) => {
              return (
                <motion.span key={index} variants={headingVariants}>
                  {line}

                  {line === '\n' && <br />}
                </motion.span>
              )
            })}
          </motion.h1>
          <motion.p
            variants={headingVariants}
            initial="initial"
            animate="animate"
            className="text-center mt-3 max-w-[36rem] text-balance tracking-tight font-inter px-4 md:px-5 text-ink-secondary text-base leading-snug md:text-lg"
          >
            {description}
          </motion.p>
          <motion.div
            variants={headingVariants}
            initial="initial"
            animate="animate"
            className={cn(
              'px-3 sm:px-0 w-full flex flex-col items-center justify-center'
            )}
          >
            {' '}
            <motion.div
              initial={{
                position: 'static',
                y: 0,
              }}
              animate={
                hideClaimUsernameNavbar
                  ? {
                    position: 'fixed',
                    bottom: '1rem',
                    zIndex: 50,
                  }
                  : { position: 'static', zIndex: 10, y: 0 }
              }
            >
              {isLoggedIn ? (
                <div
                  className={cn(
                    'w-full border mt-2 border-hairline overflow-hidden rounded-3xl text-lg md:text-xl p-1 flex items-center justify-center bg-surface',
                    hideClaimUsernameNavbar && 'shadow-float w-fit'
                  )}
                >
                  <div className="px-4 ml-0.5 border border-hairline py-1 bg-subtle rounded-3xl">
                    <button
                      onClick={handleGoToDashboard}
                      className="tracking-tight text-ink text-base flex items-center gap-2 py-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                    >
                      Go to your profile
                      <kbd className="px-2 py-0.5 text-xs font-medium text-ink-secondary bg-surface rounded border border-hairline">
                        Enter
                      </kbd>
                    </button>
                  </div>
                </div>
              ) : (
                <ClaimUsernameForm
                  onSubmit={handleSubmit}
                  className={cn(
                    hideClaimUsernameNavbar && 'shadow-float w-fit'
                  )}
                />
              )}
            </motion.div>
            <div className="w-full flex flex-col items-center z-10 justify-center mt-8 gap-3">
              <motion.ol
                variants={avatarContainerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-1"
                aria-label="How Rize works"
              >
                {steps.map(({ icon: Icon, label }, index) => {
                  return (
                    <motion.li
                      key={label}
                      variants={itemVariants}
                      className="flex items-center gap-2"
                    >
                      {index > 0 && (
                        <ChevronRight
                          aria-hidden="true"
                          strokeWidth={1.6}
                          className="hidden sm:block size-4 text-ink-secondary/60 mx-1"
                        />
                      )}
                      <span
                        className={cn(
                          'size-9 shrink-0 rounded-full flex items-center justify-center',
                          index === 0
                            ? 'bg-brand text-brand-ink ring-1 ring-ink/10'
                            : 'bg-surface text-ink border border-hairline'
                        )}
                      >
                        <Icon aria-hidden="true" strokeWidth={1.6} className="size-4" />
                      </span>
                      <span className="text-sm md:text-[15px] text-ink font-medium whitespace-nowrap">
                        {label}
                      </span>
                    </motion.li>
                  )
                })}
              </motion.ol>
              <p className="text-ink-secondary text-sm flex items-center gap-1.5">
                <Lock aria-hidden="true" strokeWidth={1.8} className="size-3.5" />
                Private by default. Nothing goes public until you say so.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div
        style={{ height: `${profileContainerHeight}vh` }}
        className=" hidden mt-10 w-full lg:flex flex-col justify-start  "
      >
        {isScreen4k ? (
          <div className="w-full sticky h-[80vh] top-32 px-4 ">
            <ScrollableProfileSectionHeader />
            <ScrollableProfileContainer
              insideContainer={insideProfileContainer}
              isScreen4k={isScreen4k as boolean}
              scrollYProgress={scrollYProgress}
              x={x}
            />
          </div>
        ) : (
          <>
            <ScrollableProfileSectionHeader />
            <ScrollableProfileContainer
              insideContainer={insideProfileContainer}
              isScreen4k={isScreen4k as boolean}
              scrollYProgress={scrollYProgress}
              x={x}
            />
          </>
        )}
      </div>

      <motion.div
        variants={windowVariants}
        animate="animate"
        initial="initial"
        className=" p-4 w-full h-screen  flex md:hidden  absolute -bottom-[45%]  items-center justify-center"
      >
        <motion.div className=" rounded-2xl shadow-float bg-surface border border-hairline md:max-w-5xl aspect-video w-full ">
          <div className="flex w-full px-4 py-3 items-center justify-start gap-x-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="size-3 md:size-4 bg-subtle border border-hairline rounded-full"
              />
            ))}
          </div>
          <div className="  rounded-b-2xl relative overflow-hidden flex flex-col items-center justify-center w-full h-full">
            <MockProfileWindow
              name="Meera"
              bio="Second-year design student. Sketchbooks, slow mornings and one very good dog."
              className="absolute inset-0 px-6 py-4"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

type TScrollableProfileContainerProps = {
  insideContainer: boolean;
  isScreen4k: boolean;
  x: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
};

const ScrollableProfileSectionHeader = () => {
  return (
    <div className="max-w-5xl flex flex-col items-center justify-center  w-full mx-auto px-4 mb-10">
      <h3 className="font-instrument text-4xl md:text-5xl text-ink leading-tight text-center">
        Profiles made of <span className="italic">moments</span>
      </h3>
      <p className="text-ink-secondary text-center mt-2 max-w-xl">
        Not just job titles. What you made, where you went and the weeks that
        mattered, shared because you chose to.
      </p>
      <p className="text-ink-secondary/80 text-center text-sm mt-2">
        Example profiles. The names are made up.
      </p>
    </div>
  )
}

const ScrollableProfileContainer: FC<TScrollableProfileContainerProps> = ({
  insideContainer,
  isScreen4k,
  scrollYProgress,
  x,
}) => {
  return (
    <div
      style={{
        ...(!isScreen4k && {
          position: 'sticky',
          top: '2.5rem',
        }),
      }}
      className="w-full  overflow-x-clip flex h-screen 4k:h-fit "
    >
      <motion.div style={{ x }} className="w-full  flex  ">
        {displayNames.map((item, index) => {
          return (
            <motion.div
              key={index}
              className={cn(
                'border border-hairline aspect-video flex items-center shadow-float flex-col rounded-3xl snap-center relative bg-surface text-ink mr-10',
                'max-w-screen-md lg:max-w-screen-lg 4k:rounded-[3rem] 4k:pt-10 4k:max-w-screen-2xl 4k:min-h-[900px] h-[600px] w-full flex-shrink-0',
                insideContainer && 'overflow-hidden'
              )}
            >
              <ProfileContainer
                isFirst={index === 0}
                avatar={item.avatar}
                name={item.name}
                bio={item.bio}
                gallery={item.gallery}
                username={item.username}
                projects={item.projects}
                writings={item.writings}
                scrollYProgress={scrollYProgress}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default HeroSection

const SquigglyLine = ({
  x1,
  y1,
  x2,
  y2,
  frequency,
  amplitude,
  stroke,
  strokeWidth,
}: any) => {
  const points = []
  const segmentLength = 10 // Adjust for smoother/more jagged waves
  const numSegments = Math.ceil(
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / segmentLength
  )

  for (let i = 0; i <= numSegments; i++) {
    const progress = i / numSegments
    const x = x1 + (x2 - x1) * progress
    const y =
      y1 +
      (y2 - y1) * progress +
      Math.sin(progress * frequency * 2 * Math.PI) * amplitude
    points.push(`${x},${y}`)
  }

  return (
    <svg height="200" width="500">
      <path
        d={`M${points.join(' L')}`}
        stroke={stroke || 'black'}
        strokeWidth={strokeWidth || 2}
        fill="transparent"
      />
    </svg>
  )
}
