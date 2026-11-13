'use client'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { motion, useInView } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { ReactNode, useRef } from 'react'
import { MockProfileCard, MockProfileWindow } from './home/mock-profile-card'

const Footer = () => {
  // const currentYear = new Date().getFullYear();
  const themeOptions = [
    {
      theme: 'light',
      name: 'Light',
      icon: <Sun className="opacity-80 size-5" strokeWidth={1.3} />,
    },
    {
      theme: 'dark',
      name: 'Dark',
      icon: <Moon className="opacity-80 size-5" strokeWidth={1.3} />,
    },
    {
      theme: 'system',
      name: 'System',
      icon: <Sun className="opacity-80 size-5" strokeWidth={1.3} />,
    },
  ]

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)

  // Collage of example profiles. The three profile mock-ups are drawn in code
  // with made-up names (they used to be screenshots of real people's profiles).
  const assets: {
    src?: string;
    content?: ReactNode;
    className: string;
    style?: Record<string, number>;
    animate: (inView: boolean) => Record<string, number>;
    transition: Record<string, unknown>;
    imgClassName?: string;
  }[] = [
    {
      src: 'https://i.pinimg.com/736x/a9/44/e5/a944e5a03bb1db053832d1ca216d8430.jpg', //image left
      className: 'absolute size-56 bg-surface border border-hairline p-2 right-0 rounded-xl',
      style: { rotate: 10 },
      animate: (inView: boolean) =>
        !inView ? { y: 10, x: 0 } : { y: -300, x: 50 },
      transition: {
        duration: 1,
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        mass: 0.5,
      },
      imgClassName: 'rounded-xl',
    },
    {
      content: (
        <MockProfileWindow
          name="Kabir"
          bio="Building small tools for my college club."
        />
      ),
      className:
        'max-w-md w-full h-[400px] rounded-3xl overflow-hidden absolute border border-hairline bg-surface shadow-float -bottom-10 -right-24',
      animate: (inView: boolean) =>
        !inView ? { y: 300, x: 200, rotate: 4 } : { y: 0, x: 100, rotate: -6 },
      transition: {
        duration: 1,
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        mass: 0.5,
      },
    },
    {
      content: (
        <MockProfileWindow
          name="Nisha"
          bio="Product intern. Writing down every word I didn't know."
        />
      ),
      className:
        'max-w-md w-full h-[400px] rounded-3xl overflow-hidden absolute border border-hairline bg-surface shadow-float -bottom-60 -right-6',
      style: { zIndex: 20 },
      animate: (inView: boolean) =>
        !inView
          ? { y: 300, x: 200, rotate: 2 }
          : { y: -60, x: 100, rotate: -8 },
      transition: {
        duration: 1,
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        mass: 0.5,
      },
    },
    {
      src: 'https://i.pinimg.com/1200x/0e/a1/49/0ea14948a5b50349506e94aeb7261769.jpg', // image right
      className: 'absolute size-56 bg-surface border border-hairline p-2 rounded-xl left-0',
      style: { rotate: -10 },
      animate: (inView: boolean) =>
        !inView ? { y: 10, x: -400 } : { y: -300, x: -10 },
      transition: {
        duration: 1,
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        mass: 0.5,
      },
      imgClassName: 'rounded-xl',
    },
    {
      content: (
        <MockProfileCard
          name="Ira"
          username="ira_plays"
          line="Music on weekends. First open mic, done."
        />
      ),
      className:
        'max-w-xs w-full h-[440px] rounded-3xl overflow-hidden absolute border border-hairline bg-surface shadow-float -left-10',
      animate: (inView: boolean) =>
        !inView
          ? { y: 100, x: -100, rotate: 4 }
          : { y: -60, x: -40, rotate: 6 },
      transition: {
        duration: 1,
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        mass: 0.5,
      },
    },
  ]
  return (
    <footer
      ref={ref}
      className="w-full 4k:max-w-screen-lg flex flex-col items-center justify-center "
    >
      {isDesktop && (
        <>
          {assets.map((asset, idx) => (
            <motion.div
              key={idx}
              style={asset.style}
              animate={
                typeof asset.animate === 'function'
                  ? asset.animate(inView)
                  : asset.animate
              }
              transition={asset.transition}
              className={cn(asset.className, '')}
            >
              {asset.content ?? (
                <img
                  src={asset.src}
                  alt=""
                  style={{ objectFit: 'cover' }}
                  className={asset.imgClassName}
                />
              )}
            </motion.div>
          ))}
        </>
      )}
      {/* <Separator className="w-full h-2 bg-transparent dark:bg-transparent mb-6 border-b border-neutral-600 mt-8" /> */}
      <div className="w-full border-t border-hairline z-50 flex items-center justify-center bg-subtle py-6">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 px-6">
          <span className="text-ink-secondary text-sm md:text-base text-left">
            &copy; {new Date().getFullYear()} Rize
          </span>
          <span className="text-ink-secondary text-sm">
            Your story, in your own words.
          </span>
        </div>
      </div>
    </footer>
  )
}

// <footer className="w-full  py-6 mt-auto">
//   <div className=" mx-auto max-w-6xl px-4">
//     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//       <div className="flex items-center">
//         <Logo className="size-8 rounded-md" />
//         <span className="text-xl ml-4 tracking-tight font-medium ">
//           Rize.so
//         </span>
//       </div>

//       <div className="flex items-center text-sm opacity-80">
//         <Copyright size={12} className="mr-1" />
//         <span>{currentYear} Rize</span>
//       </div>
//     </div>
//   </div>
// </footer>
//   );
// };

export default Footer
