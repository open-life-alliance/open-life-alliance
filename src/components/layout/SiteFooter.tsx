import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/brand/Logo";
import { SITE } from "@/config/site";

export function SiteFooter() {
  const t = useTranslations("footer");
  const card = useTranslations("card");
  const disclaimer = useTranslations()("disclaimer");

  const linkCls = "text-sm text-white/70 hover:text-white";
  return (
    <footer className="bg-navy-deep text-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-1">
          <Wordmark dark localName={card("orgLocalName") || undefined} />
          <p className="font-serif text-lg italic text-gold-soft">{t("tagline")}</p>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">{t("sections.explore")}</h2>
          <ul className="space-y-2">
            <li><Link className={linkCls} href="/about">{t("about")}</Link></li>
            <li><Link className={linkCls} href={{ pathname: "/", hash: "mission" }}>{t("mission")}</Link></li>
            <li><Link className={linkCls} href="/join">{t("membership")}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">{t("sections.project")}</h2>
          <ul className="space-y-2">
            <li><a className={linkCls} href={SITE.repoUrl} target="_blank" rel="noopener noreferrer">{t("github")}</a></li>
            {SITE.contactEmail ? (
              <li><a className={linkCls} href={`mailto:${SITE.contactEmail}`}>{t("contact")}</a></li>
            ) : (
              <li><a className={linkCls} href={`${SITE.repoUrl}/issues`} target="_blank" rel="noopener noreferrer">{t("contact")}</a></li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold">{t("sections.legal")}</h2>
          <ul className="space-y-2">
            <li><Link className={linkCls} href="/privacy">{t("privacy")}</Link></li>
            <li><Link className={linkCls} href="/terms">{t("terms")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page space-y-2 py-6 text-xs leading-relaxed text-white/55">
          <p>{disclaimer}</p>
          <p>{t("license")}</p>
        </div>
      </div>
    </footer>
  );
}
