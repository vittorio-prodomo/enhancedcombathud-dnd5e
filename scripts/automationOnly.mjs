// FORK (T225 follow-up, 2026-09-06): activities midi marks `automationOnly` are
// "used only by automation" — never a button. The HUD's panels all gate through
// `checkActivationType`, so one predicate hides such activities and, for an item
// whose usable activities are all automation-only, the item itself. Pure, tested.

/** @param {any} activity */
export function isAutomationOnlyActivity(activity) {
  return activity?.midiProperties?.automationOnly === true;
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
  return list.filter((activity) => !isAutomationOnlyActivity(activity));
}

/**
 * Does this item or activity belong in a panel of the given activation types?
 * An automation-only activity never does; an item only through the activities
 * that are not automation-only.
 * @param {any} itemOrActivity
 * @param {string[]} activationTypes
 * @returns {boolean|undefined}
 */
export function matchesActivationType(itemOrActivity, activationTypes) {
  if (itemOrActivity?.activation?.type !== undefined && !itemOrActivity?.system) {
    if (isAutomationOnlyActivity(itemOrActivity)) return false;
    return activationTypes.includes(itemOrActivity.activation.type);
  }
  if (!itemOrActivity?.system?.activities) return;
  for (const activity of buttonActivities(itemOrActivity)) {
    if (activationTypes.includes(activity.activation?.type)) return true;
  }
  return false;
}
