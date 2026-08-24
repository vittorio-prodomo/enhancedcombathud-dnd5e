import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeTargetCount} from './targetCount.mjs';

/*
 * Queue T137: DDB-imported spells routinely carry `target.affects.count` as the EMPTY STRING
 * (Charm Person's compendium entry does). The picker gate returned `affects.count ?? 1` — and `??`
 * passes '' straight through, so the caller read a falsy target count and silently skipped the
 * target picker for a whole class of otherwise-healthy spells.
 */

test('an empty-string count means "unspecified" and defaults to 1', () => {
    assert.equal(normalizeTargetCount(''), 1);
});

test('null and undefined default to 1', () => {
    assert.equal(normalizeTargetCount(null), 1);
    assert.equal(normalizeTargetCount(undefined), 1);
});

test('a real count passes through untouched', () => {
    assert.equal(normalizeTargetCount(3), 3);
    assert.equal(normalizeTargetCount('2'), '2');
});

test('a formula string passes through untouched', () => {
    assert.equal(normalizeTargetCount('@abilities.cha.mod'), '@abilities.cha.mod');
});
