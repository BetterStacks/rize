import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Keep every answer true to what's built today (see RIZE_NORTH_STAR.md).
const faqItems = [
  {
    question: 'Is it an AI?',
    answer:
      "Yes. The voice on the call is Rize's AI, not a person. It says so at the start of every call, and if you ask, it says so again.",
  },
  {
    question: 'Is the call recorded, and who hears it?',
    answer:
      'Yes, and it tells you at the start. The recording is turned into the transcript in your journal, and you are the only one who can play it back. The call runs through our phone and AI providers (Twilio and OpenAI). Recordings are deleted automatically after 7 days, and you can delete one sooner. Transcripts and drafts stay until you delete them.',
  },
  {
    question: 'Who can see my journal?',
    answer: 'Only you. Calls, transcripts and drafts are private. Nothing is public unless you publish it.',
  },
  {
    question: 'Do I have to post anything?',
    answer:
      "No. Plenty of calls just stay in your journal. When there is a draft, you can keep it private, edit it or share it. Sharing puts it on your profile and in the Rize feed, and it only happens when you say so.",
  },
  {
    question: 'Which languages can I talk in?',
    answer:
      'Hindi, English or Hinglish. Rize offers Hindi or English at the start and follows however you talk. Your draft stays in the language you used.',
  },
  {
    question: 'How do I get a call?',
    answer:
      "Sign up, add your phone number, and tap Call me. Rize rings you straight away. It won't call you on its own.",
  },
]

export default function FAQSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="w-full scroll-mt-6 border-t border-hairline">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_2fr] md:gap-16 md:py-28">
        <h2 id="faq-title" className="font-instrument text-4xl leading-tight text-ink md:text-5xl">
          Questions
        </h2>
        <Accordion type="single" collapsible className="w-full border-t border-hairline">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`} className="border-b border-hairline">
              <AccordionTrigger className="min-h-14 gap-4 py-5 text-base font-medium text-ink hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-xl pb-6 text-base leading-relaxed text-ink-secondary">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
