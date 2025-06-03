"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is Rize?",
    answer:
      "Rize is a platform where you can build an authentic, all-in-one profile that showcases your work, skills, and personality. Think of it as your personal digital hub.",
  },
  {
    question: "How is Rize different from LinkedIn or Peerlist?",
    answer:
      "Unlike traditional networks, Rize focuses on real, verifiable profiles with an emphasis on showcasing *you* — your projects, your vibe, your story — not just your job history.",
  },
  {
    question: "Can I claim my own username?",
    answer:
      "Yes! Rize lets you reserve your unique username early so you can share a clean, personalized URL like `rize.so/ashwin`.",
  },
  {
    question: "Will it be free to use?",
    answer:
      "Yes, the core features of Rize will always be free. We may offer premium tools later for power users, but your profile and presence will remain free forever.",
  },
];

export default function FAQSection() {
  return (
    <section className=" flex flex-col relative  h-screen  items-center justify-center  w-full px-4 py-12">
      <div className="size-[350px]  absolute blur-[120px] top-[30%] -z-10  bg-indigo-400 dark:bg-indigo-500"></div>
      <div className="max-w-5xl w-full relative">
        <h2 className="text-4xl font-semibold text-center mb-8">
          Frequently Asked <br />
          Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full  bg-neutral-200 dark:bg-neutral-500 px-2 py-2 rounded-3xl space-y-2"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              className="w-full border-none bg-white dark:bg-dark-bg rounded-xl  px-2  overflow-hidden"
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="w-full hover:no-underline md:text-lg text-base md:font-medium  p-4 ">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base opacity-80 p-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
