"use client";

import ClaimUsernameForm from "@/components/claim-username";
import Footer from "@/components/footer";
import BentoGrid from "@/components/home/bento-grid";
import FAQSection from "@/components/home/faq";
import HeroSection from "@/components/home/hero";
import TextReveal from "@/components/home/text-reveal";
import UserReviews from "@/components/home/user-reviews";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Window from "@/components/window";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@mantine/hooks";
import { setCookie } from "cookies-next";
import { motion, useInView } from "framer-motion";
import Lenis from "lenis";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const titles = [
    "Designers",
    "Developers",
    "Creators",
    "Founders",
    "Individuals",
  ];
  const img = [
    "/developer.png",
    "/designer.png",
    "/creator.png",
    "/founder.png",
    "/individual.png",
  ];
  const [activeTitle, setActiveTitle] = useState(titles[0]);

  return (
    <div className="w-full min-h-screen  flex flex-col items-center justify-start">
      <HeroSection />
      <Window />

      <div className="w-full p-4 max-w-5xl mt-16 min-h-screen md:min-h-[80vh]  flex flex-col md:flex-row items-center md:items-start  mx-auto ">
        <div className="px-4 max-w-2xl flex items-start flex-col">
          <h3 className="text-2xl md:text-3xl font-medium  tracking-tight">
            Join the movement. <br />
            <span className="font-instrument font-thin italic text-3xl md:text-4xl ">
              Claim your name.
            </span>
            <br /> Shape your presence.
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 leading-tight font-medium md:max-w-md w-full text-base md:text-lg mt-6">
            Your identity deserves more than a username on a list. Rize gives
            you a space that reflects who you truly are. Join a growing
            community of bold, intentional creators. It starts with a name —
            yours to own, forever.
          </p>
          <Button className="mt-6 text-white bg-black  w-fit h-12 md:h-14 rounded-full text-base px-6 md:text-lg font-medium md:font-semibold">
            Claim username
          </Button>
        </div>
        <div className="w-full flex-1 md:h-full  pt-[60px] flex items-start relative justify-center">
          <div className=" scale-75 md:scale-[0.8] mr-[200px] ">
            <motion.div
              className="absolute"
              style={{
                scale: 0.9,
                zIndex: 10,
                rotate: 10,
                x: isDesktop ? 140 : 100,
                y: -100,
              }}
            >
              <div className=" w-[220px]  aspect-auto relative p-2 flex flex-col items-center justify-center overflow-hidden h-[300px] rounded-[2rem]">
                <Image
                  alt=""
                  fill
                  src="https://i.pinimg.com/736x/13/1d/a6/131da63c3a20267459f91fc842571a28.jpg"
                  className="z-0 object-cover "
                />
                <div className="bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md text-neutral-800 dark:text-neutral-200 h-8 bottom-4 tracking-tight  rounded-xl w-[80%] z-10 absolute flex items-center justify-center">
                  @beckywasgone
                </div>
              </div>
            </motion.div>
            <motion.div
              className="absolute"
              style={{
                scale: 0.9,
                zIndex: 2,
                x: isDesktop ? 0 : -100,
                y: 60,
                rotate: -3,
                // y: 200,
              }}
            >
              <img
                src="https://i.pinimg.com/736x/d6/c5/80/d6c580c2371fdb09fded07bf026aedf2.jpg"
                className="aspect-square object-cover  size-60 max-w-sm  rounded-[2rem]"
              />
            </motion.div>
            <motion.div
              style={{
                zIndex: 10,
                y: 180,
                x: isDesktop ? 100 : 0,
                rotate: -6,
              }}
              className="flex flex-col items-center justify-center w-[200px] h-[240px] bg-purple-100/80 dark:bg-purple-950/80 backdrop-blur-md border border-purple-200 dark:border-purple-800 rounded-[2rem] absolute"
            >
              <img
                src="https://i.pinimg.com/736x/eb/da/ed/ebdaed1c261c9cb22e86481fbb08fa1e.jpg"
                className="aspect-square object-cover  size-24 max-w-sm  rounded-full"
              />

              <div className="flex flex-col items-center justify-center mt-4 mb-4">
                <span className="text-xl font-medium tracking-tight ">
                  Solana Imani
                </span>
                <span className="tracking-tight opacity-80">@solanaimani</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* </section> */}

      {/* <Window /> */}

      <TextReveal />
      <BentoGrid />
      <UserReviews />
      <FAQSection />
      <ClaimUsernameSection />
    </div>
  );
}

const ClaimUsernameSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const handleSubmit = (data: string) => {
    setCookie("username", data);
    router.push(`/signup`);
  };
  return (
    <section
      ref={ref}
      className="relative flex flex-col items-center overflow-hidden justify-center w-full h-[80vh]"
    >
      <svg
        width="100%"
        height="120vh"
        viewBox="0 0 1440 1008"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 right-0 -z-10"
      >
        <path
          className="dark:fill-[#3A0CA3] fill-[#3A0CA3]"
          d="M0 103.452C544.921 -40.2235 861.621 -28.6228 1440 103.452V1008H0V103.452Z"
        />
        <path d="M0 103.452C544.921 -40.2235 861.621 -28.6228 1440 103.452V1008H0V103.452Z" />
      </svg>
      <div
        style={{ zIndex: 1 }}
        className="z-[1] px-6 mt-16 flex flex-col items-center justify-center w-full h-screen"
      >
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl text-center text-white font-medium tracking-tighter"
        >
          Get Started with <br /> Rize and Grow Your{" "}
          <span className="font-instrument leading-none md:text-5xl font-thin italic">
            Network
          </span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 text-center"
        >
          <span className="text-center  text-neutral-200 leading-tight text-lg font-medium">
            Customize your profile to showcase your unique style and Share{" "}
            <br className="hidden md:block" />
            your thoughts, experiences, and ideas with the world.
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-row mt-6 items-center justify-center"
        >
          <ClaimUsernameForm onSubmit={handleSubmit} />
        </motion.div>
      </div>
      <Footer />
    </section>
  );
};
