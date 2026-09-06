import { test } from "node:test";
import assert from "node:assert/strict";
import { buttonActivities, isAutomationOnlyActivity, isRiderActivity, matchesActivationType } from "./automationOnly.mjs";

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

test("a rider activity is never a button, and comes back once its item unhides it (T216 residue)", () => {
  const withRider = { flags: { dnd5e: { riders: { activity: ["move"] } } } };
  const move = { id: "move", activation: { type: "bonus" }, midiProperties: { automationOnly: false }, item: withRider };
  const cast = { id: "cast", activation: { type: "action" }, midiProperties: { automationOnly: false }, item: withRider };
  assert.equal(isRiderActivity(move), true, "listed in flags.dnd5e.riders.activity");
  assert.equal(matchesActivationType(move, ["bonus"]), false, "Flaming Sphere: Move with no sphere out");
  assert.equal(matchesActivationType(cast, ["action"]), true, "the cast itself still shows");
  assert.equal(matchesActivationType({ system: { activities: [cast, move] } }, ["bonus"]), false, "the item has no bonus button while Move is parked");
  // CPR unhides by removing the id from the flag — the same activity then counts
  const unhidden = { ...move, item: { flags: { dnd5e: { riders: { activity: [] } } } } };
  assert.equal(matchesActivationType(unhidden, ["bonus"]), true);
  // a live document exposes the getter; it wins over the flag
  assert.equal(matchesActivationType({ ...move, isRider: false }, ["bonus"]), true);
  assert.equal(matchesActivationType({ activation: { type: "action" }, isRider: true }, ["action"]), false);
});

test("activities may arrive as a Map/Collection or a plain object", () => {
  const map = new Map([["a", act("action", true)], ["b", act("action")]]);
  assert.equal(matchesActivationType({ system: { activities: map } }, ["action"]), true);
  assert.equal(matchesActivationType({ system: { activities: { a: act("action", true) } } }, ["action"]), false);
});
