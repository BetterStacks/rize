import { useMediaQuery } from '@mantine/hooks'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import { Initials } from './home/mock-profile-card'

const Join = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const sectionRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    if (sectionRef?.current) {
      setHeight(sectionRef?.current?.offsetHeight)
    }
  }, [])
  return (
    <div style={{ height: `${height * 4}px` }} className="w-full ">
      <section
        ref={sectionRef}
        className="w-full sticky top-0 md:top-20 4k:top-1/3 mb-10 px-4 md:mt-16 max-w-5xl pt-10 md:pt-20 min-h-screen md:min-h-[36rem]  flex flex-col md:flex-row items-center md:items-start  mx-auto "
      >
        <div className="px-4 max-w-2xl flex items-start flex-col">
          <h3 className="font-instrument text-4xl md:text-5xl text-ink leading-[1.05]">
            Start with your name. <br />
            <span className="italic">rize.so/you</span>
            <br /> Then fill it with what&apos;s real.
          </h3>
          <p className="text-ink-secondary leading-snug md:max-w-md w-full text-base md:text-lg mt-6">
            Your link is home for the moments you choose to share: a project
            you shipped, a trip, a week that changed something. Everything else
            stays in your private journal.
          </p>
          <Button
            asChild
            variant="brand"
            className="mt-6 w-fit h-12 md:h-14 rounded-full text-base px-6 md:text-lg font-medium"
          >
            <Link href="/signup">Claim your name</Link>
          </Button>
        </div>
        <div className="w-full flex-1 md:h-full mb-[28rem] md:mb-0  pt-28  md:pt-16 flex items-start relative justify-center">
          <div className=" scale-75 md:scale-[0.8] mr-[200px] ">
            <motion.div
              className="absolute p-2 rounded-[2rem] border bg-surface border-hairline"
              style={{
                scale: 0.9,
                zIndex: 10,
                rotate: 10,
                x: isDesktop ? 140 : 100,
                y: -100,
              }}
            >
              <div className=" w-[220px]  aspect-auto relative p-2 flex flex-col items-center justify-center overflow-hidden h-[300px] rounded-[2rem]">
                <Image
                  alt=""
                  fill
                  src="https://i.pinimg.com/736x/13/1d/a6/131da63c3a20267459f91fc842571a28.jpg"
                  className="z-0 object-cover "
                />
                <div className="bg-surface/90 backdrop-blur-md text-ink h-8 bottom-4 tracking-tight rounded-xl w-[80%] z-10 absolute flex items-center justify-center">
                  @noor_outside
                </div>
              </div>
            </motion.div>
            <motion.div
              className="absolute p-2 rounded-[2rem] border bg-surface border-hairline"
              style={{
                scale: 0.9,
                zIndex: 2,
                x: isDesktop ? 0 : -100,
                y: 60,
                rotate: -3,
                // y: 200,
              }}
            >
              <img
                src="https://i.pinimg.com/736x/d6/c5/80/d6c580c2371fdb09fded07bf026aedf2.jpg"
                alt=""
                className="aspect-square object-cover  size-60 max-w-sm  rounded-[2rem]"
              />
            </motion.div>
            <motion.div
              style={{
                zIndex: 10,
                y: 180,
                x: isDesktop ? 100 : 0,
                rotate: -6,
              }}
              className="absolute p-2 rounded-[2rem] border bg-surface border-hairline"
            >
              <div className="flex flex-col items-center justify-center w-[200px] h-[240px] bg-highlight border border-paper-border rounded-[2rem] ">
                <Initials name="Aarav" className="size-24 text-5xl" />

                <div className="flex flex-col items-center justify-center mt-4 mb-4">
                  <span className="font-instrument text-2xl text-ink leading-none">
                    Aarav
                  </span>
                  <span className="tracking-tight text-ink-secondary dark:text-ink/80 mt-1">
                    @aarav_draws
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Join
