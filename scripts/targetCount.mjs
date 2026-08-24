/*
 * Queue T137 — normalize an activity's `target.affects.count` for the target-picker gate.
 *
 * DDB-imported spells routinely store the count as the EMPTY STRING (dnd5e's schema allows a
 * blank formula field), which means "unspecified", not "zero targets". `??` passed '' through and
 * the picker silently skipped a whole class of healthy spells (Charm Person was the repro).
 * `null`/`undefined`/'' all mean "default to one target"; anything else (numbers, numeric strings,
 * formulas) passes through untouched.
 */
export function normalizeTargetCount(count) {
    return count || 1;
}
