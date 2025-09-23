'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '../ui/separator'

const faqItems = [
  {
    question: 'What is Rize?',
    answer:
      'Rize is a platform where you can build an authentic, all-in-one profile that showcases your work, skills, and personality. Think of it as your personal digital hub.',
  },
  {
    question: 'How is Rize different from LinkedIn or Peerlist?',
    answer:
      'Unlike traditional networks, Rize focuses on real, verifiable profiles with an emphasis on showcasing *you* — your projects, your vibe, your story — not just your job history.',
  },
  {
    question: 'Can I claim my own username?',
    answer:
      'Yes! Rize lets you reserve your unique username early so you can share a clean, personalized URL like `rize.so/ashwin`.',
  },
  {
    question: 'Will it be free to use?',
    answer:
      'Yes, the core features of Rize will always be free. We may offer premium tools later for power users, but your profile and presence will remain free forever.',
  },
]

export default function FAQSection() {
  return (
    <section className=" flex flex-col relative my-10  items-center justify-center  w-full px-4 py-12">
      {/* <div className="size-[350px]  absolute blur-[120px] top-[30%] -z-10  bg-amber-400 dark:bg-amber-500"></div> */}
      <div className="max-w-5xl w-full relative">
        <div className="px-4 mb-6">
          <h3 className="text-2xl md:text-3xl font-medium tracking-tight ">
            Still Got{' '}
            <span className="font-instrument font-thin italic text-3xl md:text-4xl ">
              Questions?
            </span>
          </h3>
          <p className="mt-2 opacity-80 max-w-lg text-left">
            We've got answers.
          </p>
          <Separator className="bg-transparent dark:bg-transparent h-4 border-b-2 dark:border-dark-border border-neutral-300 border-dashed" />
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full  bg-neutral-200 dark:bg-neutral-600 px-2 py-2 rounded-3xl space-y-2"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              className="w-full border-none bg-white dark:bg-dark-bg rounded-xl  px-2  overflow-hidden"
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="w-full hover:no-underline md:text-lg text-base md:font-medium tracking-tight  p-4 ">
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
  )
}
