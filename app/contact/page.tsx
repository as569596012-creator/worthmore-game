import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: `Contact ${SITE_NAME}`,
  description: `Get in touch with the ${SITE_NAME} team for feedback, data corrections, or to suggest a new game.`,
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <article className="prose-tool mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900">Contact us</h1>
      <p className="mt-4">
        Spotted a number that looks off, or have an idea for a new Higher or Lower game you would
        love to play? We would love to hear from you.
      </p>
      <p className="mt-4">
        Email:{" "}
        <a className="font-semibold text-brand-700 underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
      <p className="mt-4 text-sm text-gray-500">
        We usually reply within a couple of business days.
      </p>
    </article>
  );
}
