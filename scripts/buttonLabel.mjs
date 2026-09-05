// FORK (Vittorio, 2026-09-06): button and tooltip names without plumbing —
// no "Use (…)" / "Save (…)" wrappers and no "Maneuver: " category prefix.
// Pure, tested; echDnd5e.js's label getter and tooltip title delegate here.

/** Category prefixes the sheet keeps but a button does not need. */
export const STRIPPED_PREFIXES = ["Maneuver: ", "Manovra: "];

/**
 * The name a button shows for an item: the item's name minus a category prefix.
 * @param {string | null | undefined} name
 * @returns {string}
 */
export function displayItemName(name) {
  let out = String(name ?? "").trim();
  for (const prefix of STRIPPED_PREFIXES) {
    if (out.toLowerCase().startsWith(prefix.toLowerCase())) return out.slice(prefix.length).trim();
  }
  return out;
}

/**
 * Is this activity name one of dnd5e's generic defaults ("Use", "Save", "Attack",
 * "Heal", …) that says nothing about the feature?
 * @param {string} activityName
 * @param {Iterable<string>} genericNames  localized type titles (+ "Use")
 */
export function isGenericActivityName(activityName, genericNames) {
  const needle = String(activityName ?? "").trim().toLowerCase();
  if (!needle) return true;
  for (const g of genericNames) if (String(g ?? "").trim().toLowerCase() === needle) return true;
  return false;
}

function sharesIdentity(activityName, itemName) {
  if (activityName.includes(itemName)) return true;
  const itemWords = itemName.toLowerCase().split(/\s+/).filter((w) => w.length >= 4);
  return activityName.toLowerCase().split(/\s+/).some((w) => w.length >= 4
    && itemWords.some((iw) => iw === w || iw.startsWith(w) || w.startsWith(iw)));
}

/**
 * The label of an activity button.
 *  - a generic activity name → the item's display name ("Goading Attack", not "Save (Maneuver: Goading Attack)")
 *  - an activity name that already identifies the item (contains it, or shares a
 *    word stem — "Spend Luck Point" on "Lucky") → the activity name
 *  - anything else → "Item: Activity" ("Tactical Mind: Expend Second Wind"), never parentheses
 * @param {{ activityName?: string|null, itemName?: string|null, genericNames?: Iterable<string> }} p
 * @returns {string}
 */
export function activityButtonLabel({ activityName, itemName, genericNames = ["Use"] }) {
  const item = displayItemName(itemName);
  const activity = String(activityName ?? "").trim();
  if (isGenericActivityName(activity, genericNames)) return item;
  if (!item) return activity;
  if (sharesIdentity(activity, itemName ?? "") || sharesIdentity(activity, item)) return activity;
  return `${item}: ${activity}`;
}
