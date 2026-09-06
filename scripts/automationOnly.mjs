// FORK (T225 follow-up, 2026-09-06): activities midi marks `automationOnly` are
// "used only by automation" — never a button. The HUD's panels all gate through
// `checkActivationType`, so one predicate hides such activities and, for an item
// whose usable activities are all automation-only, the item itself. Pure, tested.
//
// FORK (T216 residue, 2026-09-06): the same goes for dnd5e RIDER activities
// (`flags.dnd5e.riders.activity`, `Activity#isRider`). dnd5e parks a rider by
// making `canUse` false; CPR uses that mechanism for its helper activities (Mage
// Hand's Move, Flaming Sphere's Move, Hunter's Mark's Move, Magic Missile's bolts,
// Find Familiar's Touch/Pocket Dimension, Guidance's self-cast) but then wraps
// `canUse` back to true so its own programmatic uses work — so the HUD, which
// never looked at the rider flag, showed them as permanent buttons. CPR unhides a
// rider by removing it from the flag (Mage Hand summoned → Move appears), which
// this predicate honours because it reads the flag, not `canUse`.

/** @param {any} activity */
export function isAutomationOnlyActivity(activity) {
  return activity?.midiProperties?.automationOnly === true;
}

/**
 * Is this activity a dnd5e rider — parked by its item until something unhides it?
 * Reads the live getter when present, else the flag it is derived from.
 * @param {any} activity
 */
export function isRiderActivity(activity) {
  if (!activity) return false;
  if (typeof activity.isRider === "boolean") return activity.isRider;
  const riders = activity.item?.flags?.dnd5e?.riders?.activity;
  return Array.isArray(riders) && riders.includes(activity.id ?? activity._id);
}

/** Never a button: automation plumbing or a parked rider. @param {any} activity */
export function isHiddenActivity(activity) {
  return isAutomationOnlyActivity(activity) || isRiderActivity(activity);
}

/**
 * The activities of an item that may still become buttons.
 * @param {any} item  something with `system.activities` (a Collection, Map or array)
 * @returns {any[]}
 */
export function buttonActivities(item) {
  const activities = item?.system?.activities;
  if (!activities) return [];
  // A Foundry Collection iterates values; a plain Map iterates entries — `values()` serves both.
  const list = typeof activities.values === "function" && !Array.isArray(activities)
    ? Array.from(activities.values())
    : (Array.isArray(activities) ? activities : Object.values(activities));
  return list.filter((activity) => !isHiddenActivity(activity));
}

/**
 * Does this item or activity belong in a panel of the given activation types?
 * A hidden activity never does; an item only through the activities that are
 * not hidden.
 * @param {any} itemOrActivity
 * @param {string[]} activationTypes
 * @returns {boolean|undefined}
 */
export function matchesActivationType(itemOrActivity, activationTypes) {
  if (itemOrActivity?.activation?.type !== undefined && !itemOrActivity?.system) {
    if (isHiddenActivity(itemOrActivity)) return false;
    return activationTypes.includes(itemOrActivity.activation.type);
  }
  if (!itemOrActivity?.system?.activities) return;
  for (const activity of buttonActivities(itemOrActivity)) {
    if (activationTypes.includes(activity.activation?.type)) return true;
  }
  return false;
}
