"use client";

import Footer from "@/components/footer";
import BentoGrid from "@/components/home/bento-grid";
import FAQSection from "@/components/home/faq";
import HeroSection from "@/components/home/hero";
import TextReveal from "@/components/home/text-reveal";
import UserReviews from "@/components/home/user-reviews";
import Lenis from "lenis";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis();

    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full min-h-screen  flex flex-col items-center justify-center">
      <HeroSection />
      {/* <Window /> */}
      <TextReveal />
      <BentoGrid />
      <UserReviews />
      <FAQSection />
      <Footer />
    </div>
  );
}
