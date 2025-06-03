"use client";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import UserReviewCard from "./user-review-card";

const arr = [
  {
    name: "Dan koe",
    img: "https://yt3.googleusercontent.com/B4XuOHeo6s6XAbi85LUXK70itVCivYf63Bw5u1gHz-HmN2-cmgbVvAM_B8j2SAzxtbeYJT4RfA=s900-c-k-c0x00ffffff-no-rj",
    position: "Indie Maker Running $4000\n MRR Saas products remotely ",
    content: `I’ve been using it daily for three\n months now. I shipped in three\n months what my pipeline was for this\n year.`,
  },
  {
    name: "Alex Hormozi",
    img: "https://assets.entrepreneur.com/content/3x2/2000/1675793968-alex.jpg?format=pjeg&auto=webp&crop=1:1",
    position:
      "Freelance UI/UX Designer \n Makes $6000+ in freelancing \n every month.",
    content: `I love tools that allow you to add \n content in an unstructured way but\n find everything back in a structured\n manner. Realm just does that.`,
  },
  {
    name: "Joe Rogan",
    img: "https://pbs.twimg.com/profile_images/552307347851210752/vrXDcTFC_400x400.jpeg",
    position: `Filmmaker & Content Creator\n One of the top 30 travel\n influencers globally`,
    content:
      "It is an immensely underrated tool. It\n can empower the creative process of\n content creators, dump everything\n and never forget",
  },
];
const UserReviews = () => {
  const matches = useMediaQuery(`(min-width: 768px)`, undefined, {
    getInitialValueInEffect: false,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    axis: "y",
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={ref}
      className="w-full px-4 flex relative flex-col mb-10 items-center justify-center"
    >
      <span className="text-3xl md:text-4xl font-semibold md:my-20  mb-6 tracking-tight  leading-none text-center ">
        We Help you own <br className="hidden md:flex" />
        your Story not just your Resume
      </span>
      <motion.div
        layout
        className={cn(
          "w-full",
          matches
            ? "max-w-5xl mt-6 flex space-x-4"
            : "grid grid-cols-1 space-y-4"
        )}
      >
        {arr.map((item, i) => {
          const targetScale = 1 - (arr.length - i) * 0.1;
          const scale = useTransform(
            scrollYProgress,
            [i * 0.35, 1],
            [1, targetScale]
          );
          if (matches) {
            return (
              <motion.div
                key={i}
                initial={{ flex: 1 }}
                whileHover={{ flex: 2 }}
                className="w-full h-full"
                transition={{ duration: 0.4, ease: [0.075, 0.82, 0.165, 1] }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <UserReviewCard
                  {...item}
                  index={i}
                  matches={matches}
                  hovered={hoveredIndex}
                  scrollProgress={scrollYProgress}
                  targetScale={targetScale}
                />
              </motion.div>
            );
          }
          return (
            <motion.div
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                scale: scale,
              }}
              transition={{ duration: 0.2 }}
              className="sticky top-0 w-full h-screen flex items-center justify-center"
            >
              <UserReviewCard
                {...item}
                index={i}
                matches={matches!}
                hovered={hoveredIndex}
                scrollProgress={scrollYProgress}
                targetScale={targetScale}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default UserReviews;
