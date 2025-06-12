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
import Window from "../window";

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

const avatarContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 50, rotate: 0 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

export const avatars = [
  "https://i.pinimg.com/736x/6e/81/48/6e8148281a25fb25230a983b09371ae5.jpg",
  "https://i.pinimg.com/736x/59/59/52/5959526847cf6be79778c37505604411.jpg",
  "https://i.pinimg.com/736x/cf/6e/c4/cf6ec445df41899479978aa16f05c996.jpg",
  "https://i.pinimg.com/736x/0d/00/fa/0d00faf7e0a04fe724ecd886df774e4c.jpg",
  "https://i.pinimg.com/736x/af/6c/76/af6c761bac0ef8d3e5f775fe1200b1a9.jpg",
  "https://i.pinimg.com/736x/70/5a/2c/705a2c53fa0b166937c6847410ccb3d5.jpg",
  "https://lh3.googleusercontent.com/a/AEdFTp6zJR7vEcGJmGFt0Gxk2Ech8ic0LGCVTPDTB95lVpg=s256-c",
];
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
      className="w-full min-h-[100vh] md:min-h-[170vh]   flex flex-col items-center justify-start overflow-hidden"
    >
      {session?.data?.user && (
        <Link
          className="absolute top-4 right-4"
          prefetch
          href={`/${session?.data?.user?.username}`}
        >
          <div className="relative rounded-full overflow-hidden aspect-square size-10  z-50 flex items-center gap-2">
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
          className="text-center mt-2 font-medium px-5 text-neutral-600 dark:text-neutral-200 text-sm md:text-lg"
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
            !isLoggedIn && scrolledPastHalf && "absolute top-2 z-50 "
          )}
        >
          {" "}
          <div
            className={cn(
              // !isLoggedIn && scrolledPastHalf && !isDesktop && " bg-red-500",
              !isLoggedIn && scrolledPastHalf
                ? "fixed  top-2 z-50"
                : "sticky z-10"
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
          <div className="w-full flex items-center z-10 justify-center mt-4  ">
            <span className="w-full text-center text-neutral-500 font-medium text-sm md:text-base dark:text-neutral-300/80 ">
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
        variants={avatarContainerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 flex -space-x-4"
      >
        {[...avatars]?.map((url, index) => {
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.1, zIndex: 20 }}
              style={{ zIndex: 8 - index }}
              className="size-10 md:size-12 saturate-[75%]  dark:border-dark-border bg-white aspect-square rounded-full shadow-xl dark:bg-dark-bg relative overflow-hidden"
            >
              <Image src={url} fill style={{ objectFit: "cover" }} alt="" />
            </motion.div>
          );
        })}
      </motion.div>
      <Window />
      <motion.div
        variants={windowVariants}
        animate="animate"
        initial="initial"
        className=" p-4 w-full h-screen  flex md:hidden  absolute -bottom-[45%] md:-bottom-[80%] items-center justify-center"
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
              draggable={false}
              className="object-cover scale-125"
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
