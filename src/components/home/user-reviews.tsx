"use client";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import UserReviewCard from "./user-review-card";

const arr = [
  {
    name: "Ravi Teja",
    img: "https://i.pinimg.com/736x/4c/33/7a/4c337a2224e5be2efd77d76fe4b1017c.jpg",
    position: "Indie Maker Running $4000\n MRR Saas products remotely ",
    content: `I’ve been using it daily for three\n months now. I shipped in three\n months what my pipeline was for this\n year.`,
  },
  {
    name: "Emily Rivera",
    img: "https://i.pinimg.com/736x/f3/ae/78/f3ae7877ac2a77dc32ad8aab9a71ba00.jpg",
    position:
      "Freelance UI/UX Designer \n Makes $6000+ in freelancing \n every month.",
    content: `I love tools that allow you to add \n content in an unstructured way but\n find everything back in a structured\n manner. Realm just does that.`,
  },
  {
    name: "Andy To",
    img: "https://i.pinimg.com/736x/9d/96/83/9d96833705d9d5d17e508b905a4f1b7c.jpg",
    position: `Filmmaker & Content Creator\n One of the top 30 travel\n influencers globally`,
    content:
      "It is an immensely underrated tool. It\n can empower the creative process of\n content creators, dump everything\n and never forget",
  },
];
const UserReviews = () => {
  const matches = useMediaQuery(`(min-width: 768px)`, undefined, {
    getInitialValueInEffect: false,
  });
  const [mounted, setMounted] = useState(false);

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
      <span className="text-4xl md:text-5xl text-center font-semibold font-instrument">
        We Help you own <br />
        your Story not just your Resume
      </span>
      <motion.div
        layout
        // style={{
        //   ...(matches ? {maxWidth: "72rem",marginTop:"3rem",display:"flex" , } : { display: "grid",gridTemplateColumns:"" }),
        // }}
        className={cn(
          "w-full",
          matches
            ? "max-w-6xl mt-6 flex space-x-4"
            : "grid grid-cols-1 space-y-4"
        )}
      >
        {arr.map((item, i) => {
          const targetScale = 1 - (arr.length - i) * 0.12;
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
                transition={{ duration: 0.3, ease: "linear" }}
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
