import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { setCookie } from "cookies-next";
import {
  motion,
  useAnimation,
  useMotionValueEvent,
  useScroll,
  Variants,
} from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ClaimUsernameForm from "../claim-username";
import Logo from "../logo";

const heading = "Own Your Story \n Not Just Your Resume";
const description =
  "Because your journey is more than bullet points. Share your growth,\n projects, and adventures in a way that's uniquely you ✨";

const headingVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.4,
      // staggerChildren: 0.1,
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.4,
    y: -50,
  },
};
const imageVariants: Variants = {
  initial: {
    opacity: 0,
    y: -100,
    scale: 0.8,
    rotate: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.75,
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 0.5,
      ease: "easeInOut",
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
  },
};
const windowVariants: Variants = {
  initial: {
    opacity: 0,
    y: 200,
    scale: 0.8,
    // rotate: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    // rotate: 0,
    transition: {
      duration: 0.75,
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 0.5,
      ease: "easeInOut",
      delay: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
  },
};
const socialLinksVariants: Record<number, Variants> = {
  0: {
    initial: {
      position: "absolute",
      y: -680,
      x: 700,
      rotate: -16,
    },
    animate: {
      position: "relative",
      rotate: 0,
      y: 0,
      x: 0,
    },
  },
  1: {
    initial: {
      y: -680,
      x: -200,
      rotate: 16,
      position: "absolute",
    },
    animate: {
      position: "relative",
      y: 0,
      x: 0,
      rotate: 0,
    },
  },
  2: {
    initial: {
      y: -800,
      rotate: 12,
      x: 600,
      position: "absolute",
    },
    animate: {
      position: "relative",
      y: 0,
      x: 0,
      rotate: 0,
    },
  },
  3: {
    initial: {
      y: -800,
      x: -100,
      rotate: -12,
      position: "absolute",
    },
    animate: {
      position: "relative",
      rotate: 0,
      y: 0,
      x: 0,
    },
  },
  4: {
    initial: {
      y: -500,
      x: 600,
      rotate: -12,
      position: "absolute",
    },
    animate: {
      rotate: 0,
      position: "relative",
      y: 0,
      x: 0,
    },
  },
  5: {
    initial: {
      y: -500,
      x: -100,
      rotate: 12,
      position: "absolute",
    },
    animate: {
      rotate: 0,
      position: "relative",
      y: 0,
      x: 0,
    },
  },
};
const HeroSection = () => {
  const session = useSession();
  const router = useRouter();
  const imageContainerRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isLoggedIn = session?.status === "authenticated";
  const { scrollYProgress } = useScroll({
    axis: "y",
    offset: ["start end", "end end"],
  });

  const [scrolledPastHalf, setScrolledPastHalf] = useState(false);

  const control = useAnimation();
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.8) {
      control.start("animate");
    } else {
      control.start("initial");
    }
    setScrolledPastHalf(isDesktop ? latest > 0.22 : latest > 0.14);
  });

  const handleSubmit = (data: string) => {
    setCookie("username", data);
    router.push(`/signup`);
  };

  return (
    <div
      ref={imageContainerRef}
      className=" w-full h-screen md:min-h-[160vh]   flex flex-col items-center justify-start overflow-hidden"
    >
      {session?.data?.user && (
        <Link
          className="absolute top-4 right-4"
          prefetch
          href={`/${session?.data?.user?.username}`}
        >
          <div className="relative rounded-full overflow-hidden aspect-square size-10 md:size-12  z-50 flex items-center gap-2">
            <Image
              src={
                (session?.data?.user?.profileImage ||
                  session?.data?.user?.image) as string
              }
              alt={`${session?.data?.user?.name} profile image`}
              className="object-cover"
              priority
              fill
            />
          </div>
        </Link>
      )}

      <motion.div className="flex flex-col items-center justify-center mt-24 gap-3 relative">
        <div className="absolute top-24 -left-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-purple-700/60 dark:to-purple-500/60 from-purple-500/80 to-purple-200 " />
        <div className="absolute  top-48 -right-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-blue-700/60 dark:to-blue-500/60 from-blue-500/80 to-blue-200 " />
        <motion.div
          className="mb-3 md:mb-6 relative overflow-hidden size-12 md:size-14"
          variants={imageVariants}
          initial="initial"
          animate="animate"
        >
          <Logo className="size-12 md:size-14" />
        </motion.div>
        <motion.h1
          variants={headingVariants}
          initial="initial"
          animate="animate"
          className="text-3xl md:text-5xl  text-center font-medium md:font-semibold tracking-tighter leading-tight"
        >
          {heading.split(" ").map((line, index) => (
            <motion.span
              className={cn("leading-none mx-1 md:mx-1.5")}
              key={index}
              variants={headingVariants}
            >
              {line}

              {line === "\n" && <br />}
            </motion.span>
          ))}
        </motion.h1>
        <motion.p
          variants={headingVariants}
          initial="initial"
          animate="animate"
          className="text-center mt-2 font-medium px-5 text-neutral-600 dark:text-neutral-300 text-sm md:text-lg"
        >
          {description.split("\n").map((line, index) => (
            <motion.span
              className="opacity-80"
              key={index}
              variants={headingVariants}
            >
              {line}
              <br className="hidden md:flex" />
            </motion.span>
          ))}
        </motion.p>
        <motion.div
          variants={headingVariants}
          initial="initial"
          animate="animate"
          className={cn(
            "px-3 sm:px-0 w-full flex flex-col items-center justify-center",
            // !isLoggedIn &&
            !isLoggedIn &&
              scrolledPastHalf &&
              "absolute top-2 z-50 right-0  left-0"
          )}
        >
          {" "}
          <div
            className={cn(
              !isLoggedIn && scrolledPastHalf && !isDesktop && "inset-x-4",
              !isLoggedIn && scrolledPastHalf ? "fixed  top-2 z-50" : "sticky"
            )}
          >
            <ClaimUsernameForm
              onSubmit={handleSubmit}
              className={cn(
                // !isLoggedIn &&
                !isLoggedIn &&
                  scrolledPastHalf &&
                  "shadow-2xl w-fit shadow-black/80 border border-neutral-300/60 dark:border-dark-border/80"
              )}
            />
          </div>
          <div className="w-full flex items-center justify-center mt-4  ">
            <span className="w-full text-center text-neutral-500 font-medium text-sm md:text-base dark:text-neutral-300 ">
              Already have an account?
              <Link
                className="text-indigo-500  ml-1 hover:underline"
                href={"/login"}
              >
                Login
              </Link>
            </span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        variants={windowVariants}
        animate="animate"
        initial="initial"
        className=" p-4 w-full h-screen -z-10 flex  absolute -bottom-[35%] md:-bottom-[80%] items-center justify-center"
      >
        <motion.div className=" rounded-2xl shadow-2xl   bg-white  border  border-neutral-200 dark:border-dark-border md:max-w-5xl aspect-video   w-full ">
          <div className="flex w-full px-4 py-3 items-center justify-start gap-x-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="size-3 md:size-4 bg-neutral-200   rounded-full"
              />
            ))}
          </div>
          <div className="  rounded-b-2xl relative overflow-hidden flex flex-col items-center justify-center w-full h-full">
            <Image
              alt=""
              fill
              className="object-cover scale-110"
              src="/minimal3.png"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
{
  /* <div className="md:max-w-2xl  mb-10 w-full gap-x-4 gap-y-2 md:gap-4 flex flex-wrap items-center justify-start mt-4">
      {dummyLinks?.map((link, i) => (
        <motion.div
          key={i}
          variants={socialLinksVariants[i]}
          animate={control}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 20,
            mass: 0.5,
          }}
        >
          <SocialLinkButton {...link} />
        </motion.div>
      ))}
    </div> */
}

export default HeroSection;

{
  /* <div className="absolute top-24 -left-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-purple-700/60 dark:to-purple-500/60 from-purple-500/80 to-purple-200 " />
<div className="absolute  top-48 -right-14 blur-[100px] -z-10 size-[250px] rounded-full bg-gradient-to-b dark:from-blue-700/60 dark:to-blue-500/60 from-blue-500/80 to-blue-200 " /> */
}

const SquigglyLine = ({
  x1,
  y1,
  x2,
  y2,
  frequency,
  amplitude,
  stroke,
  strokeWidth,
}: any) => {
  const points = [];
  const segmentLength = 10; // Adjust for smoother/more jagged waves
  const numSegments = Math.ceil(
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / segmentLength
  );

  for (let i = 0; i <= numSegments; i++) {
    const progress = i / numSegments;
    const x = x1 + (x2 - x1) * progress;
    const y =
      y1 +
      (y2 - y1) * progress +
      Math.sin(progress * frequency * 2 * Math.PI) * amplitude;
    points.push(`${x},${y}`);
  }

  return (
    <svg height="200" width="500">
      <path
        d={`M${points.join(" L")}`}
        stroke={stroke || "black"}
        strokeWidth={strokeWidth || 2}
        fill="transparent"
      />
    </svg>
  );
};
