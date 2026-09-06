// FORK (Vittorio, 2026-09-06): "reminder" buttons — a feature with a uses pool but no
// activity of its own (Combat Superiority: the maneuvers spend its dice through CPR)
// gets a button that only shows the remaining count; its click posts the feature's
// chat card and nothing else. Driven by the world setting `reminderItems` (a list of
// dnd5e item identifiers), so nothing on the item changes and re-imports cannot undo it.

/** @param {string | null | undefined} raw */
export function parseIdentifierList(raw) {
  const out = new Set();
  for (const part of String(raw ?? "").split(/[\s,;]+/)) {
    const id = part.trim().toLowerCase();
    if (id) out.add(id);
  }
  return out;
}

/** A uses pool that can hold something (numbers or a formula such as "@prof"). */
export function hasUsesPool(item) {
  const max = item?.system?.uses?.max;
  if (max === undefined || max === null) return false;
  if (typeof max === "number") return max > 0;
  const s = String(max).trim();
  return !!s && Number(s) !== 0;
}

/**
 * Should this item get a reminder button? Listed by identifier, and carrying a pool.
 * (Whether it also has activities is irrelevant: the reminder is about the pool.)
 * @param {any} item
 * @param {Set<string>} registry
 */
export function isReminderItem(item, registry) {
  const id = item?.identifier ?? item?.system?.identifier;
  if (!id || !registry.has(String(id).toLowerCase())) return false;
  return hasUsesPool(item);
}

/** Remaining uses for the badge, or null without a pool. */
export function remainingUses(item) {
  if (!hasUsesPool(item)) return null;
  const uses = item.system.uses;
  if (typeof uses.value === "number") return uses.value;
  const max = Number(uses.max);
  return Number.isFinite(max) ? max - (Number(uses.spent) || 0) : null;
}
