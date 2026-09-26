#!/usr/bin/env tsx
/**
 * Licence gate for the npm tree. Fails `pnpm check` when any installed package
 * (runtime or dev) carries a licence outside the permissive allowlist. Policy:
 * guidance/runbooks/project-visibility-and-licensing.md — same allowlist as
 * Oblique's scripts/check-licenses.mjs.
 *
 * Allowlist or exception changes happen here AND in THIRD-PARTY.md, same commit.
 */
import { execFileSync } from "node:child_process";

const ALLOWED = new Set([
  "MIT",
  "MIT-0",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "Zlib",
  "Unlicense",
  "CC0-1.0",
  "BlueOak-1.0.0",
  "Python-2.0",
  "MIT-CMU",
  "HPND",
  "OFL-1.1", // fonts only
  "CC-BY-4.0", // data/docs assets only
]);

/**
 * Reviewed exceptions, matched by package-name prefix so every platform
 * variant (darwin locally, linux in CI) is covered. Value = the reason.
 */
const EXCEPTIONS = new Map([
  // MPL-2.0, file-level copyleft: build-time CSS tooling under Tailwind v4,
  // used unmodified, never in the bundle. Same review as Oblique, 2026-07-04.
  ["lightningcss", "MPL-2.0 — build-time only, unmodified"],
  // LGPL-3.0, dynamically linked native libvips behind sharp, which
  // @huggingface/transformers pulls in for its Node image pipeline. The
  // browser bundle never includes it. Reviewed 2026-09-27.
  ["@img/sharp-libvips-", "LGPL-3.0 — Node-only, never in the bundle"],
]);

function isException(name: string): boolean {
  return [...EXCEPTIONS.keys()].some((prefix) => name.startsWith(prefix));
}

/** SPDX expression check: OR passes if any branch passes; AND needs all. */
function licenceAllowed(expr: string): boolean {
  const stripped = expr.replaceAll("(", " ").replaceAll(")", " ").trim();
  if (/\bOR\b/.test(stripped)) {
    return stripped.split(/\bOR\b/).some((part) => licenceAllowed(part.trim()));
  }
  if (/\bAND\b/.test(stripped)) {
    return stripped.split(/\bAND\b/).every((part) => licenceAllowed(part.trim()));
  }
  return ALLOWED.has(stripped);
}

const raw = execFileSync("pnpm", ["licenses", "list", "--json", "--prod=false"], {
  encoding: "utf8",
});
const byLicence = JSON.parse(raw) as Record<string, { name: string }[]>;

const violations: string[] = [];
for (const [licence, packages] of Object.entries(byLicence)) {
  if (licenceAllowed(licence)) continue;
  for (const pkg of packages) {
    if (isException(pkg.name)) continue;
    violations.push(`  ${pkg.name} — ${licence}`);
  }
}

if (violations.length > 0) {
  console.error("Licence gate: disallowed licences in the npm tree:");
  console.error(violations.join("\n"));
  console.error(
    "\nPolicy: guidance/runbooks/project-visibility-and-licensing.md (permissive-only).",
  );
  process.exit(1);
}
console.log(`licence gate: ${Object.keys(byLicence).length} licence groups, all permissive ✔`);
