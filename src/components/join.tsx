import { useMediaQuery } from "@mantine/hooks";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

const Join = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const sectionRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (sectionRef?.current) {
      console.log({ h: sectionRef?.current?.offsetHeight });
      setHeight(sectionRef?.current?.offsetHeight);
    }
  }, []);
  return (
    <div style={{ height: `${height * 4}px` }} className="w-full ">
      <section
        ref={sectionRef}
        className="w-full sticky top-0 md:top-20 4k:top-1/3 mb-10 px-4 md:mt-16 max-w-5xl pt-10 md:pt-20 min-h-screen md:min-h-[36rem]  flex flex-col md:flex-row items-center md:items-start  mx-auto "
      >
        <div className="px-4 max-w-2xl flex items-start flex-col">
          <h3 className="text-2xl md:text-3xl font-medium  tracking-tight">
            Join the movement. <br />
            <span className="font-instrument font-thin italic text-3xl md:text-4xl ">
              Claim your name.
            </span>
            <br /> Shape your presence.
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 leading-tight font-medium md:max-w-md w-full text-base md:text-lg mt-6">
            Your identity deserves more than a username on a list. Rize gives
            you a space that reflects who you truly are. Join a growing
            community of bold, intentional creators. It starts with a name —
            yours to own, forever.
          </p>
          <Button className="mt-6 text-white bg-black border-none  w-fit h-12 md:h-14 rounded-full text-base px-6 md:text-lg font-medium md:font-semibold">
            Claim username
          </Button>
        </div>
        <div className="w-full flex-1 md:h-full mb-[28rem] md:mb-0  pt-28  md:pt-16 flex items-start relative justify-center">
          <div className=" scale-75 md:scale-[0.8] mr-[200px] ">
            <motion.div
              className="absolute p-2 rounded-[2rem] border bg-white border-neutral-200 dark:border-dark-border dark:bg-dark-bg"
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
                <div className="bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md text-neutral-800 dark:text-neutral-200 h-8 bottom-4 tracking-tight  rounded-xl w-[80%] z-10 absolute flex items-center justify-center">
                  @beckywasgone
                </div>
              </div>
            </motion.div>
            <motion.div
              className="absolute p-2 rounded-[2rem] border bg-white border-neutral-200 dark:border-dark-border dark:bg-dark-bg"
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
              className="absolute p-2 rounded-[2rem] border bg-white border-neutral-200 dark:border-dark-border dark:bg-dark-bg"
            >
              <div className="flex flex-col items-center justify-center w-[200px] h-[240px] bg-purple-100/80 dark:bg-purple-950/80 backdrop-blur-md border border-purple-200 dark:border-purple-800 rounded-[2rem] ">
                <img
                  src="https://i.pinimg.com/736x/eb/da/ed/ebdaed1c261c9cb22e86481fbb08fa1e.jpg"
                  className="aspect-square object-cover  size-24 max-w-sm  rounded-full"
                />

                <div className="flex flex-col items-center justify-center mt-4 mb-4">
                  <span className="text-xl font-medium tracking-tight ">
                    Solana Imani
                  </span>
                  <span className="tracking-tight opacity-80">
                    @solanaimani
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Join;
