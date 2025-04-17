"use client";

import Footer from "@/components/footer";
import HeroSection from "@/components/home/hero";
import UserReviews from "@/components/home/user-reviews";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function Home() {
  const { theme } = useTheme();
  const imageContainerRef = useRef(null);
  const router = useRouter();
  const session = useSession();
  const container = useRef(null);
  const para = `Audienceful is email marketing re-invented for the 2020s.\n It's multiplayer, lightweight and setup for best practices by default.`;
  const words = para.split(" ");

  const { scrollYProgress } = useScroll({
    axis: "y",
    target: imageContainerRef,
    offset: ["start 0.9", "start 0.25"],
  });
  const opacity = useTransform(scrollYProgress, [1, 0.7, 0], [1, 0.5, 0]);
  const y = useTransform(scrollYProgress, [1, 0.5, 0], [-100, -40, 0]);
  const scale = useTransform(y, [0, -40, -100], [0.7, 0.9, 1]);

  const MotionImage = motion(Image);

  const { scrollYProgress: scrollYTextProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });
  const cards = [
    {
      id: 1,
      title: "Connect with Peers & Mentors",
      description: "This is card 1",
    },
    { id: 2, title: "Live audio with a tap", description: "This is card 2" },
    { id: 3, title: "A new way to have fun", description: "This is card 3" },
    { id: 4, title: "Stay in the loop!", description: "This is card 4" },
  ];

  return (
    <div className="w-full min-h-screen  flex flex-col items-center justify-center">
      <HeroSection />
      <section
        ref={imageContainerRef}
        className="w-full px-4 flex  flex-col items-center relative justify-center "
      >
        <MotionImage
          style={{ opacity, y, scale }}
          src={"/image.png"}
          className="w-full aspect-video border border-neutral-300/60 dark:border-dark-border/80 md:max-w-6xl rounded-xl  ring-[9px] ring-black"
          width={1920}
          height={1080}
          alt=""
        />
        <motion.section
          ref={container}
          className="w-full max-w-6xl flex mb-20  flex-col items-center justify-center gap-2 mt-4"
        >
          <motion.p className=" w-full text-3xl md:text-4xl lg:text-5xl font-medium md:font-semibold flex flex-wrap">
            {words.map((line, index) => {
              const start = index / words.length;

              const end = start + 1 / words.length;
              const opacity = useTransform(
                scrollYTextProgress,
                [start, end],
                [0, 1]
              );
              return (
                <span key={index} className=" relative">
                  <span className="opacity-20 absolute">{line}</span>
                  <motion.span style={{ opacity }} className="mr-2">
                    {line}
                  </motion.span>
                </span>
              );
            })}
          </motion.p>
        </motion.section>
      </section>

      <section className="max-w-6xl px-4 md:px-0 mb-20 w-full md:grid-rows-5 grid md:grid-cols-2 gap-4 md:h-[150vh]">
        {cards.map((card, index) => {
          return (
            <motion.div
              key={index}
              className={cn(
                "bg-white dark:bg-dark-border shadow-lg border border-neutral-300/60 dark:border-none flex flex-col p-4 rounded-[2.3rem] w-full  h-[400px] overflow-hidden relative md:h-full",
                index === 0 && "row-span-2",
                index === 1 && "row-span-3",
                index === 2 && "row-span-3",
                index === 3 && "row-span-2"
              )}
            >
              {index === 3 && <Card4 />}
              {/* <h3 className="text-3xl ">{card?.title}</h3> */}
            </motion.div>
          );
        })}
      </section>
      <UserReviews />
      <Footer />
    </div>
  );
}

const Card4 = () => {
  return (
    <div className="relative w-full group  h-full flex flex-col items-center justify-center">
      {[...Array.from({ length: 3 })].map((_, i) => (
        <motion.div
          key={i}
          animate={{ zIndex: i, scale: 1 + i * 0.12 }}
          className="w-full max-w-[240px] md:max-w-xs -my-8 group-hover:-my-6 transition-all duration-75 ease-in-out drop-shadow-xl border dark:border-dark-border/80 h-[100px] bg-neutral-100 dark:bg-dark-bg  rounded-3xl  flex items-center justify-center flex-wrap gap-2 -space-x-16 "
        >
          {/* {i} */}
        </motion.div>
      ))}
    </div>
  );
};
