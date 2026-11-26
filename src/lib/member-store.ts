"use client";

/**
 * React binding for the locally stored member (an external store backed by
 * localStorage). Components subscribe with `useMember()`; writes go through
 * `updateMember()` so every subscriber re-renders, including other tabs.
 */
import { useSyncExternalStore } from "react";
import { clearMember, loadMemberAnywhere, persistMember, type Member } from "./member";

const listeners = new Set<() => void>();
let cache: { member: Member | null } | null = null;

function read(): Member | null {
  if (!cache) cache = { member: loadMemberAnywhere() };
  return cache.member;
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith("ola.")) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** `undefined` while rendering on the server / before hydration; `null` if not joined. */
export function useMember(): Member | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function setStoredMember(member: Member): void {
  persistMember(member);
  cache = { member };
  emit();
}

export function updateMember(patch: Partial<Member> | ((m: Member) => Partial<Member>)): void {
  const current = read();
  if (!current) return;
  const p = typeof patch === "function" ? patch(current) : patch;
  setStoredMember({ ...current, ...p });
}

export function forgetMember(): void {
  clearMember();
  cache = { member: null };
  emit();
}

const noopSubscribe = () => () => {};

/** Read a browser-only value without a hydration mismatch. */
export function useClientValue<T>(get: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, get, () => serverValue);
}
