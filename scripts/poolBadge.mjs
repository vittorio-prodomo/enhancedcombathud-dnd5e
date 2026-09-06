// FORK (Vittorio, 2026-09-06): the dice badge on EVERY maneuver button.
//
// Only "directly used" maneuvers (Riposte, Parry, Rally, …) carry a consumption target on
// Combat Superiority; the on-hit riders (Goading Attack, Maneuvering Attack, …) are spent by
// CPR's superiority driver and deliberately carry none — a target on them would cost a die
// on a refused use (see the Battle Master memory). So the badge is DISPLAY-ONLY here: a
// maneuver with no pool and no consumption target shows its class pool's remaining uses.
// Nothing on the items changes, so re-imports cannot undo it.

/** Feature subtypes whose buttons read a shared pool, and the pool's identifiers (first found wins). */
export const POOL_BY_SUBTYPE = {
  maneuver: ["combat-superiority", "superiority-dice"],
};

/** Remaining uses of an item's own pool, or null without one. */
export function ownRemaining(item) {
  const uses = item?.system?.uses;
  const max = uses?.max;
  if (max === undefined || max === null || max === "" || Number(max) === 0) return null;
  if (typeof uses.value === "number") return uses.value;
  const n = Number(max);
  return Number.isFinite(n) ? n - (Number(uses.spent) || 0) : null;
}

/** The consumption target id of an activity's `itemUses` entry, or null. */
export function consumedItemId(activity) {
  return activity?.consumption?.targets?.find((t) => t?.type === "itemUses")?.target ?? null;
}

/**
 * The pool item a maneuver (or any mapped subtype) reads its badge from.
 * @param {any} item      the feature
 * @param {any[]} items   the actor's items (anything with `identifier`/`system.identifier`)
 * @returns {any|null}
 */
export function poolItemFor(item, items) {
  if (item?.type !== "feat") return null;
  const subtype = item?.system?.type?.subtype;
  const ids = subtype ? POOL_BY_SUBTYPE[subtype] : null;
  if (!ids) return null;
  for (const id of ids) {
    const found = (items ?? []).find((i) => String(i?.identifier ?? i?.system?.identifier ?? "").toLowerCase() === id);
    if (found) return found;
  }
  return null;
}

/**
 * The badge for a feature button that has no pool of its own and whose activity
 * consumes nothing: the mapped pool's remaining uses; null when nothing applies.
 */
export function poolBadge(item, activity, items) {
  if (ownRemaining(item) !== null) return null;
  if (consumedItemId(activity)) return null;
  const pool = poolItemFor(item, items);
  return pool ? ownRemaining(pool) : null;
}
