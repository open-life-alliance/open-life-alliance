/**
 * Brand constants shared by the website (React/SVG) and the card renderer
 * (Canvas). The logo is defined once, here, as SVG path data.
 */

export const COLORS = {
  navy: "#17364A",
  navyDeep: "#0E2433",
  forest: "#43856C",
  forestDeep: "#2C6650",
  gold: "#C5A66A",
  goldSoft: "#E3D2AC",
  paper: "#F7F8F6",
  ink: "#202B32",
  muted: "#71808A",
  white: "#FFFFFF",
} as const;

/**
 * Logo: an open ring (a life with room to grow) and a leaf breaking out
 * through the opening (choosing freely). Drawn in a 100×100 box.
 */
export const LOGO = {
  viewBox: 100,
  /** Open ring, stroked. Gap at the upper right. */
  ring: "M85.71 37 A38 38 0 1 1 56.6 12.58",
  ringWidth: 8,
  /** Leaf, filled. */
  leaf: "M40 68 C38 44 56 24 86 14 C84 42 66 62 40 68 Z",
  /** Leaf vein, stroked in the background colour. */
  vein: "M45 63 Q57 46 76 27",
  veinWidth: 2.2,
} as const;

export type LogoVariant = "color" | "white" | "black" | "onDark";

export function logoColors(variant: LogoVariant): { ring: string; leaf: string; vein: string } {
  switch (variant) {
    case "white":
      return { ring: COLORS.white, leaf: COLORS.white, vein: "transparent" };
    case "black":
      return { ring: COLORS.ink, leaf: COLORS.ink, vein: "transparent" };
    case "onDark":
      return { ring: COLORS.gold, leaf: COLORS.white, vein: COLORS.navy };
    case "color":
    default:
      return { ring: COLORS.navy, leaf: COLORS.forest, vein: COLORS.paper };
  }
}
