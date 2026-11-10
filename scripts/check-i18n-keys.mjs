// Checks that src/messages/ur.json has every key present in src/messages/en.json.
// A missing translation falls back silently at runtime (see #206), so this guard
// fails CI before a drift can ship unnoticed. Run with: npm run check:i18n

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const enPath = join(projectRoot, "src", "messages", "en.json");
const urPath = join(projectRoot, "src", "messages", "ur.json");

// Flattens nested message objects into dotted keys, e.g. { navbar: { home: 'Home' } }
// becomes 'navbar.home'. Only keys matter here, not values.
function flattenKeys(messages, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function loadMessages(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

const enKeys = flattenKeys(loadMessages(enPath));
const urKeys = new Set(flattenKeys(loadMessages(urPath)));

const missingKeys = enKeys.filter((key) => !urKeys.has(key));

if (missingKeys.length > 0) {
  console.error(
    `ur.json is missing ${missingKeys.length} key(s) present in en.json:`,
  );
  for (const key of missingKeys) {
    console.error(`  - ${key}`);
  }
  process.exit(1);
}

const extraKeys = [...urKeys].filter((key) => !enKeys.includes(key));
if (extraKeys.length > 0) {
  console.log(
    `Note: ur.json has ${extraKeys.length} extra key(s) not in en.json (not a failure):`,
  );
  for (const key of extraKeys) {
    console.log(`  - ${key}`);
  }
}

console.log(
  `i18n key parity OK: ${enKeys.length} keys in en.json, all present in ur.json.`,
);
