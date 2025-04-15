import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import test from "node:test";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CEO",
    company: "GrowthTech",
    content:
      "Rize transformed our business growth strategy with their innovative approach. Absolutely game-changing!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Marketing Director",
    company: "Upward Inc.",
    content:
      "Since implementing Rize, our conversion rates have increased by 40%. The results speak for themselves.",
  },
  {
    id: 3,
    name: "Jessica Williams",
    role: "Founder",
    company: "ElevatePro",
    content:
      "Rize provided exactly what we needed to scale our operations efficiently. Their platform is intuitive and powerful.",
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "COO",
    company: "NextLevel",
    content:
      "The insights we've gained through Rize have completely revolutionized our approach to customer engagement.",
  },
  {
    id: 5,
    name: "Emma Thompson",
    role: "Growth Strategist",
    company: "Ascend Group",
    content:
      "I recommend Rize to all my clients. It's the most comprehensive growth platform I've ever worked with.",
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Product Manager",
    company: "InnovateX",
    content:
      "Rize helped us identify opportunities we were missing. Our product roadmap is now much more aligned with market needs.",
  },
];

const TestimonialsMarquee = () => {
  return (
    <div className="overflow-hidden h-[70vh] mb-10  py-16 w-full">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-medium md:font-semibold tracking-tight  mb-3">
          Word From Our Users ✨
        </h2>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white dark:from-dark-bg to-transparent z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white dark:from-dark-bg  to-transparent z-10" />

        <motion.div
          className="flex gap-6 px-4"
          animate={{ x: [0, -1500] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 40,
              ease: "linear",
            },
          }}
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-80 bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border rounded-3xl p-6 shadow-lg"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <p className=" italic opacity-70 ">"{testimonial.content}"</p>
                </div>
                <div className="flex w-full items-center pt-4  border-t border-neutral-300/60 dark:border-dark-border justify-start ">
                  <Image
                    src={`https://api.dicebear.com/9.x/dylan/svg?seed=${testimonial.name}?scale=50`}
                    alt={testimonial.name}
                    className="size-12 rounded-full"
                    width={50}
                    height={50}
                  />
                  <div className="ml-3">
                    <p className="font-medium ">{testimonial.name}</p>
                    <p className="text-sm opacity-70 leading-tight">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TestimonialsMarquee;
