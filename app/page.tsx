import Link from "next/link";
import { DECKS } from "@/lib/decks";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import AdSlot from "@/components/AdSlot";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="text-center">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Free · Instant · No sign-up
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {SITE_NAME} — Higher or Lower
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{SITE_TAGLINE}</p>
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {DECKS.map((deck) => (
          <Link
            key={deck.slug}
            href={`/${deck.slug}/`}
            className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <div className="text-3xl">{deck.emoji}</div>
            <h2 className="mt-3 text-xl font-bold text-gray-900 group-hover:text-brand-700">
              {deck.name}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{deck.intro}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
              Play now →
            </span>
          </Link>
        ))}
      </section>

      <div className="mt-12">
        <AdSlot />
      </div>

      <section className="mt-12 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900">How {SITE_NAME} works</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-gray-900">One simple question</h3>
            <p className="mt-1 text-sm text-gray-600">
              You see two cards. Is the second one worth more or less than the first? Tap Higher or
              Lower.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Build a streak</h3>
            <p className="mt-1 text-sm text-gray-600">
              Every correct guess extends your streak. One wrong answer ends the run — your best
              score is saved.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Share & challenge</h3>
            <p className="mt-1 text-sm text-gray-600">
              Download a score card or copy a challenge link to dare your friends to beat your
              streak.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
