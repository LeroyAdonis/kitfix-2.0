import Image from "next/image";
import { Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/Reveal";

type QuoteCardData = {
  component: "quote";
  quote: string;
  image: { src: string; alt: string };
  name: string;
  position: string;
  club: string;
};

type ClubCardData = {
  component: "club";
  club: string;
};

type CardData = QuoteCardData | ClubCardData;

const CARDS: CardData[] = [
  {
    component: "quote",
    quote:
      "Our U19 kit looked finished at the start of the season. KitFix renumbered a full squad and the jerseys lasted three more. Huge value for a club budget.",
    image: {
      src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80",
      alt: "Head coach Michael Ndlovu",
    },
    name: "Michael Ndlovu",
    position: "Head Coach",
    club: "Durban North FC",
  },
  {
    component: "club",
    club: "DBN NORTH FC",
  },
  {
    component: "club",
    club: "KLERKSDORP RUGBY",
  },
  {
    component: "club",
    club: "CT CITY ATHLETICS",
  },
  {
    component: "quote",
    quote:
      "A player tore his match jersey on a Friday. Repaired, couriered back and on the peg by Sunday's derby. That match-day turnaround saved our side.",
    image: {
      src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
      alt: "Club manager Ruan van der Merwe",
    },
    name: "Ruan van der Merwe",
    position: "Club Manager",
    club: "Krugersdorp Rugby Club",
  },
  {
    component: "club",
    club: "JHB BLUES",
  },
];

function Stars() {
  return (
    <div className="mb-5 flex gap-1 md:mb-6" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} aria-hidden="true" className="size-5 fill-[var(--color-stitch)] text-[var(--color-stitch)]" />
      ))}
    </div>
  );
}

export function TestimonialsSection({ className = "" }: { className?: string }) {
  return (
    <section className={`px-6 py-16 md:py-24 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 md:mb-18 lg:mb-20">
          <div className="mx-auto w-full max-w-2xl text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-stitch)] md:mb-4">
              KF-03 — From the touchline
            </p>
            <Reveal>
              <h2 className="font-display text-3xl md:text-5xl uppercase text-[var(--color-thread)]">
                Clubs that stop benching kits
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, index) =>
            card.component === "quote" ? (
              <Card
                key={index}
                className="flex flex-col items-start justify-between p-6 md:col-span-2 md:p-8"
              >
                <Stars />
                <blockquote className="text-base text-[var(--color-thread)] leading-relaxed">
                  &quot;{card.quote}&quot;
                </blockquote>
                <div className="mt-6 flex w-full flex-col items-start gap-4 border-t border-dashed border-[var(--color-pitch-line)]/40 pt-5 md:flex-row md:items-center">
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    width={56}
                    height={56}
                    className="size-14 shrink-0 object-cover grayscale"
                  />
                  <div>
                    <p className="font-display text-sm uppercase tracking-wide text-[var(--color-thread)]">
                      {card.name}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-thread-dim)]">
                      {card.position} · {card.club}
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                key={index}
                className="flex min-h-[9rem] items-center justify-center p-6 md:min-h-[12rem] lg:min-h-[14rem]"
              >
                <span className="font-mono text-sm uppercase tracking-[0.22em] text-[var(--color-thread-dim)]">
                  {card.club}
                </span>
              </Card>
            ),
          )}
        </div>
      </div>
    </section>
  );
}