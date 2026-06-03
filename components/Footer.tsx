import Link from "next/link";
import { SITE_NAME, AUTHOR_NAME, LOGODEV_TOKEN } from "@/lib/site";
import { DECKS } from "@/lib/decks";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="text-base font-bold text-gray-900">{SITE_NAME}</div>
          <p className="mt-2 text-sm text-gray-500">
            Free Higher or Lower money games. No sign-up — just guess and share your streak.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Games</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {DECKS.map((d) => (
              <li key={d.slug}>
                <Link href={`/${d.slug}/`} className="hover:text-brand-700">
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/about/" className="hover:text-brand-700">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact/" className="hover:text-brand-700">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Legal</div>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <Link href="/privacy/" className="hover:text-brand-700">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/disclaimer/" className="hover:text-brand-700">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {year} {SITE_NAME}. Built and maintained by {AUTHOR_NAME}. Values are approximate
        snapshots for entertainment only.
        {LOGODEV_TOKEN ? (
          <>
            {" "}
            Logos provided by{" "}
            <a
              href="https://logo.dev"
              rel="noopener noreferrer"
              className="underline hover:text-brand-700"
            >
              Logo.dev
            </a>
            .
          </>
        ) : null}
      </div>
    </footer>
  );
}
