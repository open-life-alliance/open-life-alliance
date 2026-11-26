import { LOCALES } from "@/i18n/locales";
import { LogoMark } from "@/components/brand/Logo";

/** Static 404 page (served as 404.html). Kept language-neutral. */
export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F7F8F6", color: "#202B32" }}>
        <main style={{ maxWidth: 480, margin: "0 auto", padding: "4rem 1rem", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, margin: "0 auto" }}>
            <LogoMark />
          </div>
          <h1 style={{ color: "#17364A" }}>404</h1>
          <p>Page not found · 页面不存在</p>
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
