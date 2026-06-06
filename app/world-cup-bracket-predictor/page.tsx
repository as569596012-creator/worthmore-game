import type { Metadata } from "next";
import Link from "next/link";
import WorldCupPickerClient from "@/components/WorldCupPickerClient";
import Faq from "@/components/Faq";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { absoluteUrl, AUTHOR_NAME, SITE_NAME } from "@/lib/site";

const SLUG = "world-cup-bracket-predictor";

export const metadata: Metadata = buildMetadata({
  title: "World Cup Picker — 2026 Bracket Predictor (Free, No Sign-up)",
  description:
    "Predict the 2026 World Cup with one tap per tie. Pick your winner of every knockout match until you crown a champion, then share your bracket. Free, no sign-up.",
  path: `/${SLUG}/`,
  keywords: [
    "world cup 2026 predictor",
    "world cup bracket predictor",
    "world cup picker",
    "predict the world cup",
    "world cup 2026 bracket",
    "who will win the world cup 2026",
  ],
});

const HOW_TO = [
  "You are shown two teams at a time, starting from the Round of 16.",
  "Tap the flag of the team you think goes through.",
  "Keep picking winners round by round until you crown your World Cup champion, then share your bracket.",
];

const FAQ = [
  {
    q: "How does the World Cup Picker work?",
    a: "It is a single-elimination knockout. You see two teams at a time and tap whichever you think advances. Winners move on round by round — Round of 16, quarter-finals, semi-finals and the final — until one team is left as your champion.",
  },
  {
    q: "Is there a right or wrong answer?",
    a: "No. It is your prediction, so there are no wrong picks — just tap the teams you believe in and share who you think wins it all.",
  },
  {
    q: "Is this the official 2026 World Cup bracket?",
    a: "No. The matchups are a quick personal knockout among the leading contenders for fun, not the official fixtures. The real knockout bracket is set once the group stage is played.",
  },
  {
    q: "Is it free? Do I need an account?",
    a: "Completely free, no sign-up. Just tap through and share your result.",
  },
];

const gameJson = {
  "@context": "https://schema.org",
  "@type": "Game",
  name: "World Cup Picker",
  url: absoluteUrl(`/${SLUG}/`),
  description:
    "A free World Cup 2026 bracket predictor: tap your winner of every knockout tie until you crown a champion, then share your bracket.",
  genre: "Sports, Prediction",
  gamePlatform: "Web browser",
  applicationCategory: "GameApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Organization", name: AUTHOR_NAME },
};

const howToJson = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to play World Cup Picker",
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
            { name: "World Cup Picker", path: `/${SLUG}/` },
          ]),
        ]}
      />

      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-700">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">World Cup Picker</span>
      </nav>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        World Cup Picker — 2026 Bracket Predictor
      </h1>
      <p className="mt-3 text-lg text-gray-600">
        Predict the 2026 World Cup one tap at a time. Pick your winner of every knockout tie until
        you crown a champion — no football knowledge needed, just tap the flag you believe in and
        share your bracket.
      </p>

      <div className="mt-6">
        <WorldCupPickerClient />
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
          World Cup Picker is a free, instant prediction game for the 2026 World Cup. There is
          nothing to learn and no wrong answers — you are simply shown two teams and tap whichever
          you think goes through, round by round, until one nation is left standing as your champion.
          It is the fastest way to lock in your World Cup prediction and share it with friends before
          kickoff. {SITE_NAME} is an independent game and is not affiliated with FIFA or the World
          Cup; matchups are a personal knockout for entertainment, not the official fixtures.
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
