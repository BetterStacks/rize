import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import {
  AnimatePresence,
  motion,
  PanInfo,
  useAnimation,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";
import { Link2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "../ui/skeleton";

const BentoGrid = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 md:px-2 my-20 w-full ">
      {" "}
      <div className="px-4 flex flex-col items-start justify-center">
        <h3 className="text-2xl md:text-3xl leading-tight  md:font-medium font-medium tracking-tighter">
          Everything You Need <br /> to
          <span className="font-instrument font-thin text-3xl md:text-4xl italic tracking-normal ml-1">
            Tell Your Story
          </span>
        </h3>
        <p className="mt-4 opacity-80 max-w-lg text-left ">
          Whether you’re showcasing work, sharing insights, or building your
          presence — Rize adapts to you, not the other way around.
        </p>
      </div>
      <div className=" grid md:grid-cols-5 mt-12 md:gap-x-6 gap-y-8 w-full">
        {[...Array.from({ length: 5 })].map((_, index) => {
          return (
            <motion.div
              key={index}
              className={cn(
                "bg-white dark:bg-dark-border h-[500px] shadow-lg border border-neutral-300/80 dark:border-none flex flex-col rounded-[2.3rem] w-full overflow-hidden relative ",
                index === 0 && "md:col-span-2 bg-[#e5523f] text-white ",
                index === 1 && "md:col-span-3 bg-[#fef5c2]",
                index === 2 && "md:col-span-3 bg-[#3A0CA3]",
                index === 3 && "md:col-span-2 ",
                index === 4 && "md:col-span-5 h-[450px] "
              )}
            >
              {index === 0 && <AccountCards />}
              {index === 1 && <ArticleCards />}
              {index === 2 && <Analytics />}
              {index === 3 && <GetUniqueLink />}
              {index === 4 && <SocialPresense />}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

const GetUniqueLink = () => {
  const ref = useRef(null);
  const inView = useInView(ref);
  const [open, setOpen] = useState(false);

  const cursorControls = useAnimation();
  const containerControls = useAnimation();

  useEffect(() => {
    if (inView) {
      (async () => {
        await Promise.all([
          cursorControls.start({
            x: 0,
            y: 0,
            transition: {
              delay: 0.5,
              duration: 1.3,
              ease: [0.6, 0.05, -0.01, 0.9],
            },
          }),
          cursorControls.start({
            scale: [0.8, 1.2, 1],
            transition: {
              duration: 0.5,
              ease: "easeIn",
            },
          }),
        ]);
        await Promise.all([
          cursorControls.start({
            opacity: 0,
          }),
          containerControls.start({
            scale: [0.92, 1.2, 1],
            transition: {
              duration: 0.5,
              ease: "easeIn",
            },
          }),
        ]);
        setOpen(true);
        await containerControls.start({
          width: 240,
          height: 280,
          scale: [1.2, 1],
          transition: {
            duration: 0.5,
            type: "spring",
            bounce: 0.4,
          },
        });
      })();
    } else {
      setOpen(false);
      cursorControls.set({
        x: 400,
        opacity: 1,
        scale: 1,
        y: 400,
      });
      containerControls.set({
        width: 220,
        height: "48px",
        x: 0,
        y: 0,
      });
    }
  }, [inView, cursorControls, containerControls]);

  return (
    <div
      ref={ref}
      className="w-full h-full flex p-8  flex-col items-center justify-center"
    >
      <div className="w-full flex flex-col items-start justify-center">
        <h3 className="text-xl font-medium tracking-tight ">
          Get a Unique Link
        </h3>
        <p className="mt-2 opacity-80">
          Get a unique link for your profile. <br /> Share it with your friends
          and family.
        </p>
      </div>
      <div className="w-full h-full flex items-center justify-center relative">
        <motion.div
          animate={containerControls}
          transition={{
            type: "spring",
            bounce: 0.4,
            duration: 0.5,
          }}
          className={cn(
            "flex py-3  justify-center border border-neutral-300 px-4   items-center space-x-2 ",
            open
              ? "rounded-[2rem] flex-col shadow-xl bg-pink-100"
              : "rounded-full bg-pink-50 shadow-lg"
          )}
          // onClick={() => setOpen(!open)}
        >
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
              className="flex mt-4 flex-col text-pink-950 items-center justify-center"
            >
              <img
                className="size-24 rounded-full object-cover mb-4"
                src="https://i.pinimg.com/736x/cf/6e/c4/cf6ec445df41899479978aa16f05c996.jpg"
                alt=""
              />
              <div className="flex flex-col items-start justify-center mb-4">
                <span className="text-xl font-medium tracking-tight ">
                  Katy Ohara
                </span>
                <span className="tracking-tight opacity-80">@katyohara</span>
              </div>
            </motion.div>
          ) : (
            <>
              <Link2 strokeWidth={1.8} className="size-6 stroke-pink-950 " />
              <span className="text-xl opacity-80 text-pink-950 font-medium tracking-tight ">
                rise.so/katyohara
              </span>
            </>
          )}
        </motion.div>
        <motion.div
          style={{ rotate: 6 }}
          initial={{ x: 400, y: 400, scale: 1, opacity: 1 }}
          animate={cursorControls}
          className="absolute size-8 "
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="white"
            className=""
            // strokeWidth={1.2}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.9999 12.9999L18.9999 18.9999M17.964 10.7512L12.9533 12.4531C12.8163 12.4996 12.7478 12.5229 12.6908 12.562C12.6404 12.5967 12.5967 12.6404 12.562 12.6908C12.5229 12.7478 12.4996 12.8163 12.4531 12.9533L10.7512 17.964C10.5402 18.5854 10.4346 18.896 10.2696 18.99C10.1267 19.0713 9.95281 19.0772 9.80468 19.0056C9.63374 18.923 9.50756 18.6201 9.25521 18.0144L3.74699 4.79312C3.51283 4.23109 3.39576 3.95007 3.45272 3.77426C3.50214 3.62172 3.62172 3.50214 3.77426 3.45272C3.95007 3.39576 4.23109 3.51283 4.79312 3.74699L18.0144 9.25521C18.6201 9.50756 18.923 9.63374 19.0056 9.80468C19.0772 9.95281 19.0713 10.1267 18.99 10.2696C18.896 10.4346 18.5854 10.5402 17.964 10.7512Z"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};

const Analytics = () => {
  const bars = [
    {
      height: 60,
    },
    {
      height: 120,
    },
    {
      height: 200,
    },
    {
      height: 160,
    },
  ];

  const Cursor = ({
    className,
    name,
    style,
    reverseDirection = false,
  }: {
    className: string;
    name: string;
    style: any;
    reverseDirection?: boolean;
  }) => {
    return (
      <motion.div
        style={style}
        className={cn(
          "flex flex-col relative px-4 py-2 shadow-2xl border border-neutral-100 shadow-black rounded-full bg-white text-black items-center justify-center",
          className
        )}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          className={cn(
            "size-6 absolute  shadow-2xl shadow-black ",
            reverseDirection
              ? "-right-4 -top-3 rotate-90"
              : "-rotate-2 -left-4 -top-3"
          )}
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.5056 10.7754C21.1225 10.5355 21.431 10.4155 21.5176 10.2459C21.5926 10.099 21.5903 9.92446 21.5115 9.77954C21.4205 9.61226 21.109 9.50044 20.486 9.2768L4.59629 3.5728C4.0866 3.38983 3.83175 3.29835 3.66514 3.35605C3.52029 3.40621 3.40645 3.52004 3.35629 3.6649C3.29859 3.8315 3.39008 4.08635 3.57304 4.59605L9.277 20.4858C9.50064 21.1088 9.61246 21.4203 9.77973 21.5113C9.92465 21.5901 10.0991 21.5924 10.2461 21.5174C10.4157 21.4308 10.5356 21.1223 10.7756 20.5054L13.3724 13.8278C13.4194 13.707 13.4429 13.6466 13.4792 13.5957C13.5114 13.5506 13.5508 13.5112 13.5959 13.479C13.6468 13.4427 13.7072 13.4192 13.828 13.3722L20.5056 10.7754Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="tracking-tight font-medium text-neutral-900">
          {name}
        </span>
      </motion.div>
    );
  };
  const isDesktop = useMediaQuery("(min-width: 768px");
  const isScreen4k = useMediaQuery("(min-width: 2560px)");

  const { scrollYProgress } = useScroll({ axis: "y" });
  const inputRange = isDesktop
    ? isScreen4k
      ? [0.76, 0.84]
      : [0.63, 0.72]
    : [0.58, 0.62];
  const cursorOneX = useTransform(scrollYProgress, inputRange, [200, 100]);
  const cursorOneY = useTransform(scrollYProgress, inputRange, [-300, -40]);
  const cursorTwoX = useTransform(scrollYProgress, inputRange, [-600, -140]);
  const cursorTwoY = useTransform(scrollYProgress, inputRange, [300, -10]);

  return (
    <div className="w-full h-full text-white flex p-4  flex-col items-center justify-center">
      <div className="w-full h-full flex items-end md:items-center pb-6 md:pb-0 justify-center relative">
        <Cursor
          className="absolute "
          name="Ashwin"
          style={{ x: cursorOneX, y: cursorOneY }}
        />
        <Cursor
          reverseDirection
          className="absolute  "
          name="Tanay"
          style={{ x: cursorTwoX, y: cursorTwoY }}
        />
        <motion.div className="flex w-full border-b border-pink-100/40  h-[120px] md:h-[200px] items-end justify-center gap-2">
          {bars.map((bar, i) => {
            return (
              <motion.div
                key={i}
                className="bg-pink-100 rounded-t-xl"
                initial={{ height: 0 }}
                whileInView={{ height: bar.height }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  bounce: 0.4,
                  delay: i * 0.1,
                }}
                style={{ width: 60 }}
              />
            );
          })}
        </motion.div>
      </div>
      <div className="w-full flex px-4 mb-10 flex-col items-start justify-center">
        <h3 className="text-xl font-medium tracking-tight ">
          Track Engagement using Analytics
        </h3>
        <p className="mt-2 opacity-80">
          Track your engagement metrics and see how your profile is performing.
          Get insights on your audience and how to improve your content.
        </p>
      </div>
    </div>
  );
};

const ArticleCards = () => {
  return (
    <div className="relative w-full group h-full p-4 flex flex-col items-center justify-center">
      <div className="relative w-full h-full  flex flex-col items-center justify-center ">
        <AnimatedStackedCards />
      </div>

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
const card1Variants: Variants = {
  initial: {
    zIndex: 20,
    rotate: -2,
    x: -10,
  },
  animate: {
    zIndex: 20,
    rotate: -6,
    x: -60,
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
    x: 50,
  },
};

const cards = [
  {
    id: 1,
    variants: card1Variants,
    style: {
      zIndex: 20,
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
const AccountCards = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (inView) {
      setIsHovered(true);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "w-full group  flex-col h-full flex p-4 items-center justify-center"
      )}
    >
      <div className="w-full z-20 px-4 mt-4 mb-4">
        <h3 className="text-xl font-medium tracking-tight ">
          Connect with Peers & Mentors
        </h3>
        <p className="mt-2 text-white/90">
          Find and connect with peers and mentors who share your interests and
          goals.
        </p>
      </div>
      <div className="w-full  h-full mb-8 flex items-center justify-center relative ">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            style={{ ...card.style, borderRadius: "2rem" }}
            initial={false}
            variants={card.variants}
            animate={isHovered ? "animate" : "initial"}
            transition={{
              ease: [0.6, 0.05, -0.01, 0.9],
              duration: 0.5,
            }}
            className="bg-white dark:bg-dark-bg absolute border border-neutral-200 dark:border-dark-border px-4 py-6 flex flex-col items-center justify-center w-48 shadow-lg rounded-3xl text-black"
          >
            <div className="size-16 lg:size-20 rounded-full border-[2px] border-neutral-300/60 dark:border-dark-border/80 bg-neutral-300/60 relative overflow-hidden dark:bg-dark-border">
              <Image src={card?.image} fill alt="" className="object-cover " />
            </div>
            <div className="flex flex-col items-center justify-center my-4">
              <span className="lg:text-lg text-neutral-800 dark:text-neutral-300 font-medium tracking-tight mb-2 ">
                @{card.username}
              </span>
              <Skeleton className="h-4 mt-2 rounded-3xl w-3/5 animate-none" />
              <Skeleton className="h-4 mt-2 rounded-3xl w-full animate-none" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
}

function CardRotate({ children, onSendToBack }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_: any, info: PanInfo) {
    const threshold = 180;
    if (
      Math.abs(info.offset.x) > threshold ||
      Math.abs(info.offset.y) > threshold
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute  cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export function PolaroidStack() {
  // const [images, setImages] = useState([
  //   {
  //     id: 1,
  //     image:
  //       "https://i.pinimg.com/474x/9a/6e/cf/9a6ecf3d085a7ac187a1fcf33a5743c2.jpg",
  //   },
  //   {
  //     id: 2,
  //     image:
  //       "https://i.pinimg.com/474x/0d/41/82/0d4182489818f2bf3fb1a29dc19dae5b.jpg",
  //   },
  //   {
  //     id: 3,
  //     image:
  //       "https://i.pinimg.com/474x/68/68/dd/6868ddef0f16ce3e7a8a494bf945729b.jpg",
  //   },
  // ]);

  // const rotations = [-6, 4, 10];
  // const [hovered, setHovered] = useState<number | null>(null);
  // const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // const sendToBack = (id: number) => {
  //   setImages((prev) => {
  //     const newCards = [...prev];
  //     const index = newCards.findIndex((card) => card.id === id);
  //     const [card] = newCards.splice(index, 1);
  //     newCards.unshift(card);
  //     return newCards;
  //   });
  // };

  // useEffect(() => {
  //   if (hovered) {
  //     intervalRef.current = setInterval(() => {
  //       sendToBack(hovered);
  //     }, 1000); // every second
  //   } else {
  //     if (intervalRef.current) {
  //       clearInterval(intervalRef.current);
  //       intervalRef.current = null;
  //     }
  //   }

  //   return () => {
  //     if (intervalRef.current) clearInterval(intervalRef.current);
  //   };
  // }, [hovered]);

  // return (
  //   <div className="relative w-full h-full flex p-4 flex-col items-center justify-center cursor-pointer">
  //     <div
  //       className="relative w-full h-full mb-20 flex items-center justify-center"
  //       style={{ perspective: 600 }}
  //     >
  //       {images.map((src, index) => {
  //         const offset = index * 30;
  //         const rotate = rotations[index % rotations.length];

  //         return (
  //           <motion.div
  //             layout
  //             onMouseEnter={() => setHovered(index)}
  //             onMouseLeave={() => setHovered(null)}
  //             key={src?.id}
  //             className="absolute w-1/2 border border-neutral-200 md:w-[250px] h-3/4 p-1 bg-white shadow-xl"
  //             style={{ zIndex: images.length - index }}
  //             initial={false}
  //             animate={{
  //               rotateZ: (images?.length - index - 1) * 4,
  //               // scale: 1 + index * 0.06 - images?.length * 0.06,
  //               transformOrigin: "90% 90%",
  //             }}
  //             transition={{ type: "spring", stiffness: 260, damping: 20 }}
  //           >
  //             <div className="w-full h-3/4 relative border-4 border-white overflow-hidden">
  //               <Image
  //                 src={src.image}
  //                 alt={`Polaroid ${index + 1}`}
  //                 fill
  //                 className="object-cover"
  //               />
  //             </div>
  //           </motion.div>
  //         );
  //       })}
  //     </div>

  //     <div className="w-full z-20 px-4 mb-8">
  //       <h3 className="text-xl font-medium tracking-tight">
  //         Share your Moments & Memories
  //       </h3>
  //       <p className="mt-2 opacity-80">
  //         Relive your favorite memories by sharing snapshots from your trips and
  //         experiences. Every photo tells a story — make your profile truly
  //         yours.
  //       </p>
  //     </div>
  //   </div>  const initialCards = [
  const initialCards = [
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

  const [cards, setCards] = useState(initialCards);
  const rotations = [-8, 4, 10];
  const [hovered, setHovered] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendToBack = (id: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);

      return [...newCards, card];
    });
  };
  useEffect(() => {
    if (hovered) {
      intervalRef.current = setInterval(() => {
        if (cards.length > 0) {
          sendToBack(cards[cards.length - 1].id);
        }
      }, 1000); // every second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, cards]);

  return (
    <div className="relative w-full h-full flex p-4 flex-col items-center justify-center cursor-pointer">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        // style={{ perspective: 600 }}

        className="relative w-full h-full mb-20 flex items-center justify-center"
      >
        <AnimatePresence>
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            return (
              <motion.div
                key={card.id}
                className="absolute w-1/2 border border-neutral-200 md:w-[250px] h-3/4 p-1 bg-white shadow-xl"
                initial={{
                  y: 0,
                  rotate: 0,
                }}
                whileInView={{
                  y: index * 40,
                  zIndex: index,
                  rotate: rotations[index],
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05,
                  },
                }}
                exit={{
                  x: -50,
                  opacity: [1, 0],
                }}
              >
                <div className="w-full h-3/4 relative border-4 border-white overflow-hidden">
                  <Image
                    src={card.image}
                    draggable={false}
                    alt={`Polaroid ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="w-full z-20 px-4 mb-8">
        <h3 className="text-xl font-medium tracking-tight">
          Share your Moments & Memories
        </h3>

        <p className="mt-2 opacity-80">
          Relive your favorite memories by sharing snapshots from your trips and
          experiences. Every photo tells a story — make your profile truly
          yours.{" "}
        </p>
      </div>
    </div>
  );
}

const SocialPresense = () => {
  const target = useRef(null);
  const isScreen4k = useMediaQuery("(min-width: 2560px)");
  const { scrollYProgress } = useScroll({
    axis: "y",
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log(latest);
  });

  const inputRange = isScreen4k ? [0.82, 0.96] : [0.74, 0.84];
  const left = useTransform(scrollYProgress, inputRange, [0, -600]);
  const middle = useTransform(scrollYProgress, inputRange, [0, 600]);
  const right = useTransform(scrollYProgress, inputRange, [0, -600]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const smallX = useTransform(scrollYProgress, inputRange, [-100, -600]);

  // Vibrant and fun gradient theme arrays
  const themes1 = [
    "bg-gradient-to-b from-pink-400 via-pink-300 to-yellow-200",
    "bg-gradient-to-b from-fuchsia-500 via-red-400 to-orange-300",
    "bg-gradient-to-b from-cyan-400 via-blue-400 to-indigo-400",
    "bg-gradient-to-b from-green-400 via-lime-300 to-yellow-200",
    "bg-gradient-to-b from-purple-400 via-pink-400 to-red-300",
  ];
  const themes2 = [
    "bg-gradient-to-b from-orange-400 via-yellow-300 to-lime-200",
    "bg-gradient-to-b from-blue-400 via-cyan-300 to-teal-200",
    "bg-gradient-to-b from-rose-400 via-pink-300 to-fuchsia-300",
    "bg-gradient-to-b from-violet-400 via-indigo-300 to-blue-200",
    "bg-gradient-to-b from-emerald-400 via-green-300 to-lime-200",
  ];
  const themes3 = [
    "bg-gradient-to-b from-yellow-400 via-orange-300 to-pink-300",
    "bg-gradient-to-b from-teal-400 via-cyan-300 to-blue-200",
    "bg-gradient-to-b from-red-400 via-orange-300 to-yellow-200",
    "bg-gradient-to-b from-indigo-400 via-purple-300 to-pink-200",
    "bg-gradient-to-b from-lime-400 via-green-300 to-emerald-200",
  ];

  const ProfileSkeleton = () => {
    return (
      <div className="w-full flex flex-col items-start justify-start gap-4 h-full">
        <Skeleton className="size-16 animate-none rounded-full aspect-square" />
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <Skeleton className="w-full h-4 animate-none" />
          <Skeleton className="w-full h-4 animate-none" />
        </div>
        <Skeleton className="w-full h-full animate-none rounded-2xl" />
      </div>
    );
  };

  return (
    <div
      ref={target}
      className={cn(
        "w-full group   h-full flex flex-col md:flex-row items-center justify-center"
      )}
    >
      <div className="w-full md:max-w-sm h-full z-20 px-8 mt-8 md:mt-16">
        <h3 className="text-xl font-medium tracking-tight ">
          Customize your profile
        </h3>
        <p className="mt-2 opacity-80">
          Customize your profile with a variety of themes and styles.
        </p>
      </div>
      <div className="w-full md:w-full flex-1 flex-col md:flex-row px-6  pb-8 md:pb-0 flex gap-4 items-center justify-center  ">
        <motion.div
          style={isDesktop ? { y: left } : { x: smallX }}
          className="w-full flex flex-row md:flex-col gap-4"
        >
          {[...themes1, ...themes1, ...themes1].map((theme, i) => {
            return (
              <motion.div
                key={i}
                className={cn(
                  "max-w-[240px] shrink-0 p-4 w-full h-[280px] rounded-[2rem] shadow-xl",
                  theme
                )}
              >
                <ProfileSkeleton />
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          style={{ y: middle }}
          className="w-full hidden md:flex md:flex-col gap-4"
        >
          {[...themes2, ...themes2, ...themes2].map((theme, i) => {
            return (
              <motion.div
                key={i}
                className={cn(
                  "max-w-[240px] shrink-0 p-4 w-full h-[280px] rounded-[2rem] shadow-xl",
                  theme
                )}
              >
                <ProfileSkeleton />
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div
          style={{ y: right }}
          className="w-full md:flex   md:flex-col gap-4 hidden "
        >
          {[...themes3, ...themes3, ...themes3].map((theme, i) => {
            return (
              <motion.div
                key={i}
                className={cn(
                  "max-w-[240px] shrink-0 p-4 w-full h-[280px] rounded-[2rem] shadow-xl",
                  theme
                )}
              >
                <ProfileSkeleton />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

type ButtonContainerProps = {
  children: React.ReactNode;
  repeat: number;
  reverse?: boolean;
  duration: number;
};

const ButtonContainer = ({
  children,
  repeat = 4,
  reverse = false,
  duration = 40,
}: ButtonContainerProps) => {
  return (
    <div className="w-full flex items-center  space-x-5  ">
      {[...Array(repeat)].map((_, i) => {
        return (
          <motion.div
            animate={{ x: reverse ? [-1000, 0] : [0, -1000] }}
            transition={{
              duration: duration,
              ease: "linear",
              repeat: Infinity,
              repeatType: "loop",
              repeatDelay: 0,
            }}
            key={i}
            className="w-full flex shrink-0 space-x-2  "
          >
            {children}
          </motion.div>
        );
      })}
    </div>
  );
};

const cardsData = [
  {
    id: 1,
    title: "Everything about Framer Motion layout animations",
    img: "https://i.pinimg.com/736x/6b/ac/8d/6bac8d6b911aff989b875d1de7a5f582.jpg",
  },
  {
    id: 2,
    title: "Creative Block: Joy Harjo’s Tips to Overcoming Creative Block",
    img: "https://i.pinimg.com/736x/93/a1/82/93a1829cb95d180e1c0821b7224b3117.jpg",
  },
  {
    id: 3,
    title: "Building a simple shell in C - Part 1 - Dr. Ehoneah Obed",
    img: "https://i.pinimg.com/736x/68/b4/fb/68b4fbf6972884ea7558f015becb1030.jpg",
  },
];

export function AnimatedStackedCards() {
  const [cards, setCards] = useState(cardsData);
  const [frontIdx, setFrontIdx] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setFrontIdx((prev) => (prev + 1) % cards.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [cards.length]);

  const getStackedCards = () => {
    const arr = [];
    for (let i = 0; i < cards.length; i++) {
      arr.push(cards[(frontIdx + i) % cards.length]);
    }
    return arr;
  };

  const stackedCards = getStackedCards();

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <AnimatePresence initial={false} custom={direction}>
        {stackedCards.map((card, idx) => {
          // Only animate the front and the one going out
          const isFront = idx === 0;
          const z = cards.length - idx;
          return (
            isFront && (
              <motion.div
                key={card.id}
                className="absolute w-[300px] md:w-[400px] h-[120px] md:h-[140px] p-3 bg-white dark:bg-dark-bg flex items-center justify-center rounded-3xl shadow-2xl  border border-neutral-200 dark:border-dark-border"
                style={{ zIndex: z }}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: 40,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { type: "spring", bounce: 0.4, duration: 0.7 },
                }}
                layoutId={`card-${card.id}`}
              >
                <div className="w-[40%] h-full relative rounded-3xl overflow-hidden ">
                  <Image
                    src={card.img}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="w-full flex-1 ml-4 h-full flex flex-col items-center justify-start py-0 md:py-4 ">
                  <h4 className="leading-tight tracking-tight font-medium text-neutral-800 dark:text-neutral-300 mt-3 md:mt-0 line-clamp-3 text-left">
                    {card.title}
                  </h4>
                </div>
              </motion.div>
            )
          );
        })}
        {/* Animate the back card for a subtle effect */}
        {stackedCards.length > 1 && (
          <motion.div
            key={stackedCards[1].id + "-back"}
            className="absolute w-[300px] md:w-[400px] h-[120px] md:h-[140px] p-3 bg-neutral-100 dark:bg-dark-bg flex items-center justify-center rounded-3xl shadow-2xl  border border-neutral-200 dark:border-dark-border"
            style={{ zIndex: 1 }}
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 60,
            }}
            animate={{
              opacity: 0.7,
              scale: 0.92,
              y: 20,
              transition: { type: "spring", bounce: 0.4, duration: 0.7 },
            }}
            exit={{
              opacity: 0,
              scale: 0.7,
              y: 80,
              transition: { duration: 0.5, ease: "easeInOut" },
            }}
            layoutId={`card-${stackedCards[1].id}-back`}
          >
            <div className="w-full h-2/3 relative rounded-xl overflow-hidden mb-4 opacity-60">
              <Image
                src={stackedCards[1].img}
                alt={stackedCards[1].title}
                fill
                className="object-cover"
              />
            </div>
            <h4 className=" tracking-tight leading-tight font-semibold text-left opacity-60">
              {stackedCards[1].title}
            </h4>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BentoGrid;
