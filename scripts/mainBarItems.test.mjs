import test from 'node:test';
import assert from 'node:assert/strict';
import { hasLimitedUses, isMainBarItem } from './mainBarItems.mjs';

/*
 * Queue T212 follow-up (2026-09-01) — "Show limited-use feats": the twin of "Show Class Actions".
 * One predicate decides bar-vs-submenu for every action panel; it must keep the pre-existing
 * `mainBarFeatures.includes(type.value)` behaviour exactly and ADD the feat rule.
 */
const feat = (subtype, max, over = {}) => ({ type: 'feat', system: { type: { value: 'feat', subtype }, uses: { max } }, ...over });
const classFeature = { type: 'feat', system: { type: { value: 'class', subtype: '' }, uses: { max: '' } } };
const ON = { mainBarFeatures: ['class'], limitedUseFeatSubtypes: ['origin'] };
const OFF = { mainBarFeatures: [], limitedUseFeatSubtypes: [] };

test('class features follow "Show Class Actions" exactly as before', () => {
    assert.equal(isMainBarItem(classFeature, ON), true);
    assert.equal(isMainBarItem(classFeature, { ...ON, mainBarFeatures: [] }), false);
});
test('Lucky — an origin feat with a uses pool (@prof) — goes on the bar when the twin setting is on', () => {
    assert.equal(isMainBarItem(feat('origin', '@prof'), ON), true);
    assert.equal(isMainBarItem(feat('origin', 2), ON), true);
});
test('Magic Initiate — an origin feat left INERT by the importer (no uses; the pool lives on the spell row) — stays in the sub-menu', () => {
    assert.equal(isMainBarItem(feat('origin', ''), ON), false);
    assert.equal(isMainBarItem(feat('origin', null), ON), false);
    assert.equal(isMainBarItem({ type: 'feat', system: { type: { value: 'feat', subtype: 'origin' } } }, ON), false);
});
test('Alert / Tough — origin feats with no uses — stay in the sub-menu', () => {
    assert.equal(isMainBarItem(feat('origin', undefined), ON), false);
});
test('a general feat with uses is promoted only if its subtype is in the list', () => {
    assert.equal(isMainBarItem(feat('general', 1), ON), false);
    assert.equal(isMainBarItem(feat('general', 1), { ...ON, limitedUseFeatSubtypes: ['origin', 'general'] }), true);
});
test('the twin setting off = the old behaviour: no feat is promoted, class actions untouched', () => {
    assert.equal(isMainBarItem(feat('origin', '@prof'), { ...ON, limitedUseFeatSubtypes: [] }), false);
    assert.equal(isMainBarItem(classFeature, { ...ON, limitedUseFeatSubtypes: [] }), true);
    assert.equal(isMainBarItem(feat('origin', '@prof'), OFF), false);
});
test('non-feats never qualify through the feat rule (a spell has no type.value; a weapon is not a feat)', () => {
    assert.equal(isMainBarItem({ type: 'spell', system: { uses: { max: 3 } } }, ON), false);
    assert.equal(isMainBarItem({ type: 'weapon', system: { type: { value: 'simpleM' }, uses: { max: 1 } } }, ON), false);
});
test('a uses max of 0 is not a pool', () => {
    assert.equal(hasLimitedUses(feat('origin', 0)), false);
    assert.equal(hasLimitedUses(feat('origin', '0')), false);
    assert.equal(hasLimitedUses(feat('origin', '@prof')), true);
});
test('a missing item is simply not on the bar', () => {
    assert.equal(isMainBarItem(undefined, ON), false);
});

const species = (max, over = {}) => ({ type: 'feat', system: { type: { value: 'race', subtype: '' }, uses: { max } }, ...over });
test('a limited-use species feature reaches the bar via the type-level list (Adrenaline Rush)', () => {
    const ON = { mainBarFeatures: ['class'], limitedUseFeatSubtypes: ['origin'], limitedUseFeatureTypes: ['race'] };
    assert.equal(isMainBarItem(species(2), ON), true);
    assert.equal(isMainBarItem(species(''), ON), false, 'a species feature with no pool stays off');
    assert.equal(isMainBarItem(species(2), { mainBarFeatures: [], limitedUseFeatSubtypes: [], limitedUseFeatureTypes: [] }), false, 'setting off');
});
