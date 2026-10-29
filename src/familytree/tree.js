export const CARD_WIDTH = 292;
export const CARD_HEIGHT = 104;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function birthLabel(birth) {
  if (!birth) return "Birth date unknown";
  const date = [MONTHS[birth.month - 1], birth.day].filter(Boolean).join(" ");
  return [date, birth.year].filter(Boolean).join(birth.day ? ", " : " ") || "Birth date unknown";
}

export function initials(name) {
  const parts = name.split(" ");
  return `${parts[0][0]}${parts.length > 1 ? parts.at(-1)[0] : ""}`;
}

// Treat partners as peers so a spouse with unknown parents stays in the
// correct generation. Parent links remain independent from marital status.
export function layoutTree(people, relationships = [], siblingGroups = []) {
  const byId = new Map(people.map(person => [person.id, person]));
  if (byId.size !== people.length) throw new Error("Person IDs must be unique.");
  const partners = new Map(people.map(person => [person.id, new Set()]));
  for (const relationship of relationships) {
    const [a, b] = relationship.personIds;
    if (!byId.has(a) || !byId.has(b)) throw new Error("Unknown relationship person.");
    partners.get(a).add(b);
    partners.get(b).add(a);
  }
  // Siblings can be connected even before their parents are known.
  const peers = new Map([...partners].map(([id, ids]) => [id, new Set(ids)]));
  for (const group of siblingGroups) {
    for (const id of group) {
      if (!byId.has(id)) throw new Error("Unknown sibling person.");
      group.filter(other => other !== id).forEach(other => peers.get(id).add(other));
    }
  }
  const components = new Map();
  const units = [];
  for (const person of people) {
    if (components.has(person.id)) continue;
    const unit = { ids: [], generation: null };
    function collect(id) {
      if (components.has(id)) return;
      components.set(id, unit);
      unit.ids.push(id);
      peers.get(id).forEach(collect);
    }
    collect(person.id);
    units.push(unit);
  }
  function generation(unit, visiting = new Set()) {
    if (unit.generation !== null) return unit.generation;
    if (visiting.has(unit)) throw new Error("Family data contains a parent cycle.");
    const next = new Set(visiting).add(unit);
    const parents = unit.ids.flatMap(id => byId.get(id).parentIds ?? []);
    const values = parents.map(id => {
      if (!byId.has(id)) throw new Error(`Unknown parent: ${id}`);
      return generation(components.get(id), next);
    });
    return unit.generation = values.length ? 1 + Math.max(...values) : 0;
  }
  const rows = new Map();
  people.forEach(person => {
    const row = generation(components.get(person.id));
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(person);
  });
  const step = CARD_WIDTH + 112;
  const rowY = new Map();
  const groups = new Map();
  people.forEach(person => {
    if (person.parentIds?.length) groups.set([...person.parentIds].sort().join("|"), person);
  });
  let previousY = 80;
  for (const row of [...rows.keys()].sort((a, b) => a - b)) {
    const incoming = [...groups.values()].filter(p => generation(components.get(p.id)) === row).length;
    const partnerships = relationships.filter(r => generation(components.get(r.personIds[0])) === row).length;
    if (rowY.size) previousY += CARD_HEIGHT + Math.max(220, (incoming + partnerships + 3) * 30);
    rowY.set(row, previousY);
  }
  const width = (Math.max(1, ...[...rows.values()].map(row => row.length)) - 1) * step + CARD_WIDTH + 64;
  const positions = new Map();
  for (const [rowIndex, row] of [...rows].sort(([a], [b]) => a - b)) {
    // Keep partners adjacent; sort their blocks by their known parents.
    const rowUnits = units.filter(unit => unit.generation === rowIndex);
    const desired = unit => {
      const parents = unit.ids.flatMap(id => byId.get(id).parentIds ?? []).map(id => positions.get(id));
      return parents.length ? parents.reduce((sum, p) => sum + p.x + CARD_WIDTH / 2, 0) / parents.length : width / 2;
    };
    rowUnits.sort((a, b) => desired(a) - desired(b));
    const ordered = rowUnits.flatMap(unit => {
      // Walk partner chains from an endpoint: ex-spouse → person → spouse.
      const remaining = new Set(unit.ids);
      const result = [];
      let current = unit.ids.find(id => partners.get(id).size <= 1) ?? unit.ids[0];
      while (remaining.size) {
        result.push(current);
        remaining.delete(current);
        current = [...partners.get(current)].find(id => remaining.has(id)) ?? [...remaining][0];
      }
      return result;
    });
    ordered.forEach((id, index) => positions.set(id, {
      x: width / 2 + (index - (row.length - 1) / 2) * step - CARD_WIDTH / 2,
      y: rowY.get(rowIndex),
    }));
    // A single descendant sits below its parents, rather than the whole row.
    if (row.length === 1) {
      const parents = (row[0].parentIds ?? []).map(id => positions.get(id));
      if (parents.length) positions.get(row[0].id).x = parents.reduce((sum, p) => sum + p.x, 0) / parents.length;
    }
  }
  const nodes = people.map(person => ({ ...person, ...positions.get(person.id) }));
  return { nodes, width, height: Math.max(...nodes.map(n => n.y + CARD_HEIGHT), 0) + 64 };
}

// Use calendar dates in the family's time zone, independent of server timezone.
export function todayParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  return Object.fromEntries(parts.filter(p => p.type !== "literal").map(p => [p.type, Number(p.value)]));
}

export function ageLabel(person, today = todayParts()) {
  if (!person.living) {
    if (person.ageAtDeath != null) return `Died at ${person.ageAtDeath}`;
    if (!person.death) return "Deceased";
  }
  const end = person.living ? today : person.death;
  const birth = person.birth;
  if (!birth?.year || !birth.month || !birth.day || !end?.year || !end.month || !end.day) {
    return person.living ? "Age unknown" : "Deceased";
  }
  const beforeBirthday = end.month < birth.month || (end.month === birth.month && end.day < birth.day);
  const age = end.year - birth.year - Number(beforeBirthday);
  return person.living ? `${age} years old` : `Died at ${age}`;
}

export function parentConnections(nodes) {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const groups = new Map();
  for (const child of nodes) {
    if (!child.parentIds?.length) continue;
    const key = [...child.parentIds].sort().join("|");
    if (!groups.has(key)) groups.set(key, { parents: child.parentIds.map(id => byId.get(id)), children: [] });
    groups.get(key).children.push(child);
  }
  return [...groups.values()];
}

export function siblingsOf(person, people, siblingGroups = []) {
  const explicit = new Set(siblingGroups.filter(group => group.includes(person.id)).flat());
  const parents = person.parentIds ?? [];
  return people.flatMap(other => {
    if (other.id === person.id) return [];
    const shared = parents.filter(id => other.parentIds?.includes(id));
    if (!shared.length && !explicit.has(other.id)) return [];
    const full = parents.length >= 2 && parents.length === other.parentIds?.length && shared.length === parents.length;
    const half = !full && shared.length > 0 && parents.length >= 2 && other.parentIds?.length >= 2;
    return [{ ...other, siblingType: full ? "Full sibling" : half ? "Half sibling" : "Sibling" }];
  });
}

export function immediateFamilyIds(person, people, relationships = []) {
  if (!person) return new Set();
  return new Set([
    person.id, ...(person.parentIds ?? []),
    ...people.filter(p => p.parentIds?.includes(person.id)).map(p => p.id),
    ...relationships.filter(r => r.personIds.includes(person.id)).flatMap(r => r.personIds),
  ]);
}

// Routes live in the spaces between cards. Each union gets its own junction;
// children descend from that junction, independently of marital status.
export function routeConnections(graph, relationships = [], siblingGroups = []) {
  const { nodes } = graph;
  const byId = new Map(nodes.map(n => [n.id, n]));
  const edges = [];
  const junctions = new Map();
  const lanes = new Map();
  const keyOf = ids => [...ids].sort().join("|");
  const cx = node => node.x + CARD_WIDTH / 2;
  const lane = y => {
    const count = lanes.get(y) ?? 0;
    lanes.set(y, count + 1);
    return y - 38 - count * 30;
  };
  function union(ids, type, index) {
    const pair = ids.map(id => byId.get(id)).sort((a, b) => a.x - b.x);
    const [left, right] = pair;
    if (!left || !right) return;
    const between = nodes.some(n => n.y === left.y && n.x > left.x && n.x < right.x);
    let anchor, path;
    if (left.y === right.y && !between) {
      anchor = { x: (left.x + CARD_WIDTH + right.x) / 2, y: left.y + CARD_HEIGHT / 2 };
      path = `M${left.x + CARD_WIDTH},${anchor.y} H${right.x}`;
    } else {
      // A third marriage needn't pass through an intervening partner's card.
      const y = lane(Math.min(left.y, right.y));
      anchor = { x: left.x + CARD_WIDTH + 28, y };
      path = `M${cx(left)},${left.y} V${y} H${cx(right)} V${right.y}`;
    }
    const key = keyOf(ids);
    junctions.set(key, anchor);
    edges.push({ id: `union-${index}`, type, personIds: ids, paths: [path], marker: type === "divorced" ? anchor : null });
  }
  relationships.forEach((r, index) => union(r.personIds, r.type, index));

  const parentGroups = parentConnections(nodes);
  const incoming = new Map();
  for (const [index, group] of parentGroups.entries()) {
    const { parents, children } = group;
    const ids = parents.map(p => p.id);
    let anchor = junctions.get(keyOf(ids));
    if (!anchor && parents.length === 2) {
      union(ids, "co-parents", `parents-${index}`);
      anchor = junctions.get(keyOf(ids));
    }
    if (!anchor) anchor = { x: cx(parents[0]), y: parents[0].y + CARD_HEIGHT };
    const top = Math.min(...children.map(p => p.y));
    const slot = incoming.get(top) ?? 0;
    incoming.set(top, slot + 1);
    // Reserve a separate horizontal channel for each parent group. Keep it
    // below partnership routes and above the unknown-parent sibling brackets.
    const busY = top - 90 - slot * 30 - (lanes.get(top) ?? 0) * 30;
    const left = Math.min(anchor.x, ...children.map(cx));
    const right = Math.max(anchor.x, ...children.map(cx));
    const members = [...ids, ...children.map(p => p.id)];
    edges.push({ id: `descent-${index}`, type: "parent-child", personIds: members,
      paths: [`M${anchor.x},${anchor.y} V${busY}`], junction: { x: anchor.x, y: busY } });
    edges.push({ id: `family-bar-${index}`, type: "parent-child", personIds: members,
      paths: [`M${left},${busY} H${right}`] });
    for (const child of children) edges.push({ id: `child-${child.id}`, type: "parent-child", personIds: [...ids, child.id], paths: [`M${cx(child)},${busY} V${child.y}`] });
  }
  siblingGroups.forEach((ids, index) => {
    const siblings = ids.map(id => byId.get(id)).filter(Boolean).sort((a, b) => a.x - b.x);
    // Known parent connections already express sibling relationships.
    if (siblings.length < 2 || siblings.every(p => p.parentIds?.length)) return;
    const y = Math.min(...siblings.map(p => p.y)) - 28;
    edges.push({ id: `siblings-${index}`, type: "parent-child", personIds: ids,
      paths: [`M${cx(siblings[0])},${y} H${cx(siblings.at(-1))}`] });
    edges.push({ id: `sibling-drops-${index}`, type: "parent-child", personIds: ids,
      paths: siblings.map(p => `M${cx(p)},${y} V${p.y}`) });
  });
  return edges;
}

export function sceneBounds(nodes, edges = []) {
  if (!nodes.length) return { x: 0, y: 0, width: 1, height: 1 };
  let minX = Math.min(...nodes.map(n => n.x));
  let minY = Math.min(...nodes.map(n => n.y));
  let maxX = Math.max(...nodes.map(n => n.x + CARD_WIDTH));
  let maxY = Math.max(...nodes.map(n => n.y + CARD_HEIGHT + 14));
  // Route vertices include every connector, including unions above the top row.
  for (const edge of edges) for (const path of edge.paths) {
    let x = 0, y = 0;
    for (const [, command, raw] of path.matchAll(/([MHV])([^MHV]+)/g)) {
      const values = raw.trim().split(/[ ,]+/).map(Number);
      if (command === "M") [x, y] = values;
      if (command === "H") x = values[0];
      if (command === "V") y = values[0];
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function fitCamera(bounds, width, height, padding = 36) {
  const scale = Math.max(.03, Math.min(1.1, Math.max(1, width - padding * 2) / bounds.width, Math.max(1, height - padding * 2) / bounds.height));
  return { scale, x: (width - bounds.width * scale) / 2 - bounds.x * scale, y: (height - bounds.height * scale) / 2 - bounds.y * scale };
}
