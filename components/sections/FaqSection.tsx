"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

const QUESTIONS = [
  {
    title: "How long does a repair take?",
    answer:
      "Most seam and tear repairs are turned around in 3–4 working days. A Full Refresh or renumber of a whole squad takes up to 7 days. Need something faster? WhatsApp us — urgent match-day jobs are our specialty.",
  },
  {
    title: "Which sports do you cover?",
    answer:
      "Everything stitched plays: soccer, rugby, cricket, hockey, netball and athletics. If it's a club or school kit with a tear, number, badge or zip, we can fix it.",
  },
  {
    title: "How does pricing work?",
    answer:
      "Flat rates: R150 Basic repairs (seams, loose stitching, small holes), R250 Complex repairs (large tears, number/name replacement, panel repair) and R400 for a Full Refresh. You approve the exact quote before we start — no hidden fees.",
  },
  {
    title: "How do I get my kit to you?",
    answer:
      "Door-to-door courier anywhere in South Africa, or drop-offs in Johannesburg and Cape Town. We send the kit back the same way, with a stitch-quality checklist signed by the seamster.",
  },
  {
    title: "Will renumbered names survive the wash?",
    answer:
      "Yes. We use official-style heat-pressed lettering with reinforced backing, matched to your kit's weave and weight — it holds up through the wash cycle and the whole season.",
  },
];

const WHATSAPP_URL = "https://wa.me/27721234567";

export function FaqSection({ className = "" }: { className?: string }) {
  return (
    <section className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[.75fr,1fr] lg:gap-x-20">
        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-stitch)]">
            KF-04 — The Small Print
          </p>
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)] mb-6">
              Match-day questions
            </h2>
          </Reveal>
          <p className="text-medium text-[var(--color-thread-dim)] leading-relaxed">
            The straight answers clubs ask us before their first drop-off.
            Anything else — chat to us directly.
          </p>
          <div className="mt-6 md:mt-8">
            <Button asChild variant="secondary">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                WhatsApp a question
              </a>
            </Button>
          </div>
        </div>

        <Accordion type="multiple">
          {QUESTIONS.map((question, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-medium text-[var(--color-thread)] md:py-5">
                {question.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed md:pb-6">
                {question.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}