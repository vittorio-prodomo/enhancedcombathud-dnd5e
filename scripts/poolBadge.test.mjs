import { test } from "node:test";
import assert from "node:assert/strict";
import { consumedItemId, ownRemaining, poolBadge, poolItemFor } from "./poolBadge.mjs";

const pool = { identifier: "combat-superiority", type: "feat", system: { uses: { max: 4, spent: 1, value: 3 } } };
const maneuver = (over = {}) => ({ type: "feat", system: { type: { value: "class", subtype: "maneuver" }, uses: { max: "", spent: null, value: 0 } }, ...over });
const items = [pool, { identifier: "second-wind", system: { uses: { max: 2, value: 2 } } }];

test("an on-hit rider with no target reads the class pool — his Goading and Maneuvering Attack", () => {
  assert.equal(poolBadge(maneuver(), { consumption: { targets: [] } }, items), 3);
  assert.equal(poolBadge(maneuver(), undefined, items), 3);
});

test("a maneuver whose activity already targets the pool is left to the normal badge (Riposte)", () => {
  assert.equal(consumedItemId({ consumption: { targets: [{ type: "itemUses", target: "KYPP" }] } }), "KYPP");
  assert.equal(poolBadge(maneuver(), { consumption: { targets: [{ type: "itemUses", target: "KYPP" }] } }, items), null);
});

test("an item with its own pool, a non-maneuver feat, or an actor without the pool: no badge", () => {
  assert.equal(ownRemaining(pool), 3);
  assert.equal(poolBadge({ ...maneuver(), system: { type: { subtype: "maneuver" }, uses: { max: 2, value: 1, spent: 1 } } }, undefined, items), null);
  assert.equal(poolBadge({ type: "feat", system: { type: { subtype: "origin" }, uses: { max: "" } } }, undefined, items), null);
  assert.equal(poolBadge(maneuver(), undefined, []), null);
  assert.equal(poolItemFor(maneuver(), items), pool);
});

test("the pool may be named by either identifier; identifiers may live on system.identifier", () => {
  const alt = [{ system: { identifier: "superiority-dice", uses: { max: "4", spent: 4 } } }];
  assert.equal(poolBadge(maneuver(), undefined, alt), 0);
});
