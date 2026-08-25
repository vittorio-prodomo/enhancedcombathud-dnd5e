import test from 'node:test';
import assert from 'node:assert/strict';
import {activityTargetCount, activityRanges, isPreparationChange, resolveOriginSheet} from './sheetUseGate.mjs';

/*
 * Queue T138/T139 — the sheet-cast intercept gate. These helpers are shared with the HUD
 * button getters (single source of truth), so their behavior must match the pre-existing
 * inline getter logic in echDnd5e.js exactly, T137's empty-string normalization included.
 */

const creature = (over = {}) => ({
    actionType: 'save',
    target: {affects: {type: 'creature', count: ''}, template: {units: ''}},
    range: {value: 30, long: null, units: 'ft'},
    ...over,
});

test('a non-template creature-targeting activity defaults empty count to 1 (T137)', () => {
    assert.equal(activityTargetCount(creature()), 1);
});

test('a real count passes through', () => {
    assert.equal(activityTargetCount(creature({target: {affects: {type: 'creature', count: 3}, template: {units: ''}}})), 3);
});

test('a template activity with a count still returns the count via the second branch', () => {
    const a = creature({target: {affects: {type: 'creature', count: 2}, template: {units: 'ft'}}});
    assert.equal(activityTargetCount(a), 2);
});

test('a template activity with no count yields null (no picker — matches HUD)', () => {
    const a = creature({target: {affects: {type: 'creature', count: ''}, template: {units: 'ft'}}});
    assert.equal(activityTargetCount(a), null);
});

test('attack action types get a normalized count even without a valid affects type', () => {
    for (const actionType of ['mwak', 'rwak', 'msak', 'rsak']) {
        const a = creature({actionType, target: {affects: {type: '', count: ''}, template: {units: ''}}});
        assert.equal(activityTargetCount(a), 1);
    }
});

test('a self/none-targeting non-attack activity yields null', () => {
    const a = creature({target: {affects: {type: 'self', count: ''}, template: {units: ''}}});
    assert.equal(activityTargetCount(a), null);
    assert.equal(activityTargetCount({actionType: 'util', target: undefined}), null);
});

test('ranges mirror the HUD getter, touch falling back to the grid distance', () => {
    assert.deepEqual(activityRanges(creature()), {normal: 30, long: null});
    assert.deepEqual(activityRanges({range: {value: null, long: null, units: 'touch'}}, 5), {normal: 5, long: null});
    assert.deepEqual(activityRanges({range: {value: 60, long: 120, units: 'ft'}}), {normal: 60, long: 120});
    assert.deepEqual(activityRanges(undefined), {normal: null, long: null});
});

test('isPreparationChange fires only for spell updates touching preparation state', () => {
    const spell = {type: 'spell'};
    // dnd5e 5.3 diff shape (verified live): flattened numeric `prepared` + `method`
    assert.equal(isPreparationChange(spell, {system: {prepared: 1}, _id: 'x'}), true);
    assert.equal(isPreparationChange(spell, {system: {prepared: 0}}), true);
    assert.equal(isPreparationChange(spell, {system: {method: 'innate'}}), true);
    // legacy pre-5.3 write shape
    assert.equal(isPreparationChange(spell, {system: {preparation: {prepared: true}}}), true);
    assert.equal(isPreparationChange(spell, {system: {uses: {spent: 1}}}), false);
    assert.equal(isPreparationChange({type: 'weapon'}, {system: {prepared: 1}}), false);
    assert.equal(isPreparationChange(spell, undefined), false);
});

/* resolveOriginSheet: DI'd lookup so it runs without a DOM/foundry. */
const fakeEvent = (el) => ({target: {closest: (sel) => (sel === '.application, .app' ? el : null)}});

test('resolveOriginSheet finds the actor sheet the click came from', () => {
    const actor = {id: 'a1'};
    const el = {id: 'app-42', dataset: {}};
    const app = {document: actor};
    const sheet = resolveOriginSheet(fakeEvent(el), actor, {byElement: (e) => (e === el ? app : null)});
    assert.equal(sheet, app);
});

test('resolveOriginSheet rejects a window belonging to a different document', () => {
    const el = {id: 'app-42', dataset: {}};
    const app = {document: {id: 'other'}};
    assert.equal(resolveOriginSheet(fakeEvent(el), {id: 'a1'}, {byElement: () => app}), null);
});

test('resolveOriginSheet is null for HUD clicks, missing events, and unmatched windows', () => {
    assert.equal(resolveOriginSheet(undefined, {id: 'a1'}, {byElement: () => null}), null);
    assert.equal(resolveOriginSheet({target: {closest: () => null}}, {id: 'a1'}, {byElement: () => ({})}), null);
    assert.equal(resolveOriginSheet(fakeEvent({id: 'x', dataset: {}}), {id: 'a1'}, {byElement: () => null}), null);
});

test('resolveOriginSheet accepts a legacy AppV1 sheet exposing .actor instead of .document', () => {
    const actor = {id: 'a1'};
    const el = {id: '', dataset: {appid: '7'}};
    const app = {actor};
    assert.equal(resolveOriginSheet(fakeEvent(el), actor, {byElement: () => app}), app);
});
