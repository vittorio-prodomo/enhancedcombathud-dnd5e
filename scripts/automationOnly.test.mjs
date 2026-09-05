import { test } from "node:test";
import assert from "node:assert/strict";
import { buttonActivities, isAutomationOnlyActivity, matchesActivationType } from "./automationOnly.mjs";

const act = (type, automationOnly = false) => ({ activation: { type }, midiProperties: { automationOnly } });
const item = (...activities) => ({ system: { activities } });

test("an automation-only activity is never a button, whatever its activation type", () => {
  assert.equal(isAutomationOnlyActivity(act("special", true)), true);
  assert.equal(matchesActivationType(act("special", true), ["special"]), false);
  assert.equal(matchesActivationType(act("action", true), ["action"]), false);
  assert.equal(matchesActivationType(act("special"), ["special"]), true);
});

test("an item counts only through its non-automation activities", () => {
  assert.equal(matchesActivationType(item(act("special", true)), ["special"]), false, "Relentless Endurance: its only activity is automation-only");
  assert.equal(matchesActivationType(item(act("action", true)), ["action"]), false, "Savage Attacker likewise");
  assert.equal(matchesActivationType(item(act("action", true), act("bonus")), ["bonus"]), true, "a second, real activity still shows");
  assert.equal(matchesActivationType(item(act("action", true), act("bonus")), ["action"]), false);
  assert.deepEqual(buttonActivities(item(act("action", true), act("bonus"))).length, 1);
});

test("a plain activity keeps the old behaviour; an item with no activities answers undefined", () => {
  assert.equal(matchesActivationType(act("reaction"), ["reaction", "reactionmanual"]), true);
  assert.equal(matchesActivationType(act("reaction"), ["action"]), false);
  assert.equal(matchesActivationType({ system: {} }, ["action"]), undefined);
  assert.equal(matchesActivationType(item(act("bonus")), ["action"]), false);
});

test("activities may arrive as a Map/Collection or a plain object", () => {
  const map = new Map([["a", act("action", true)], ["b", act("action")]]);
  assert.equal(matchesActivationType({ system: { activities: map } }, ["action"]), true);
  assert.equal(matchesActivationType({ system: { activities: { a: act("action", true) } } }, ["action"]), false);
});
