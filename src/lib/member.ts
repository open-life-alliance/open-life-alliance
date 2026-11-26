/**
 * Local, self-declared membership.
 *
 * V1 has no server: a member record lives only in the visitor's browser.
 * IDs are random (not sequential) so they reveal nothing about how many
 * people have joined. They are NOT globally verified — see docs/DECISIONS.md.
 */

/** Preset lifestyle choices. Members can also add their own (customCommitments). */
export const COMMITMENT_IDS = [
  "smokeFree",
  "alcoholFree",
  "earlySleep",
  "running",
  "workout",
  "healthyEating",
  "lessSugar",
  "lessScreen",
  "reading",
  "meditation",
] as const;
export type CommitmentId = (typeof COMMITMENT_IDS)[number];

/** Most choices that fit nicely on one card (presets + custom). */
export const MAX_CHOICES = 5;
export const MAX_CUSTOM_LENGTH = 24;
/** Suggested time frames, in days. */
export const PERIOD_PRESETS = [7, 21, 30, 100, 365] as const;
export const MAX_PERIOD_DAYS = 3650;

/**
 * A self-set time frame. `days: null` means "ongoing, since `start`".
 * Purely personal: nothing ever checks it.
 */
export interface Period {
  days: number | null;
  /** YYYY-MM-DD */
  start: string;
}

export const TEMPLATE_IDS = ["classic", "badge", "commitment"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const FORMAT_IDS = ["certificate", "square", "portrait", "landscape", "story"] as const;
export type FormatId = (typeof FORMAT_IDS)[number];

export const MAX_NAME_LENGTH = 40;
export const MAX_STATEMENT_LENGTH = 140;

export interface CardPrefs {
  template: TemplateId;
  format: FormatId;
  cardLocale: string;
}

export interface Member {
  /** Schema version, for future migrations. */
  v: 1;
  id: string;
  displayName: string;
  /** ISO 3166-1 alpha-2 code, optional. */
  country?: string;
  /** Calendar date of joining, YYYY-MM-DD (UTC). */
  joinedAt: string;
  commitments: CommitmentId[];
  /** Free-text choices written by the member, e.g. "10,000 steps a day". */
  customCommitments?: string[];
  period?: Period;
  /** Index into card.badge.headlines (same order in every language). */
  headline?: number;
  statement?: string;
  prefs?: Partial<CardPrefs>;
}

export function choiceCount(m: Pick<Member, "commitments" | "customCommitments">): number {
  return m.commitments.length + (m.customCommitments?.length ?? 0);
}

export function normalizeCustom(raw: string): string {
  // Count characters, not UTF-16 units, so emoji are never cut in half.
  return Array.from(normalizeName(raw)).slice(0, MAX_CUSTOM_LENGTH).join("").trim();
}

function isValidDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
}

export function sanitizePeriod(p: unknown): Period | undefined {
  if (!p || typeof p !== "object") return undefined;
  const { days, start } = p as Record<string, unknown>;
  if (!isValidDate(start)) return undefined;
  if (days === null) return { days: null, start };
  if (typeof days === "number" && Number.isInteger(days) && days >= 1 && days <= MAX_PERIOD_DAYS) {
    return { days, start };
  }
  return undefined;
}

/** Last day (inclusive) of a fixed period, as YYYY-MM-DD. */
export function periodEnd(p: Period): string | null {
  if (p.days === null) return null;
  const d = new Date(`${p.start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + p.days - 1);
  return d.toISOString().slice(0, 10);
}

const STORAGE_KEY = "ola.member.v1";

// Crockford Base32: no I, L, O, U — easy to read aloud and copy by hand.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function randomCode(length = 8, rng: (n: number) => Uint8Array = secureRandomBytes): string {
  const bytes = rng(length);
  let out = "";
  // 256 % 32 === 0, so masking keeps the distribution uniform.
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] & 31];
  return out;
}

function secureRandomBytes(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  globalThis.crypto.getRandomValues(arr);
  return arr;
}

export function generateMemberId(date = new Date()): string {
  return `OLA-${date.getUTCFullYear()}-${randomCode(8)}`;
}

export const MEMBER_ID_PATTERN = /^OLA-\d{4}-[0-9A-HJKMNP-TV-Z]{8}$/;

export function todayISO(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeName(raw: string): string {
  // Collapse whitespace and strip control characters.
  return raw.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
}

export function createMember(input: {
  displayName: string;
  country?: string;
  commitments?: CommitmentId[];
  customCommitments?: string[];
  period?: Period;
  now?: Date;
}): Member {
  const now = input.now ?? new Date();
  const commitments = (input.commitments ?? []).filter((c) => COMMITMENT_IDS.includes(c)).slice(0, MAX_CHOICES);
  const custom = (input.customCommitments ?? [])
    .map(normalizeCustom)
    .filter(Boolean)
    .slice(0, MAX_CHOICES - commitments.length);
  return {
    v: 1,
    id: generateMemberId(now),
    displayName: normalizeName(input.displayName).slice(0, MAX_NAME_LENGTH),
    country: input.country || undefined,
    joinedAt: todayISO(now),
    commitments,
    customCommitments: custom.length ? custom : undefined,
    period: sanitizePeriod(input.period),
  };
}

/** Drop anything stale or invalid (e.g. presets removed in a newer version). */
function cleanMember(m: Member): Member {
  const commitments = m.commitments.filter((c) => COMMITMENT_IDS.includes(c));
  const custom = Array.isArray(m.customCommitments)
    ? m.customCommitments.filter((s): s is string => typeof s === "string").map(normalizeCustom).filter(Boolean)
    : [];
  return {
    ...m,
    commitments,
    customCommitments: custom.length ? custom.slice(0, Math.max(0, MAX_CHOICES - commitments.length)) : undefined,
    period: sanitizePeriod(m.period),
    headline: Number.isInteger(m.headline) && (m.headline as number) >= 0 ? m.headline : undefined,
  };
}

function isMember(value: unknown): value is Member {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (
    m.v === 1 &&
    typeof m.id === "string" &&
    typeof m.displayName === "string" &&
    typeof m.joinedAt === "string" &&
    Array.isArray(m.commitments)
  );
}

export function loadMember(): Member | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isMember(parsed)) return null;
    return cleanMember(parsed);
  } catch {
    return null;
  }
}

/** Returns false if storage is unavailable (private mode, blocked cookies). */
export function saveMember(member: Member): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
    return true;
  } catch {
    return false;
  }
}

export function clearMember(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Fallback when localStorage is blocked: keep the member for this tab only,
 * so the join → card flow still works.
 */
export function saveMemberSession(member: Member): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(member));
  } catch {
    /* ignore */
  }
}

export function loadMemberAnywhere(): Member | null {
  const local = loadMember();
  if (local) return local;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isMember(parsed) ? cleanMember(parsed) : null;
  } catch {
    return null;
  }
}

export function persistMember(member: Member): void {
  if (!saveMember(member)) saveMemberSession(member);
}
