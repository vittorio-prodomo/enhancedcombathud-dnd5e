/*
 * Queue T212 follow-up (Vittorio, 2026-09-01) — "Show limited-use feats", the twin of
 * "Show Class Actions". Every action panel (Action / Bonus / Reaction / Free) splits its items
 * into big bar buttons vs the feat sub-menu; this predicate is that split, in one place.
 *
 *  - the pre-existing rule: the item's feature TYPE is in `mainBarFeatures` ("class" when
 *    "Show Class Actions" is on);
 *  - the new rule: a `feat` whose SUBTYPE is in `limitedUseFeatSubtypes` ("origin" when the twin
 *    setting is on) AND which carries a uses pool. Lucky qualifies (uses.max "@prof"); Magic
 *    Initiate does not — the importer leaves the feature inert and puts the free-cast pool on the
 *    spell row (T209) — nor do Alert or Tough.
 */
export function hasLimitedUses(item) {
    const max = item?.system?.uses?.max;
    if (max === undefined || max === null) return false;
    if (typeof max === "number") return max > 0;
    const s = String(max).trim();
    if (!s) return false;
    return Number(s) !== 0;
}

export function isMainBarItem(item, { mainBarFeatures = [], limitedUseFeatSubtypes = [] } = {}) {
    if (!item) return false;
    const typeValue = item.system?.type?.value;
    if (typeValue !== undefined && mainBarFeatures.includes(typeValue)) return true;
    if (item.type !== "feat" || typeValue !== "feat") return false;
    const subtype = item.system?.type?.subtype;
    if (!subtype || !limitedUseFeatSubtypes.includes(subtype)) return false;
    return hasLimitedUses(item);
}
