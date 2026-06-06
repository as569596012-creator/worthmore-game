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

      <Link
        href="/world-cup-player-value-higher-or-lower/"
        className="mt-10 block rounded-2xl border border-brand-300 bg-gradient-to-r from-brand-50 to-emerald-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl">⚽</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
              New · World Cup 2026 special
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-gray-900 sm:text-2xl">
              Guess the football market values — kicks off June 11
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Higher or Lower, World Cup edition: which player (or national team) is worth more?
            </p>
          </div>
          <span className="ml-auto hidden whitespace-nowrap text-sm font-semibold text-brand-600 sm:inline">
            Play now →
          </span>
        </div>
      </Link>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <Link
          href="/world-cup-bracket-predictor/"
          className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
        >
          <div className="text-3xl">🔮</div>
          <h2 className="mt-3 text-xl font-bold text-gray-900 group-hover:text-brand-700">
            World Cup Picker
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Predict the 2026 World Cup: tap your winner of every knockout tie until you crown a
            champion, then share your bracket.
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
            Play now →
          </span>
        </Link>
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
