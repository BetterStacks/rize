import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { setCookie } from 'cookies-next'
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  Variants,
} from 'framer-motion'
import { Star } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useRef, useState } from 'react'
import ClaimUsernameForm from '../claim-username'
import Logo from '../logo'
import { CreativeAvatar } from '../ui/creative-avatar'
import { ProfileContainer } from '../window'

const heading = 'Own Your Story \n Not Just Your Resume'
const description =
  'Because your journey is more than bullet points. Share your growth,\n projects, and adventures in a way that\'s uniquely you ✨'

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

export const usedByAvatars = [
  'https://i.pinimg.com/736x/6e/81/48/6e8148281a25fb25230a983b09371ae5.jpg',
  'https://i.pinimg.com/736x/59/59/52/5959526847cf6be79778c37505604411.jpg',
  'https://i.pinimg.com/736x/cf/6e/c4/cf6ec445df41899479978aa16f05c996.jpg',
  'https://i.pinimg.com/736x/0d/00/fa/0d00faf7e0a04fe724ecd886df774e4c.jpg',
  'https://i.pinimg.com/736x/af/6c/76/af6c761bac0ef8d3e5f775fe1200b1a9.jpg',
  'https://i.pinimg.com/736x/70/5a/2c/705a2c53fa0b166937c6847410ccb3d5.jpg',
  'https://lh3.googleusercontent.com/a/AEdFTp6zJR7vEcGJmGFt0Gxk2Ech8ic0LGCVTPDTB95lVpg=s256-c',
]

const avatars = [
  'https://i.pinimg.com/736x/6e/81/48/6e8148281a25fb25230a983b09371ae5.jpg',
  'https://i.pinimg.com/736x/59/59/52/5959526847cf6be79778c37505604411.jpg',
  'https://i.pinimg.com/736x/cf/6e/c4/cf6ec445df41899479978aa16f05c996.jpg',
  'https://i.pinimg.com/736x/0d/00/fa/0d00faf7e0a04fe724ecd886df774e4c.jpg',
  'https://i.pinimg.com/736x/af/6c/76/af6c761bac0ef8d3e5f775fe1200b1a9.jpg',
  'https://i.pinimg.com/736x/70/5a/2c/705a2c53fa0b166937c6847410ccb3d5.jpg',
  'https://lh3.googleusercontent.com/a/AEdFTp6zJR7vEcGJmGFt0Gxk2Ech8ic0LGCVTPDTB95lVpg=s256-c',
]
const items = [
  '/mock_profiles/1/image_1.png',
  '/mock_profiles/1/image_2.png',
  '/mock_profiles/1/image_3.png',
  '/mock_profiles/1/image_4.png',
  '/mock_profiles/1/image_5.png',
]

const displayNames = [
  {
    username: 'ashhhwwinnn',
    name: 'Ashwin Parande🌻🌊',
    bio: `Blessed Stressed and Football obsessed 🌱💫
    MUACM Techical Head | Footballer by passion, Creative by destiny`,
    avatar: '/mock_profiles/1/avatar.png',
    gallery: items,
  },
  {
    username: 'haileyvannn',
    banner:
      'https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg',
    name: 'Hailey Van🌻🌊',
    bio: `Blessed Stressed and Football obsessed 🌱💫
    MUACM Techical Head | Footballer by passion, Creative by destiny`,
    avatar:
      'https://i.pinimg.com/736x/94/3e/46/943e468e2193f42206c4640dfec13ea4.jpg',
    gallery: items,
    projects: [
      {
        name: 'pluto.ai',
        link: 'https://pluto.ai',
        description:
          'AI powered platform for creating and managing your own AI agents',
        // image:"https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg"
      },
      {
        name: 'make.ai',
        link: 'https://make.ai',
        description: 'Create your own AI agents with ease',
        // image:"https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg"
      },
    ],
  },
  {
    username: 'singhrajat',
    banner:
      'https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg',
    name: 'Rajat Singh 🍵💫',
    bio: 'Caffe Hoping in Delhi | Fashion Enthusiast | on a mission to redefine style and elegance',
    avatar: avatars[3],
    gallery: [
      'https://i.pinimg.com/736x/d6/c2/e4/d6c2e416f4f5b6f59fad89f6c7f138fe.jpg',
      'https://i.pinimg.com/736x/f6/6b/d6/f66bd6960d1907de075ea330a13d4858.jpg',
      'https://i.pinimg.com/736x/22/34/de/2234ded64d5f3c959017c49c195bc992.jpg',
      'https://i.pinimg.com/736x/97/15/ba/9715bab175b78fa152e11520959c1afc.jpg',
      'https://i.pinimg.com/736x/f5/c8/fa/f5c8fadba5527382a7b28b65f25b4d11.jpg',
    ],
  },
  {
    username: 'linusatwork',
    banner:
      'https://i.pinimg.com/736x/0b/ec/ed/0becedda2022942f1a991eddd04d3b57.jpg',
    name: 'Linus Mathew 🐉🌌',
    bio: 'Content Creator by passion, Developer by profession | Exploring the intersection of technology and creativity',
    avatar: avatars[1],
    writings: [
      {
        title:
          'How to understand hard CS concepts and scale applications using the Black Box method',
        description: 'A journey of self-discovery and growth',
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

const HeroSection = () => {
  const session = useSession()
  const router = useRouter()
  const imageContainerRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isLoggedIn = !!session?.data
  const { scrollYProgress } = useScroll({
    axis: 'y',
    // offset: ["start end", "end end"],
  })

  const [scrolledPastHalf, setScrolledPastHalf] = useState(false)
  const [hasReachedBottom, setHasReachedBottom] = useState<boolean | null>(
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
  const scrollLenghtPerProfile = 100
  const profileContainerHeight = displayNames?.length * scrollLenghtPerProfile

  return (
    <div
      ref={imageContainerRef}
      className={cn(
        'w-full min-h-screen  flex flex-col items-center justify-center  ',
        !isDesktop && 'relative overflow-hidden'
        // isScreen4k && "overflow-auto"
      )}
    >
      {session?.data?.user ? (
        <Link
          className="absolute top-4 right-4"
          prefetch
          href={`/${(session?.data?.user as any)?.username}`}
        >
          <div className="z-50">
            <CreativeAvatar
              src={(session?.data?.user as any)?.profileImage || session?.data?.user?.image || null}
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
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
        </div>
      )}
      <div className="w-fit md:mt-16 mb-32 relative">
        <motion.div className="flex flex-col  items-center justify-center md:mt-24 gap-3 relative">
          <div className="absolute top-24 -left-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-purple-700/60 dark:to-purple-500/60 from-purple-500/80 to-purple-200 " />
          <div className="absolute  top-48 -right-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-blue-700/60 dark:to-blue-500/60 from-blue-500/80 to-blue-200 " />
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
            className="text-4xl font-inter text-black dark:text-white md:text-5xl space-x-2  text-center font-semibold md:font-bold tracking-tighter leading-none relative "
          >
            {heading.split(' ').map((line, index) => {
              const isLast = index === heading.split(' ').length - 1
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
            className="text-center mt-2 font-medium tracking-tight font-inter px-4 md:px-5 text-neutral-600 dark:text-neutral-400 md:leading-tight md:text-lg "
          >
            {description.split('\n').map((line, index) => (
              <motion.span className="" key={index} variants={headingVariants}>
                {line}
                <br className="hidden md:flex" />
              </motion.span>
            ))}
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
                      top: '0.5rem',
                      zIndex: 50,
                    }
                  : { position: 'static', zIndex: 10, y: 0 }
              }
            >
              <ClaimUsernameForm
                onSubmit={handleSubmit}
                className={cn(
                  hideClaimUsernameNavbar &&
                    'shadow-2xl w-fit shadow-black/50  border border-neutral-300/60 dark:border-dark-border/80'
                )}
              />
            </motion.div>
            <div className="w-full flex items-center z-10 justify-center mt-8  ">
              <motion.div
                variants={avatarContainerVariants}
                initial="hidden"
                animate="visible"
                className=" flex -space-x-4"
              >
                {[...usedByAvatars]?.slice(0, 3)?.map((url, index) => {
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.1, zIndex: 20 }}
                      style={{ zIndex: index }}
                      className="size-10 md:size-12 outline outline-2 outline-white saturate-[75%]  dark:border-dark-border bg-white aspect-square rounded-full shadow-xl dark:bg-dark-bg relative overflow-hidden"
                    >
                      <img src={url} style={{ objectFit: 'cover' }} alt="" />
                    </motion.div>
                  )
                })}
              </motion.div>
              <div className="flex flex-col items-start ml-2 gap-x-1">
                <span className="text-neutral-500 font-medium text-sm md:text-base dark:text-neutral-600 ">
                  Trusted by 1000+ users
                </span>
                <div className="flex items-center gap-x-1">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      fill="yellow"
                      className="size-4 stroke-yellow-500"
                    />
                  ))}
                </div>
              </div>
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
        <motion.div className=" rounded-2xl shadow-2xl   bg-white  border  border-neutral-200 dark:border-dark-border md:max-w-5xl aspect-video   w-full ">
          <div className="flex w-full px-4 py-3 items-center justify-start gap-x-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="size-3 md:size-4 bg-neutral-200   rounded-full"
              />
            ))}
          </div>
          <div className="  rounded-b-2xl relative overflow-hidden flex flex-col items-center justify-center w-full h-full">
            <Image
              alt=""
              fill
              draggable={false}
              className="object-cover scale-125"
              src="/minimal3.png"
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
      <h3 className="text-2xl md:text-3xl font-medium tracking-tight leading-tight">
        Rise is for{' '}
        <span className="font-instrument font-thin text-3xl md:text-4xl italic">
          Everyone
        </span>
      </h3>
      <p className="text-neutral-600 text-center dark:text-neutral-400 font-medium mt-2">
        Real people. Diverse stories. One platform to express it all — see how
        creators, professionals, <br className="hidden md:block" /> and dreamers
        showcase their authentic selves on Rize.
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
                'border border-neutral-200 aspect-video flex items-center shadow-xl flex-col dark:bg-neutral-900 dark:border-dark-border rounded-3xl snap-center relative bg-white mr-10',
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
                projects={item.projects as any}
                writings={item.writings as any}
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

{
  /* <div className="absolute top-24 -left-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-purple-700/60 dark:to-purple-500/60 from-purple-500/80 to-purple-200 " />
<div className="absolute  top-48 -right-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-blue-700/60 dark:to-blue-500/60 from-blue-500/80 to-blue-200 " /> */
}

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
