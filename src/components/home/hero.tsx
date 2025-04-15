import { setCookie } from "cookies-next";
import { motion, Variants } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClaimUsernameForm from "../claim-username";
import Logo from "../logo";

const heading = "Own Your Story \n Not Just Your Resume";
const description =
  "Because your journey is more than bullet points. Share your growth,\n projects, and adventures in a way that's uniquely you ✨";

const headingVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      staggerChildren: 0.1,
      ease: "easeIn",
    },
  },
  exit: {
    opacity: 0,
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
const HeroSection = () => {
  const session = useSession();
  const router = useRouter();
  const handleSubmit = (data: string) => {
    setCookie("username", data);
    router.push(`/signup`);
  };
  return (
    <div className="">
      {session?.data?.user && (
        <div className="absolute rounded-full top-4 right-4 flex items-center gap-2">
          <Link prefetch href={`/${session?.data?.user?.username}`}>
            <Image
              src={
                (session?.data?.user?.profileImage ||
                  session?.data?.user?.image) as string
              }
              alt={`${session?.data?.user?.name} profile image`}
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
          </Link>
        </div>
      )}
      <motion.div className="flex relative flex-col h-[90vh] md:h-screen items-center justify-center gap-3">
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
              className="leading-none mx-1"
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
          className="text-center  mt-2"
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
          className="w-full max-w-sm px-3 sm:px-0"
        >
          {" "}
          <ClaimUsernameForm onSubmit={handleSubmit} />
          <div className="w-full flex items-center justify-center mt-2 ">
            <span className="w-full text-center  text-sm opacity-60">
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
    </div>
  );
};

export default HeroSection;
