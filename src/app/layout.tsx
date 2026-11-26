import type { ReactNode } from "react";

// The <html> element is rendered by app/[locale]/layout.tsx so that `lang`
// and `dir` match the page language. This root layout only passes through.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
