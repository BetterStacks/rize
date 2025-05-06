"use client";

import Footer from "@/components/footer";
import BentoGrid from "@/components/home/bento-grid";
import FAQSection from "@/components/home/faq";
import HeroSection from "@/components/home/hero";
import TextReveal from "@/components/home/text-reveal";
import UserReviews from "@/components/home/user-reviews";

export default function Home() {
  return (
    <div className="w-full min-h-screen  flex flex-col items-center justify-center">
      <HeroSection />
      <TextReveal />
      <BentoGrid />
      <UserReviews />
      <div className="w-full h-full bg-gradient-to-b from-transparent to-indigo-500 dark:to-indigo-500/90">
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
}
