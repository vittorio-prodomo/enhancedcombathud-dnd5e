import { test } from "node:test";
import assert from "node:assert/strict";
import { activityButtonLabel, displayItemName, isGenericActivityName } from "./buttonLabel.mjs";

const generic = ["Use", "Save", "Attack", "Heal", "Check", "Utility", "Cast", "Summon", "Damage"];

test("displayItemName strips the maneuver category prefix (either language), nothing else", () => {
  assert.equal(displayItemName("Maneuver: Goading Attack"), "Goading Attack");
  assert.equal(displayItemName("Manovra: Riposta"), "Riposta");
  assert.equal(displayItemName("Maneuver Options"), "Maneuver Options");
  assert.equal(displayItemName("Second Wind"), "Second Wind");
  assert.equal(displayItemName(null), "");
});

test("a generic activity name yields the bare item name — his three maneuvers", () => {
  assert.equal(activityButtonLabel({ activityName: "Save", itemName: "Maneuver: Goading Attack", genericNames: generic }), "Goading Attack");
  assert.equal(activityButtonLabel({ activityName: "Use", itemName: "Maneuver: Maneuvering Attack", genericNames: generic }), "Maneuvering Attack");
  assert.equal(activityButtonLabel({ activityName: "Use", itemName: "Maneuver: Riposte", genericNames: generic }), "Riposte");
  assert.equal(activityButtonLabel({ activityName: "Heal", itemName: "Second Wind", genericNames: generic }), "Second Wind");
  assert.equal(activityButtonLabel({ activityName: "", itemName: "Action Surge", genericNames: generic }), "Action Surge");
  assert.equal(isGenericActivityName("use", generic), true);
  assert.equal(isGenericActivityName("Expend Second Wind", generic), false);
});

test("an activity name that identifies its item stands alone (the T212 stem rule survives)", () => {
  assert.equal(activityButtonLabel({ activityName: "Adrenaline Rush: Dash", itemName: "Adrenaline Rush", genericNames: generic }), "Adrenaline Rush: Dash");
  assert.equal(activityButtonLabel({ activityName: "Spend Luck Point", itemName: "Lucky", genericNames: generic }), "Spend Luck Point");
  assert.equal(activityButtonLabel({ activityName: "Summon Companion", itemName: "Primal Companion", genericNames: generic }), "Summon Companion");
});

test("a distinct activity name is prefixed with the item, never parenthesised", () => {
  assert.equal(activityButtonLabel({ activityName: "Expend Second Wind", itemName: "Tactical Mind", genericNames: generic }), "Tactical Mind: Expend Second Wind");
  assert.equal(activityButtonLabel({ activityName: "Dash", itemName: "Maneuver: Something", genericNames: generic }), "Something: Dash");
  assert.equal(activityButtonLabel({ activityName: "Dash", itemName: "", genericNames: generic }), "Dash");
});
