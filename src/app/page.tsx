"use client";

import ClaimUsernameForm from "@/components/claim-username";
import Footer from "@/components/footer";
import TestimonialsMarquee from "@/components/home/testimonials";
import UserReviews from "@/components/home/user-reviews";
import { setServerCookie } from "@/lib/server-actions";
import { setCookie } from "cookies-next";
import { motion, Variants } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const heading = "Own Your Story \n Not Just Your Resume";
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
      staggerChildren: 0.3,
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
export default function Home() {
  const router = useRouter();
  const session = useSession();

  const handleSubmit = (data: string) => {
    setCookie("username", data);
    router.push(`/signup`);
  };
  return (
    <div className="w-full min-h-screen  flex flex-col items-center justify-center">
      {session?.data?.user && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link prefetch href={`/${session?.data?.user?.username}`}>
            <Image
              src={
                (session?.data?.user?.profileImage ||
                  session?.data?.user?.image) as string
              }
              alt={`${session?.data?.user?.name} profile image`}
              width={50}
              height={50}
            />
          </Link>
        </div>
      )}
      <motion.div className="flex flex-col h-[90vh] md:h-screen items-center justify-center gap-3">
        <motion.div
          className="mb-3 md:mb-6 relative overflow-hidden size-12 md:size-14"
          variants={imageVariants}
          initial="initial"
          animate="animate"
        >
          <Image alt="" fill src={"/logo2.png"} />
        </motion.div>
        <motion.h1
          variants={headingVariants}
          initial="initial"
          animate="animate"
          className="text-4xl md:text-5xl lg:text-6xl text-center font-semibold font-instrument tracking-tight leading-tight"
        >
          {heading.split("\n").map((line, index) => (
            <motion.span key={index} variants={headingVariants}>
              {line}
              <br />
            </motion.span>
          ))}
        </motion.h1>
        <motion.div
          variants={headingVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-sm px-3 sm:px-0"
        >
          {" "}
          <ClaimUsernameForm onSubmit={handleSubmit} />
        </motion.div>
      </motion.div>
      <UserReviews />
      <TestimonialsMarquee />
      <Footer />
    </div>
  );
}
