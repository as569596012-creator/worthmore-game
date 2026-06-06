import type { Metadata } from "next";
import Link from "next/link";
import GuessPlayerClient from "@/components/GuessPlayerClient";
import Faq from "@/components/Faq";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl, AUTHOR_NAME, SITE_NAME } from "@/lib/site";

const SLUG = "guess-the-footballer";

export const metadata: Metadata = buildMetadata({
  title: "Guess the Footballer — Daily Football Player Quiz (Free)",
  description:
    "Free Who Are Ya-style football guessing game. Identify the mystery player from clues — nationality, club, league, position and age. No sign-up, share your result.",
  path: `/${SLUG}/`,
  keywords: [
    "guess the footballer",
    "football player guessing game",
    "who are ya football",
    "soccer wordle",
    "guess the player quiz",
    "football quiz game",
  ],
});

const HOW_TO = [
  "Type a footballer's name and pick from the list to lock in a guess.",
  "Each guess reveals clues: nationality, club, league, position and age (green = match; the age arrow points toward the answer).",
  "Use the clues to narrow it down and find the mystery player within 8 guesses.",
];

const FAQ = [
  {
    q: "How do I play Guess the Footballer?",
    a: "You have 8 guesses to find the mystery footballer. After each guess, five clues light up green when they match the answer — nationality, club, league, position and age. The age clue shows an arrow pointing toward the correct age.",
  },
  {
    q: "Which players can appear?",
    a: "Around 150 of the most well-known players heading into the 2026 World Cup, across Europe's top five leagues plus the Saudi Pro League and MLS.",
  },
  {
    q: "Are the clues always accurate?",
    a: "Club, league, position and age are approximate snapshots for 2026 and can change with transfers. The game is for entertainment only.",
  },
  {
    q: "Is it free? Do I need an account?",
    a: "Completely free, no sign-up. Your stats are saved locally in your browser, and you can share your result grid.",
  },
];

const gameJson = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "Guess the Footballer",
  url: absoluteUrl(`/${SLUG}/`),
  description:
    "A free Who Are Ya-style football guessing game: identify the mystery player from clues like nationality, club, league, position and age.",
  genre: "Trivia, Puzzle",
  gamePlatform: "Web browser",
  applicationCategory: "GameApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Organization", name: AUTHOR_NAME },
};

const howToJson = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to play Guess the Footballer",
  step: HOW_TO.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
};

const faqJson = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd
        data={[
          gameJson,
          howToJson,
          faqJson,
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Guess the Footballer", path: `/${SLUG}/` },
          ]),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Guess the Footballer</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        Guess the Footballer
      </h1>
      <p className="mt-3 text-lg text-gray-600">
        A daily-style football guessing game for the 2026 World Cup. Find the mystery player from
        clues — nationality, club, league, position and age — in 8 guesses, then share your result.
      </p>

      <div className="mt-6">
        <GuessPlayerClient />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-gray-900">How to play</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-gray-600">
          {HOW_TO.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="mt-8">
        <AdSlot />
      </div>

      <section className="prose-tool mt-8">
        <h2 className="text-xl font-bold text-gray-900">About this game</h2>
        <p className="mt-3">
          Guess the Footballer is a free Who Are Ya-style guessing game built around the stars of
          the 2026 World Cup. Instead of a blurred photo, you get pure clues — nationality, club,
          league, position and age — so it is fast, fair and works on any device. Player attributes
          are approximate snapshots for 2026 and are for entertainment only. {SITE_NAME} is an
          independent game and is not affiliated with FIFA, the World Cup or Transfermarkt.
        </p>
      </section>

      <Faq items={FAQ} />

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">More World Cup games</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/world-cup-player-value-higher-or-lower/"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm transition hover:border-brand-300 hover:shadow-sm"
          >
            <span className="text-xl">⚽</span>
            <span className="font-semibold text-gray-900">World Cup Player Value: Higher or Lower</span>
          </Link>
          <Link
            href="/world-cup-team-value-higher-or-lower/"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm transition hover:border-brand-300 hover:shadow-sm"
          >
            <span className="text-xl">🏆</span>
            <span className="font-semibold text-gray-900">National Team Value: Higher or Lower</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
