import { test } from "node:test";
import assert from "node:assert/strict";
import { hasUsesPool, isReminderItem, parseIdentifierList, remainingUses } from "./reminderButtons.mjs";

const registry = parseIdentifierList("combat-superiority, ki");
const item = (identifier, uses, extra = {}) => ({ identifier, system: { uses, ...extra } });

test("parseIdentifierList normalises separators and case", () => {
  assert.deepEqual([...parseIdentifierList(" Combat-Superiority ;ki,\n")], ["combat-superiority", "ki"]);
  assert.equal(parseIdentifierList(undefined).size, 0);
});

test("Combat Superiority: listed + a pool → reminder; unlisted or poolless → not", () => {
  assert.equal(isReminderItem(item("combat-superiority", { max: 4, spent: 1, value: 3 }), registry), true);
  assert.equal(isReminderItem(item("second-wind", { max: 2, spent: 0, value: 2 }), registry), false);
  assert.equal(isReminderItem(item("combat-superiority", { max: 0, spent: 0, value: 0 }), registry), false);
  assert.equal(isReminderItem(item("combat-superiority", { max: "", spent: 0 }), registry), false);
  assert.equal(isReminderItem(null, registry), false);
});

test("a formula pool counts as a pool; the badge reads value, or max minus spent", () => {
  assert.equal(hasUsesPool(item("x", { max: "@prof" })), true);
  assert.equal(remainingUses(item("x", { max: 4, spent: 1, value: 3 })), 3);
  assert.equal(remainingUses(item("x", { max: "4", spent: 1 })), 3);
  assert.equal(remainingUses(item("x", { max: 0 })), null);
});

test("the item's identifier may also live on system.identifier", () => {
  assert.equal(isReminderItem({ system: { identifier: "combat-superiority", uses: { max: 4, value: 4, spent: 0 } } }, registry), true);
});
