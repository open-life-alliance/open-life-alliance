import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // V1 is a fully static site: no server, no database. `next build` writes
  // plain HTML/CSS/JS to ./out, which any static host can serve.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default withNextIntl(nextConfig);
