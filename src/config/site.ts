/** Project-wide settings. Override with NEXT_PUBLIC_* env vars at build time. */
export const SITE = {
  name: "Open Life Alliance",
  shortName: "OLA",
  repoUrl:
    process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/open-life-alliance/open-life-alliance",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  /** Absolute URL of the live site; falls back to the browser origin at runtime. */
  configuredUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
};

/** Base URL for share links and card QR codes (client-side only). */
export function siteUrl(): string {
  if (SITE.configuredUrl) return SITE.configuredUrl.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** "example.org" style label printed on cards. */
export function siteLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
