import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import React, { useRef } from "react";

const TextReveal = () => {
  const imageContainerRef = useRef(null);
  const container = useRef(null);
  const para = `Rize is where authenticity meets aesthetic — craft a profile that feels real, looks premium, and signals credibility`;
  const words = para.split(" ");

  const { scrollYProgress } = useScroll({
    axis: "y",
    target: imageContainerRef,
    offset: ["start 0.9", "start 0.25"],
  });
  const opacity = useTransform(scrollYProgress, [1, 0.7, 0], [1, 0.5, 0]);
  const y = useTransform(scrollYProgress, [1, 0.4, 0], [-100, -40, 0]);

  const MotionImage = motion.create(Image);

  const { scrollYProgress: scrollYTextProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });
  return (
    <section
      ref={imageContainerRef}
      className="w-full px-4 flex  flex-col items-center relative justify-center "
    >
      <MotionImage
        style={{ opacity, y }}
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
  );
};

export default TextReveal;
