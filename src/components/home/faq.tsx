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
      "Rize calls you for a few minutes and asks one good question about your week. What you say goes in your private journal. When something's worth sharing, you get a post made from your own words, and it only goes on your profile if you approve it.",
  },
  {
    question: 'How do I get a call?',
    answer:
      "Sign up, add your phone number and tap Call me. Rize rings you straight away. It won't call you on its own.",
  },
  {
    question: 'Is it an AI?',
    answer:
      "Yes. The voice on the call is Rize's AI, not a person. It says so at the start of every call, and if you ask, it says so again.",
  },
  {
    question: 'Is the call recorded?',
    answer:
      'Yes, and it tells you at the start. The call is transcribed into your journal. Calls run through our phone and AI providers. Recordings are deleted automatically after 7 days. Transcripts and drafts stay until you delete them.',
  },
  {
    question: 'Who can see my journal?',
    answer:
      'Only you. Your calls, transcripts and drafts are private. Nothing is public unless you publish it.',
  },
  {
    question: 'Do I have to post anything?',
    answer:
      "No. Plenty of calls just stay in your journal. When there's a draft, you can edit it, keep it private or share it. It only goes public when you say so.",
  },
  {
    question: 'Which languages can I talk in?',
    answer: 'Hindi, English or Hinglish. Talk the way you normally talk.',
  },
  {
    question: 'How is this different from LinkedIn?',
    answer:
      'LinkedIn asks you to write about yourself. Rize asks about your week and keeps your words. Your profile shows the moments you chose to share, not just job titles.',
  },
  {
    question: 'Can I pick my own username?',
    answer:
      'Yes. Claim a name and your profile lives at rize.so/yourname.',
  },
]

export default function FAQSection() {
  return (
    <section className=" flex flex-col relative my-10  items-center justify-center  w-full px-4 py-12">
      <div className="max-w-5xl w-full relative">
        <div className="px-4 mb-6">
          <h3 className="font-instrument text-4xl md:text-5xl text-ink leading-tight">
            Questions <span className="italic">worth asking</span>
          </h3>
          <p className="mt-2 text-ink-secondary max-w-lg text-left">
            About calls, privacy and what goes public.
          </p>
          <Separator className="bg-transparent dark:bg-transparent h-4 border-b-2 border-hairline border-dashed" />
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full bg-subtle px-2 py-2 rounded-3xl space-y-2"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              className="w-full border-none bg-surface rounded-xl px-2 overflow-hidden"
              key={index}
              value={`item-${index}`}
            >
              <AccordionTrigger className="w-full hover:no-underline md:text-lg text-base md:font-medium tracking-tight text-ink p-4 ">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-ink-secondary leading-relaxed p-4">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
