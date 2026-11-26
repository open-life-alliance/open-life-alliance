import { LOGO, logoColors, type LogoVariant } from "@/lib/brand";

/** The one and only logo component. Do not redraw the mark elsewhere. */
export function LogoMark({
  variant = "color",
  className,
  title,
}: {
  variant?: LogoVariant;
  className?: string;
  title?: string;
}) {
  const c = logoColors(variant);
  return (
    <svg
      viewBox={`0 0 ${LOGO.viewBox} ${LOGO.viewBox}`}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={LOGO.ring} fill="none" stroke={c.ring} strokeWidth={LOGO.ringWidth} strokeLinecap="round" />
      <path d={LOGO.leaf} fill={c.leaf} />
      {c.vein !== "transparent" && (
        <path d={LOGO.vein} fill="none" stroke={c.vein} strokeWidth={LOGO.veinWidth} strokeLinecap="round" />
      )}
    </svg>
  );
}

export function Wordmark({ dark = false, localName }: { dark?: boolean; localName?: string }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark variant={dark ? "onDark" : "color"} className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className={`text-[0.7rem] font-extrabold tracking-[0.12em] sm:text-[0.8rem] sm:tracking-[0.16em] ${dark ? "text-white" : "text-navy"}`}>
          OPEN LIFE ALLIANCE
        </span>
        {localName ? (
          <span className={`mt-1 text-[0.7rem] font-medium tracking-[0.2em] ${dark ? "text-gold-soft" : "text-muted"}`}>
            {localName}
          </span>
        ) : null}
      </span>
    </span>
  );
}
