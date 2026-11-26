import { LOCALES, DEFAULT_LOCALE } from "@/i18n/locales";
import { LanguageRedirect } from "@/components/LanguageRedirect";

export const metadata = {
  title: "Open Life Alliance — Your Life. Your Choice.",
};

/**
 * "/" on a static host: send visitors to their language. Without JavaScript,
 * the meta refresh goes to the default language and links are shown.
 */
export default function RootPage() {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content={`3; url=/${DEFAULT_LOCALE}/`} />
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#F7F8F6", color: "#202B32" }}>
        <LanguageRedirect />
        <main style={{ padding: "3rem 1rem", textAlign: "center" }}>
          <p>Open Life Alliance</p>
          <p>
            {LOCALES.map((l) => (
              <a key={l.code} href={`/${l.code}/`} style={{ margin: "0 0.75rem", color: "#43856C" }}>
                {l.nativeName}
              </a>
            ))}
          </p>
        </main>
      </body>
    </html>
  );
}
