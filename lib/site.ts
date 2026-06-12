// Single source of truth for the canonical site URL.
// Set NEXT_PUBLIC_SITE_URL in Vercel once the custom domain exists.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pulse-wheat-six.vercel.app";
