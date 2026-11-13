import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useRef, useState, useMemo } from 'react'

const TextReveal = () => {
  const container = useRef(null)
  const para = 'Rize is where authenticity meets aesthetic, craft a profile that feels real, looks premium, and signals credibility'
  const words = para.split(' ')

  const { scrollYProgress: scrollYTextProgress } = useScroll({
    target: container,
    // offset: ["start start", "end 0.9"],
  })

  // Create a single transform for all words
  const overallOpacity = useTransform(scrollYTextProgress, [0, 1], [0, 1])
  return (
    <motion.section
      ref={container}
      className="w-full  px-4 md:h-[54rem] h-screen  4k:h-[200vh] mb-20  md:mt-10   "
    >
      <motion.section className="w-full md:px-6 px-4 max-w-5xl sticky mb-10 top-1/3 flex md:mx-auto  flex-col items-center justify-center gap-2">
        <motion.p
          layout
          style={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
          className=" w-full text-3xl md:gap-y-1.5 md:text-4xl lg:text-5xl xl:text-6xl font-medium lg:font-semibold xl:font-bold "
        >
          {words.map((line, index) => (
            <Word 
              key={index} 
              opacity={overallOpacity}
              text={line}
              index={index}
              totalWords={words.length}
              scrollProgress={scrollYTextProgress}
            />
          ))}
        </motion.p>
      </motion.section>
    </motion.section>
  )
}

const Word = ({
  opacity,
  text,
  index,
  totalWords,
  scrollProgress,
}: {
  opacity: MotionValue<number>;
  text: string;
  index: number;
  totalWords: number;
  scrollProgress: MotionValue<number>;
}) => {
  const start = index / totalWords
  const end = start + 1 / totalWords
  const wordOpacity = useTransform(scrollProgress, [start, end], [0, 1])
  const words = ['authenticity', 'premium', 'aesthetic', 'credibility']
  const [visible, setVisible] = useState(false)
  useMotionValueEvent(wordOpacity, 'change', (v) => {
    if (words.includes(text)) {
      if (v === 1) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }
  })
  return (
    <span className=" relative">
      <span className="opacity-20 absolute">{text}</span>
      <motion.span style={{ opacity: wordOpacity }} className="mr-2">
        {text}
      </motion.span>
    </span>
  )
}

export default TextReveal

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
