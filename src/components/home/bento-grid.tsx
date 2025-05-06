import {
  availablePlatforms,
  capitalizeFirstLetter,
  cn,
  getIcon,
} from "@/lib/utils";
import { AnimatePresence, motion, useAnimation, Variants } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

const BentoGrid = () => {
  return (
    <section className="max-w-6xl px-4 md:px-2 mb-20 w-full  grid md:grid-cols-5 md:gap-x-6 gap-y-8">
      {" "}
      {[...Array.from({ length: 4 })].map((_, index) => {
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
            {index === 0 && <AccountCards />}
            {index === 1 && <ArticleCards />}
            {index === 2 && <PolaroidStack />}
            {index === 3 && <SocialPresense />}
          </motion.div>
        );
      })}
    </section>
  );
};

const ArticleCards = () => {
  const cards = [
    {
      title: "Everything about Framer Motion layout animations",
    },
    {
      title: "Creative Block: Joy Harjo’s Tips to Overcoming Creative Block",
    },
    {
      title: "Building a simple shell in C - Part 1 - Dr. Ehoneah Obed",
    },
  ];

  const [hovered, setHovered] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const card = cards[index];
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full group p-4 h-full flex flex-col items-center justify-center"
    >
      <div className="relative w-full h-full  flex items-center justify-center ">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="absolute max-w-[280px] md:max-w-md z-50 w-full bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border rounded-3xl min-h-[150px] shadow-md p-4 flex items-center flex-col-reverse md:flex-row justify-center  gap-x-2 md:pb-0 pb-6"
          >
            <div className="w-full flex flex-col justify-start items-start px-4">
              <h2 className="md:text-lg font-medium  leading-tight tracking-tight">
                {card.title}
              </h2>
              <span className="opacity-80 text-sm mt-2">
                10 min read • 5 comments
              </span>
            </div>
            <div className="relative w-full md:w-2/5 h-[200px] md:h-[120px] rounded-2xl mb-4  md:rounded-3xl bg-neutral-200 dark:bg-dark-border"></div>
          </motion.div>
        </AnimatePresence>
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
            className="absolute  w-full h-full bg-gradient-to-b from-transparent to-lime-400/60"
          />
        )}
      </AnimatePresence>

      <div className="w-full z-20 px-4 mb-10">
        <h3 className="text-xl font-medium tracking-tight ">
          Write. Reflect. Resonate
        </h3>
        <p className="mt-2 opacity-80">
          Publish thoughtful articles on your interests, stories, and
          experiences. Your words, your voice — shared on your own terms.
        </p>
      </div>
    </div>
  );
};
const AccountCards = () => {
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
          Connect with Peers & Mentors
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

  const rotations = [-8, 4, 10];
  const [hovered, setHovered] = useState(false);

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

const SocialPresense = () => {
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
              <Button key={i} size={"lg"} className="mx-4 px-6  scale-105 ">
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
              <Button key={i} size={"lg"} className="mx-4 px-6  scale-105 ">
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
              <Button key={i} size={"lg"} className="mx-4 px-6  scale-105 ">
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

export default BentoGrid;
