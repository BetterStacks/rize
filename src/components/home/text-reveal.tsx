import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

const TextReveal = () => {
  const container = useRef(null);
  const para = `Rize is where authenticity meets aesthetic — craft a profile that feels real, looks premium, and signals credibility`;
  const words = para.split(" ");

  const { scrollYProgress: scrollYTextProgress } = useScroll({
    target: container,
    offset: ["start 0.7", "start 0.2"],
  });
  return (
    <section className="w-full  px-4 md:h-screen sm:h-[60vh] h-fit  md:mt-0   md:pt-20 flex  flex-col items-center relative justify-start ">
      <motion.section
        ref={container}
        className="w-full max-w-5xl sticky top-10 md:top-[100px] flex mb-20 ml-6 md:ml-0 flex-col items-center justify-center gap-2 mt-4"
      >
        <motion.p
          layout
          style={{
            display: "flex",
            flexWrap: "wrap",
          }}
          className=" w-full text-3xl md:gap-y-1.5 md:text-4xl lg:text-5xl font-medium "
        >
          {words.map((line, index) => {
            const start = index / words.length;

            const end = start + 1 / words.length;
            const opacity = useTransform(
              scrollYTextProgress,
              [start, end],
              [0, 1]
            );
            return <Word key={index} opacity={opacity} text={line} />;
          })}
        </motion.p>
      </motion.section>
    </section>
  );
};

const Word = ({
  opacity,
  text,
}: {
  opacity: MotionValue<number>;
  text: string;
}) => {
  const words = ["authenticity", "premium", "aesthetic", "credibility"];
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(opacity, "change", (v) => {
    if (words.includes(text)) {
      if (v === 1) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
  });
  return (
    <span className=" relative">
      <span className="opacity-20 absolute">{text}</span>
      <motion.span style={{ opacity }} className="mr-2">
        {text}
      </motion.span>
    </span>
  );
};

export default TextReveal;

{
  /* <AnimatePresence>
  {visible && (
    <motion.div
      animate={{ opacity: 1, rotate: -6 }}
      exit={{ opacity: 0, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className="size-14 relative  mr-2 bg-white shadow-xl border border-neutral-300/90 rounded-xl"
    >
      <div className="flex  absolute w-full px-4 py-3 items-center justify-start gap-x-2">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="size-2 bg-neutral-200  dark:bg-dark-border rounded-full"
          />
        ))}
      </div>
    </motion.div>
  )}
</AnimatePresence> */
}
