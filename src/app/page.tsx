"use client";

import Footer from "@/components/footer";
import HeroSection from "@/components/home/hero";
import UserReviews from "@/components/home/user-reviews";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  availablePlatforms,
  capitalizeFirstLetter,
  cn,
  getIcon,
} from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useAnimation,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";
import { get } from "http";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const imageContainerRef = useRef(null);
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
          transition={{
            ease: [0.12, 0.146, -0.18, 1],
            duration: 0.4,
          }}
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

      <section className="max-w-6xl px-4 md:px-2 mb-20 w-full  grid md:grid-cols-5 md:gap-x-6 gap-y-8">
        {" "}
        {cards.map((card, index) => {
          return (
            <motion.div
              key={index}
              className={cn(
                "bg-white dark:bg-dark-border h-[600px] shadow-lg border border-neutral-300/60 dark:border-none flex flex-col rounded-[2.3rem] w-full overflow-hidden relative ",
                index === 0 && "md:col-span-2",
                index === 1 && "md:col-span-3",
                index === 2 && "md:col-span-3",
                index === 3 && "md:col-span-2"
              )}
            >
              {index === 0 && <Card1 />}
              {index === 1 && <Card4 />}
              {index === 2 && <PolaroidStack />}
              {index === 3 && <Card3 />}
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
const Card1 = () => {
  const [hovered, setHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (hovered) {
      controls.start("animate");
    } else {
      controls.start("initial");
    }
  }, [hovered, controls]);

  const card1Variants: Variants = {
    initial: {
      zIndex: 50,
      rotate: -2,
      x: -40,
    },
    animate: {
      zIndex: 50,
      rotate: -3,
      x: -120,
    },
  };
  const card2Variants: Variants = {
    initial: {
      zIndex: 10,
      rotate: 4,
      y: 12,
      x: 0,
    },
    animate: {
      zIndex: 10,
      rotate: 6,
      y: 18,
      x: 30,
    },
  };

  const cards = [
    {
      id: 1,
      variants: card1Variants,
      style: {
        zIndex: 50,
      },
      username: "ashhhwwinnn",
      image:
        "https://i.pinimg.com/736x/53/ec/98/53ec9845f5a3698945cc4d2735b56102.jpg",
    },
    {
      id: 2,
      style: {
        zIndex: 10,
      },
      variants: card2Variants,
      username: "gary_vee",
      image:
        "https://i.pinimg.com/736x/40/6c/c4/406cc479ae31af226240b2fa7ec4d782.jpg",
    },
  ];
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "w-full group  flex-col h-full flex p-4 items-center justify-center"
      )}
    >
      {/* <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ y: 600 }}
            animate={{ y: 0 }}
            viewport={{ once: false }}
            transition={{
              duration: 0.5,
              type: "spring",
              bounce: 0.4,
            }}
            className="w-full h-full z-10 size-[400px]  -bottom-[50%] transition-all duration-75 absolute bg-gradient-to-t dark:from-purple-700/60 dark:to-blue-500/60 from-blue-500/80 to-blue-200 blur-[100px]   shadow-2xl "
          />
        )}
      </AnimatePresence> */}
      <div className="w-full  pl-16 h-full flex items-center justify-center relative ">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            style={{ ...card.style, borderRadius: "12%" }}
            initial="initial"
            variants={card.variants}
            animate={controls}
            transition={{
              ease: [0.6, 0.05, -0.01, 0.9],
              duration: 0.5,
            }}
            // max-w-[190px] h-[220px]
            className="py-3 px-2 w-1/2 h-[60%] scale-75  border border-neutral-300/60 dark:border-dark-border/60  shadow-xl dark:shadow-2xl  absolute  flex flex-col items-center justify-center bg-neutral-100 dark:bg-dark-bg  "
          >
            <div className="size-20 rounded-full border-[2px] border-neutral-300/60 dark:border-dark-border/80 bg-neutral-300/60 relative overflow-hidden dark:bg-dark-border">
              <Image src={card?.image} fill alt="" className="object-cover " />
            </div>
            <div className="flex flex-col items-center justify-center my-4">
              <span className="text-lg font-medium opacity-70 tracking-tight ">
                @{card.username}
              </span>
              <Skeleton className="h-4 mt-2 rounded-3xl w-3/5 animate-none" />
              <Skeleton className="h-4 mt-2 rounded-3xl w-full animate-none" />
            </div>
          </motion.div>
        ))}
      </div>
      <div className="w-full z-20 px-4 mb-8">
        <h3 className="text-xl font-medium tracking-tight ">
          Grow your audience with Audienceful
        </h3>
        <p className="mt-2 opacity-80">
          Audienceful is email marketing re-invented for the 2020s. It's
          multiplayer, lightweight and setup for best practices by default.
        </p>
      </div>
    </div>
  );
};

function PolaroidStack() {
  const images = [
    {
      id: 1,
      image:
        "https://i.pinimg.com/474x/9a/6e/cf/9a6ecf3d085a7ac187a1fcf33a5743c2.jpg",
    },
    {
      id: 2,
      image:
        "https://i.pinimg.com/474x/0d/41/82/0d4182489818f2bf3fb1a29dc19dae5b.jpg",
    },
    {
      id: 3,
      image:
        "https://i.pinimg.com/474x/68/68/dd/6868ddef0f16ce3e7a8a494bf945729b.jpg",
    },
  ];

  const rotations = [-8, 4, 10]; // Base rotation of each polaroid
  const [hovered, setHovered] = useState(false);
  // Relive your favorite memories by sharing snapshots from your trips and experiences.
  // Every photo tells a story — make your profile truly yours.
  return (
    <div
      className="relative w-full h-full flex p-4 flex-col items-center justify-center cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full h-full mb-20 flex items-center justify-center ">
        {images.map((src, index) => {
          const offset = hovered ? index * 40 : 0;
          const rotate = hovered ? rotations[index] : 0;

          return (
            <motion.div
              key={index}
              className="absolute w-1/2 border border-neutral-200 md:w-[250px] h-3/4 p-1 bg-white  shadow-xl"
              style={{ zIndex: index }}
              initial={{ y: 0, rotate: 0 }}
              animate={{
                y: offset,
                rotate,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.05,
                },
              }}
            >
              <div className="w-full h-3/4 relative border-4 border-white  overflow-hidden">
                <Image
                  src={src?.image}
                  alt={`Polaroid ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="absolute  w-full h-full bg-gradient-to-b from-transparent to-indigo-500/70 dark:to-indigo-500/90"
          />
        )}
      </AnimatePresence>
      <div className="w-full z-20 px-4 mb-8">
        <h3 className="text-xl font-medium tracking-tight ">
          Share your Moments & Memories
        </h3>
        <p className="mt-2 opacity-80">
          Relive your favorite memories by sharing snapshots from your trips and
          experiences.Every photo tells a story — make your profile truly yours.
        </p>
      </div>
    </div>
  );
}

const Card3 = () => {
  const [hovered, setHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (hovered) {
      controls.start("animate");
    } else {
      controls.start("initial");
    }
  }, [hovered, controls]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "w-full group  flex-col h-full flex  items-center justify-center"
      )}
    >
      <div className="w-full flex flex-col gap-y-6 items-center justify-center h-full pt-10 ">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0,
          }}
          className="w-full flex  "
        >
          {[
            ...availablePlatforms,
            ...availablePlatforms,
            ...availablePlatforms.reverse(),
          ].map((card, i) => {
            const icon = getIcon(card);
            return (
              <Button
                key={i}
                size={"lg"}
                className="mx-2 px-6  scale-105 border dark:bg-[#454545] rounded-lg border-neutral-300/60 dark:border-dark-border/80"
              >
                <Image
                  src={`/${icon}`}
                  className="aspect-square size-6"
                  alt={card}
                  width={20}
                  height={20}
                />
                <span className="ml-2 opacity-75  tracking-tight leading-snug mr-2 ">
                  {capitalizeFirstLetter(card)}
                </span>
              </Button>
              // </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          animate={{ x: [-1000, 0] }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0,
          }}
          className="w-full flex  "
        >
          {[
            ...availablePlatforms.reverse(),
            ...availablePlatforms,
            ...availablePlatforms.reverse(),
          ].map((card, i) => {
            const icon = getIcon(card);
            return (
              <Button
                key={i}
                size={"lg"}
                className="mx-2 px-6  scale-105 border dark:bg-[#454545] rounded-lg border-neutral-300/60 dark:border-dark-border/80"
              >
                <Image
                  src={`/${icon}`}
                  className="aspect-square size-6"
                  alt={card}
                  width={20}
                  height={20}
                />
                <span className="ml-2 opacity-75  tracking-tight leading-snug mr-2 ">
                  {capitalizeFirstLetter(card)}
                </span>
              </Button>
              // </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
            repeatDelay: 0,
          }}
          className="w-full flex  "
        >
          {[
            ...availablePlatforms,
            ...availablePlatforms.reverse(),
            ...availablePlatforms,
          ].map((card, i) => {
            const icon = getIcon(card);
            return (
              <Button
                key={i}
                size={"lg"}
                className="mx-2 scale-105 px-6 border dark:bg-[#454545] rounded-lg border-neutral-300/60 dark:border-dark-border/80"
              >
                <Image
                  src={`/${icon}`}
                  className="aspect-square size-6"
                  alt={card}
                  width={20}
                  height={20}
                />
                <span className="ml-2 opacity-75  tracking-tight leading-snug mr-2 ">
                  {capitalizeFirstLetter(card)}
                </span>
              </Button>
              // </motion.div>
            );
          })}
        </motion.div>
      </div>
      <div className="w-full z-20 px-8 mb-8">
        <h3 className="text-xl font-medium tracking-tight ">
          Share your Social Presence
        </h3>
        <p className="mt-2 opacity-80">
          Link all your socials in one place — from GitHub to Instagram. Let
          others discover the real you, across every platform.
        </p>
      </div>
    </div>
  );
};
