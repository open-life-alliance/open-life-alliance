import { describe, expect, it } from "vitest";
import {
  MAX_CHOICES,
  MEMBER_ID_PATTERN,
  choiceCount,
  periodEnd,
  sanitizePeriod,
  createMember,
  generateMemberId,
  normalizeName,
  randomCode,
} from "./member";
import { matchLocale } from "../i18n/locales";
import { fillTemplate } from "./share";

describe("member IDs", () => {
  it("match the OLA-YYYY-XXXXXXXX format", () => {
    const id = generateMemberId(new Date("2026-03-01T12:00:00Z"));
    expect(id).toMatch(MEMBER_ID_PATTERN);
    expect(id.startsWith("OLA-2026-")).toBe(true);
  });

  it("never use ambiguous characters", () => {
    for (let i = 0; i < 500; i++) expect(randomCode()).not.toMatch(/[ILOU]/);
  });

  it("are unique across many draws", () => {
    const seen = new Set(Array.from({ length: 5000 }, () => generateMemberId()));
    expect(seen.size).toBe(5000);
  });
});

describe("createMember", () => {
  it("cleans the name and drops unknown commitments", () => {
    const m = createMember({
      displayName: "  Lin \n  Xiaoyu  ",
      // @ts-expect-error testing bad input
      commitments: ["smokeFree", "bogus"],
      now: new Date("2026-11-26T08:00:00Z"),
    });
    expect(m.displayName).toBe("Lin Xiaoyu");
    expect(m.commitments).toEqual(["smokeFree"]);
    expect(m.joinedAt).toBe("2026-11-26");
    expect(m.v).toBe(1);
  });

  it("keeps CJK names intact", () => {
    expect(normalizeName("  林小雨 ")).toBe("林小雨");
  });
});

describe("lifestyle choices and time frame", () => {
  it("keeps custom choices, trimmed, within the card limit", () => {
    const m = createMember({
      displayName: "A",
      commitments: ["smokeFree", "running", "reading"],
      customCommitments: ["  10,000 steps a day  ", "", "Cold showers", "Too many"],
    });
    expect(m.commitments).toEqual(["smokeFree", "running", "reading"]);
    expect(m.customCommitments).toEqual(["10,000 steps a day", "Cold showers"]);
    expect(choiceCount(m)).toBe(MAX_CHOICES);
  });

  it("computes the inclusive end of a fixed period", () => {
    expect(periodEnd({ days: 30, start: "2026-11-26" })).toBe("2026-12-25");
    expect(periodEnd({ days: 1, start: "2026-02-28" })).toBe("2026-02-28");
    expect(periodEnd({ days: null, start: "2026-11-26" })).toBeNull();
  });

  it("rejects invalid periods", () => {
    expect(sanitizePeriod({ days: 0, start: "2026-11-26" })).toBeUndefined();
    expect(sanitizePeriod({ days: 21.5, start: "2026-11-26" })).toBeUndefined();
    expect(sanitizePeriod({ days: 21, start: "not a date" })).toBeUndefined();
    expect(sanitizePeriod({ days: null, start: "2026-11-26" })).toEqual({ days: null, start: "2026-11-26" });
  });
});

describe("matchLocale", () => {
  it("maps Chinese variants to Simplified Chinese", () => {
    expect(matchLocale(["zh-CN"])).toBe("zh-Hans");
    expect(matchLocale(["zh"])).toBe("zh-Hans");
    expect(matchLocale(["zh-Hans-SG"])).toBe("zh-Hans");
  });
  it("falls back to English", () => {
    expect(matchLocale(["fr-FR", "de"])).toBe("en");
    expect(matchLocale(["en-GB"])).toBe("en");
  });
});

describe("fillTemplate", () => {
  it("replaces placeholders", () => {
    expect(fillTemplate("Join at {url}!", { url: "https://x.org" })).toBe("Join at https://x.org!");
  });
});
