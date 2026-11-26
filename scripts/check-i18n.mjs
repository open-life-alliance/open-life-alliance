/**
 * Verifies every language file has exactly the same keys (and array lengths)
 * as messages/en.json, and that {placeholders} match.
 * Run: npm run check:i18n
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");
const load = async (f) => JSON.parse(await readFile(join(dir, f), "utf8"));
const base = await load("en.json");
const files = (await readdir(dir)).filter((f) => f.endsWith(".json") && f !== "en.json");

// Strings that may legitimately be empty in some languages.
const MAY_BE_EMPTY = new Set(["card.orgLocalName"]);

// Matches {name} and ICU arguments like {days, plural, ...}.
const placeholders = (s) =>
  [...new Set([...s.matchAll(/\{(\w+)\s*[,}]/g)].map((m) => m[1]))].sort().join(",");

let problems = 0;
function compare(a, b, path, file) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return report(file, path, "should be a list");
    if (a.length !== b.length) report(file, path, `list has ${b.length} items, expected ${a.length}`);
    a.forEach((v, i) => b[i] !== undefined && compare(v, b[i], `${path}[${i}]`, file));
  } else if (a && typeof a === "object") {
    if (!b || typeof b !== "object") return report(file, path, "should be an object");
    for (const k of Object.keys(a)) {
      if (!(k in b)) report(file, `${path}${path ? "." : ""}${k}`, "missing");
      else compare(a[k], b[k], `${path}${path ? "." : ""}${k}`, file);
    }
    for (const k of Object.keys(b)) if (!(k in a)) report(file, `${path}${path ? "." : ""}${k}`, "not in en.json");
  } else if (typeof a === "string") {
    if (typeof b !== "string") return report(file, path, "should be text");
    if (!b.trim() && a.trim() && !MAY_BE_EMPTY.has(path)) report(file, path, "is empty");
    if (placeholders(a) !== placeholders(b)) report(file, path, `placeholders differ: {${placeholders(a)}} vs {${placeholders(b)}}`);
  }
}
function report(file, path, msg) {
  problems++;
  console.error(`✗ ${file}: ${path} ${msg}`);
}

for (const f of files) compare(base, await load(f), "", f);
if (problems) {
  console.error(`\n${problems} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ ${files.length + 1} language files are complete.`);
