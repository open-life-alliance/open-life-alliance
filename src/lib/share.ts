/** Browser sharing helpers with graceful fallbacks. */

export function isWeChat(): boolean {
  return typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);
}

/** In-app browsers that usually block downloads (WeChat, QQ, Weibo, etc.). */
export function isRestrictedInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MicroMessenger|QQ\/|Weibo|DingTalk|AlipayClient/i.test(navigator.userAgent);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canShareFiles(file: File): boolean {
  try {
    return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export type ShareResult = "shared" | "cancelled" | "unsupported";

export async function shareImage(file: File, text: string, title: string): Promise<ShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";
  try {
    if (canShareFiles(file)) {
      await navigator.share({ files: [file], text, title });
    } else {
      await navigator.share({ text, title });
    }
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and some in-app webviews.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}
