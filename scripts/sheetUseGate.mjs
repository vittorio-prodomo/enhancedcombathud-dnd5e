/*
 * Queue T138/T139 — cast/attack from the character sheet behaves like an Argon HUD click.
 *
 * Pure helpers for the `dnd5e.preUseActivity` intercept in echDnd5e.js. The target-count and
 * range logic is the HUD button's getter logic extracted verbatim (T137 normalization included)
 * so the sheet path and the HUD path can never drift apart.
 */
import {normalizeTargetCount} from './targetCount.mjs';

const VALID_TARGETS = ['creature', 'ally', 'enemy', 'willing'];
const ATTACK_ACTION_TYPES = ['mwak', 'rwak', 'msak', 'rsak'];

export function activityTargetCount(activity) {
    if (!activity) return null;
    const actionType = activity.actionType;
    const affects = activity.target?.affects ?? {};
    const targetType = affects.type;
    if (!activity.target?.template?.units && VALID_TARGETS.includes(targetType)) {
        return normalizeTargetCount(affects.count);
    } else if (VALID_TARGETS.includes(targetType) && affects.count) {
        return affects.count;
    } else if (ATTACK_ACTION_TYPES.includes(actionType)) {
        return normalizeTargetCount(affects.count);
    }
    return null;
}

export function activityRanges(activity, touchDistance = null) {
    const touchRange = activity?.range?.units == 'touch' ? touchDistance : null;
    return {
        normal: activity?.range?.value ?? touchRange,
        long: activity?.range?.long ?? null,
    };
}

/*
 * Queue T142 — preparing/unpreparing a spell only refreshed the portrait; the spell panels
 * need a full (debounced) HUD refresh to grow/lose buttons.
 *
 * ⚠️ dnd5e 5.3 flattened the schema: the update diff carries `system.prepared` (0/1) and
 * `system.method` — `system.preparation.*` is only a legacy WRITE shim that never appears in
 * the diff (verified live on 5.3.3). Match all three so older write shapes stay covered.
 */
export function isPreparationChange(item, changes) {
    if (item?.type !== 'spell') return false;
    const sys = changes?.system;
    return sys?.prepared !== undefined || sys?.method !== undefined || sys?.preparation !== undefined;
}

/*
 * Identify the sheet window a use-click originated from. Programmatic uses (CPR/midi/GPS
 * automation, macros, chat cards) carry no sheet-DOM event and resolve null, which is what
 * keeps the intercept from firing mid-automation. `lookup.byElement` is injected so tests
 * run without a DOM; the live default lives in echDnd5e.js (AppV2 instances + ui.windows).
 */
export function resolveOriginSheet(event, actor, lookup) {
    const el = event?.target?.closest?.('.application, .app');
    if (!el) return null;
    const app = lookup.byElement(el);
    if (!app) return null;
    const doc = app.document ?? app.actor;
    return doc === actor ? app : null;
}
