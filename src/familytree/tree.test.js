import { describe, expect, it } from "vitest";
import family from "./data/family.json";
import { ageLabel, birthLabel, layoutTree, parentConnections, siblingsOf, CARD_WIDTH } from "./tree.js";

const person = id => family.people.find(p => p.id === id);
const today = { year: 2026, month: 10, day: 28 };

describe("family tree", () => {
  it("calculates living ages before and on birthdays", () => {
    expect(ageLabel(person("jennifer"), today)).toBe("32 years old");
    expect(ageLabel(person("richard"), today)).toBe("82 years old");
    expect(ageLabel(person("amy"), today)).toBe("66 years old");
    expect(ageLabel(person("amy"), { ...today, month: 11, day: 4 })).toBe("67 years old");
    expect(ageLabel(person("timothy"), today)).toBe("Age unknown");
  });
  it("shows age at death instead of a hypothetical current age", () => {
    expect(ageLabel(person("elizabeth"), today)).toBe("Died at 90");
    expect(ageLabel(person("bernard"), today)).toBe("Died at 94");
    expect(ageLabel(person("beverley"), today)).toBe("Deceased");
    expect(birthLabel(person("bernard").birth)).toBe("November 1927");
    expect(birthLabel(person("bernard").death)).toBe("April 2022");
  });
  it("keeps spouses together and cards separated within each generation", () => {
    const { nodes } = layoutTree(family.people, family.relationships, family.siblingGroups);
    const node = id => nodes.find(p => p.id === id);
    expect(node("amy").y).toBe(node("richard").y);
    expect(node("barbara").y).toBe(node("richard").y);
    expect(node("elaine").y).toBe(node("richard").y);
    expect(node("bernard").y).toBe(node("beverley").y);
    expect(node("bernard").y).toBe(node("elizabeth").y);
    expect(node("jennifer").y).toBeGreaterThan(node("amy").y);
    for (const y of new Set(nodes.map(n => n.y))) {
      const row = nodes.filter(n => n.y === y).sort((a, b) => a.x - b.x);
      for (let i = 1; i < row.length; i++) expect(row[i].x - row[i - 1].x).toBeGreaterThan(CARD_WIDTH);
    }
  });
  it("distinguishes full siblings from half siblings by both parents", () => {
    const { nodes } = layoutTree(family.people, family.relationships, family.siblingGroups);
    const groups = parentConnections(nodes);
    expect(groups.find(g => g.parents.some(p => p.id === "beverley")).children.map(p => p.id)).toEqual(["amy", "timothy", "shelley"]);
    expect(groups.find(g => g.parents.some(p => p.id === "elizabeth")).children.map(p => p.id)).toEqual(["jonathan"]);
    expect(family.relationships.find(r => r.personIds.includes("beverley")).type).toBe("divorced");
  });
  it("shows Amy and Timothy as full siblings and Jonathan as their half sibling", () => {
    const siblings = siblingsOf(person("amy"), family.people, family.siblingGroups);
    expect(siblings.map(p => [p.id, p.siblingType])).toEqual([
      ["timothy", "Full sibling"], ["shelley", "Full sibling"], ["jonathan", "Half sibling"],
    ]);
    expect(siblingsOf(person("richard"), family.people, family.siblingGroups).map(p => p.id)).toEqual(["barbara", "elaine"]);
  });
  it("rejects missing references and parent cycles", () => {
    expect(() => layoutTree([{ id: "a", parentIds: ["missing"] }])).toThrow("Unknown parent");
    expect(() => layoutTree([{ id: "a", parentIds: ["b"] }, { id: "b", parentIds: ["a"] }])).toThrow("cycle");
  });
  it("allows partial dates without inventing a year or day", () => {
    expect(birthLabel({ month: 11, day: 4 })).toBe("November 4");
    expect(birthLabel(null)).toBe("Birth date unknown");
    expect(birthLabel({ month: 11, year: 1927 })).toBe("November 1927");
  });
});
