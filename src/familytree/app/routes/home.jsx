import { useNavigate, useSearchParams } from "react-router";
import CelestialStar from "../../components/CelestialStar.jsx";
import ArchiveHeader from "../../components/ArchiveHeader.jsx";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import photographs from "../../data/photos.json";
import { personPhotos } from "../../photos.js";
import PhotoGallery from "../../components/PhotoGallery.jsx";
import ornaments from "../../assets/ornaments.svg?url";
import family from "../../data/family.json";
import { ageLabel, birthLabel, initials, layoutTree, routeConnections, sceneBounds, fitCamera, immediateFamilyIds, siblingsOf, todayParts, CARD_WIDTH, CARD_HEIGHT } from "../../tree.js";

export function loader() { return { today: todayParts() }; }

// Change the variant to "pixel" or "arc" to use the other supplied corners.
function Corners({ variant = "spark" }) {
  return <>{["tl", "tr", "br", "bl"].map(position => <svg key={position} className={`astral-corner astral-corner--${position}`} viewBox="0 0 32 32" aria-hidden="true"><use href={`${ornaments}#corner-${variant}`}/></svg>)}</>;
}


function Icon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{type === "fit" ? <path d="M8 4H4v4m12-4h4v4M4 16v4h4m12-4v4h-4" /> : type === "search" ? <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></> : type === "close" ? <path d="m6 6 12 12M6 18 18 6"/> : type === "plus" ? <path d="M5 12h14M12 5v14"/> : <path d="M5 12h14"/>}</svg>;
}

function StatusBadge({ type, children }) {
  return <span className={`record-badge record-badge--${type}`}>{children}</span>;
}

function PersonDetails({ person, today, onClose, onNavigate }) {
  const [photoParams, setPhotoParams] = useSearchParams();
  const changePhoto = (id, replace = false) => { const next = new URLSearchParams(photoParams); if(id) next.set("photo",id); else next.delete("photo"); setPhotoParams(next,{replace}); };
  const navigate = useNavigate();
  const dialog = useRef(null);
  const [tab, setTab] = useState("overview");
  const baseId = useId();
  useEffect(() => { dialog.current.showModal(); }, []);
  const parents = family.people.filter(p => person.parentIds?.includes(p.id));
  const children = family.people.filter(p => p.parentIds?.includes(person.id));
  const siblings = siblingsOf(person, family.people, family.siblingGroups);
  const relationships = family.relationships.filter(r => r.personIds.includes(person.id)).map(r => ({ ...r, person: family.people.find(p => r.personIds.includes(p.id) && p.id !== person.id) })).filter(r => r.person);
  const current = relationships.filter(r => r.type !== "divorced" && r.type !== "former");
  // Relationships are maintained chronologically in JSON, oldest first.
  const overviewSpouse = relationships.filter(r => r.type === "married").slice(-1);
  const overviewPartners = overviewSpouse.length ? overviewSpouse : current.filter(r => r.type === "partner" || r.type === "partnered");
  // Sort dated entries within their existing slots, leaving undated entries stable.
  const relationshipTime = relationship => {
    const value = relationship.marriageDate ?? relationship.startDate;
    if (!value) return NaN;
    if (typeof value === "object") return value.year ? value.year * 10000 + (value.month ?? 1) * 100 + (value.day ?? 1) : NaN;
    const match = String(value).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
    return match ? Number(match[1]) * 10000 + Number(match[2] ?? 1) * 100 + Number(match[3] ?? 1) : NaN;
  };
  const dated = relationships.filter(r => Number.isFinite(relationshipTime(r))).sort((a, b) => relationshipTime(a) - relationshipTime(b));
  let datedIndex = 0;
  const familyPartners = relationships.map(r => Number.isFinite(relationshipTime(r)) ? dated[datedIndex++] : r);
  const photos = personPhotos(person, photographs);
  const age = ageLabel(person, today);
  const headerAge = /^(\d+ years old|Died at \d+)$/.test(age) ? age.replace("Died at ", "") + (age.startsWith("Died at ") ? " years" : "") : null;
  const lifespan = person.birth?.year ? `${person.birth.year} – ${person.death?.year ?? (person.living ? "present" : "?")}` : person.death?.year ? `Died ${person.death.year}` : null;
  const relative = p => <button className="relative-link" onClick={() => onNavigate(p)}>{p.name}</button>;
  const group = (label, members) => members.length > 0 && <section className="record-section"><h3>{label}</h3>{members.map(p => <p key={p.id}>{relative(p)}{p.siblingType && <small className="sibling-type">{p.siblingType}</small>}</p>)}</section>;
  const partners = (items, metadata = false) => items.map((r, i) => <div key={`${r.person.id}-${i}`} className="record-partner"><p>{relative(r.person)}</p>{metadata && <StatusBadge type={r.type === "married" ? "married" : r.type === "divorced" || r.type === "former" ? "former" : r.type === "widowed" ? "widowed" : "partner"}>{r.type === "divorced" ? "Divorced" : r.type === "former" ? "Former partner" : r.type === "married" ? "Married" : r.type === "widowed" ? "Widowed" : "Partnered"}</StatusBadge>}{metadata && <>{r.marriageDate && <small>Married {typeof r.marriageDate === "string" ? r.marriageDate : birthLabel(r.marriageDate)}</small>}{r.divorceDate && <small>Divorced {typeof r.divorceDate === "string" ? r.divorceDate : birthLabel(r.divorceDate)}</small>}</>}</div>);
  const gallery = full => <PhotoGallery photos={photos} activePhotoId={photoParams.get("photo")} onPhotoChange={changePhoto} full={full} hideHeading={!full} showCaptions showCount={false} onHeadingClick={!full ? () => { setTab("photos"); document.getElementById(`${baseId}-photos`)?.focus(); } : undefined} allPhotos={photographs} people={family.people} onNavigate={onNavigate} onTag={tag => navigate(`/gallery?tag=${encodeURIComponent(tag)}`)} name={person.name}/>;
  const tabs = ["overview", "family", "photos"];
  function tabKey(event) {
    const index = tabs.indexOf(tab);
    const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
    if (next !== null) { event.preventDefault(); setTab(tabs[next]); document.getElementById(`${baseId}-${tabs[next]}`)?.focus(); }
  }
  return <dialog ref={dialog} className="person-dialog person-record record-tabbed" aria-labelledby="person-name" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    {["tl", "tr", "br", "bl"].map(position => <span key={position} className={`record-corner record-corner--${position}`} aria-hidden="true"/>)}
    <div className="record-titlebar"><span>PERSON RECORD</span><button className="record-close" aria-label="Close person details" onClick={onClose}><Icon type="close"/></button></div>
    <div className="record-head"><div className="detail-avatar">{person.photo ? <img src={person.photo} alt=""/> : initials(person.name)}</div><div className="record-identity"><h2 id="person-name">{person.name}</h2>{(lifespan || headerAge) && <p className="record-lifespan">{[lifespan, headerAge].filter(Boolean).join(" · ")}</p>}<StatusBadge type={person.living ? "living" : "deceased"}>{person.living ? "Living" : "Deceased"}</StatusBadge></div></div>
    <div className="record-tabs" role="tablist" aria-label="Person record sections" onKeyDown={tabKey}>{tabs.map((item, index) => <button key={item} id={`${baseId}-${item}`} role="tab" type="button" aria-selected={tab === item} aria-controls={`${baseId}-panel`} tabIndex={tab === item ? 0 : -1} onClick={() => setTab(item)}><span aria-hidden="true">{["▤", "♧", "▧"][index]}</span>{item}{item === "photos" && photos.length > 0 && <small>{photos.length}</small>}</button>)}</div>
    <div className={`record-content record-content--${tab}`} role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-${tab}`} tabIndex={0} key={tab}>
      {tab === "overview" && <>
        {(person.birth || person.death) && <div className="record-columns record-vitals">{person.birth && <section className="record-section"><h3>Born</h3><p>{birthLabel(person.birth)}</p></section>}{person.death && <section className="record-section"><h3>Died</h3><p>{birthLabel(person.death)}</p></section>}</div>}
        {person.birthplace && <section className="record-section"><h3>Birthplace</h3><p>{person.birthplace}</p></section>}
        {(person.biography || person.notes) && <section className="record-section"><h3>About</h3>{person.biography && <p>{person.biography}</p>}{person.notes && <p className="date-note">{person.notes}</p>}</section>}
        {(overviewPartners.length > 0 || children.length > 0) && <div className="record-columns">{overviewPartners.length > 0 && <section className="record-section"><h3>Spouses / Partners</h3>{partners(overviewPartners)}</section>}{group("Children", children)}</div>}
        {photos.length > 0 && gallery(false)}
      </>}
      {tab === "family" && <div className="record-columns">{familyPartners.length > 0 && <section className="record-section record-partners-section"><h3>Spouses / Partners</h3><div className="record-partners-grid">{partners(familyPartners, true)}</div></section>}{group("Children", children)}{group("Parents", parents)}{group("Siblings", siblings)}</div>}
      {tab === "family" && !parents.length && !relationships.length && !children.length && !siblings.length && <p className="record-empty">No family connections recorded yet.</p>}
      {tab === "photos" && (photos.length ? gallery(true) : <p className="record-empty">No photographs in this record yet.</p>)}
    </div>
  </dialog>;
}

export default function FamilyTree({ loaderData }) {
  const today = loaderData.today;
  const [params, setParams] = useSearchParams();
  const initialized = useRef(false);
  const graph = useMemo(() => layoutTree(family.people, family.relationships, family.siblingGroups), []);
  const connections = useMemo(() => routeConnections(graph, family.relationships, family.siblingGroups), [graph]);
  const bounds = useMemo(() => sceneBounds(graph.nodes, connections), [graph, connections]);
  const [hovered, setHovered] = useState(null);
  const [highlighted, setHighlighted] = useState(null);
  const relatives = immediateFamilyIds(graph.nodes.find(p => p.id === hovered), family.people, family.relationships);
  const viewport = useRef(null);
  const pointers = useRef(new Map());
  const moved = useRef(false);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [size, setSize] = useState({ width: 1000, height: 700 });
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);

  function fit(width = size.width, height = size.height) {
    setCamera(fitCamera(bounds, width, height, 40));
  }
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
      if (!initialized.current) {
        initialized.current = true;
        try { const saved = JSON.parse(sessionStorage.getItem("familytree-camera")); if (saved && [saved.x,saved.y,saved.scale].every(Number.isFinite)) { setCamera(saved); return; } } catch {}
      }
      if (width < 640) {
        const focus = graph.nodes.find(p => p.id === family.focusPersonId) ?? graph.nodes[0];
        const scale = .78;
        setCamera({ scale, x: width / 2 - (focus.x + CARD_WIDTH / 2) * scale, y: height * .64 - (focus.y + CARD_HEIGHT / 2) * scale });
      } else fit(width, height);
    });
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [graph]);

  useEffect(() => { if (initialized.current) { try { sessionStorage.setItem("familytree-camera", JSON.stringify(camera)); } catch {} } }, [camera]);
  useEffect(() => {
    const person = graph.nodes.find(p => p.id === params.get("person"));
    if (person && size.width) { focusPerson(person); setSelected(person); } else setSelected(null);
  }, [params, size.width, size.height]);

  function zoom(factor, point) {
    setCamera(previous => {
      const scale = Math.max(.25, Math.min(2.5, previous.scale * factor));
      const p = point ?? { x: size.width / 2, y: size.height / 2 };
      return { scale, x: p.x - (p.x - previous.x) * scale / previous.scale, y: p.y - (p.y - previous.y) * scale / previous.scale };
    });
  }
  useEffect(() => {
    const element = viewport.current;
    function wheel(event) {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * .002), { x: event.clientX - rect.left, y: event.clientY - rect.top });
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, [size]);

  function pointerMove(event) {
    if (!pointers.current.has(event.pointerId)) return;
    const before = [...pointers.current.values()];
    const old = pointers.current.get(event.pointerId);
    if (Math.hypot(event.clientX - old.startX, event.clientY - old.startY) > 5) moved.current = true;
    pointers.current.set(event.pointerId, { ...old, x: event.clientX, y: event.clientY });
    const after = [...pointers.current.values()];
    if (after.length === 2) {
      moved.current = true;
      const distance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const rect = viewport.current.getBoundingClientRect();
      const midpoint = points => ({ x: (points[0].x + points[1].x) / 2 - rect.left, y: (points[0].y + points[1].y) / 2 - rect.top });
      const a = midpoint(before), b = midpoint(after);
      setCamera(previous => {
        const scale = Math.max(.25, Math.min(2.5, previous.scale * distance(after) / Math.max(1, distance(before))));
        return { scale, x: b.x - (a.x - previous.x) * scale / previous.scale, y: b.y - (a.y - previous.y) * scale / previous.scale };
      });
    } else setCamera(previous => ({ ...previous, x: previous.x + event.clientX - old.x, y: previous.y + event.clientY - old.y }));
  }
  function focusPerson(person) {
    setCamera({ scale: 1, x: size.width / 2 - person.x - CARD_WIDTH / 2, y: size.height / 2 - person.y - CARD_HEIGHT / 2 });
    setSelected(null); setHighlighted(person.id); setTimeout(() => setHighlighted(null), 1800); setQuery("");
  }
  const results = graph.nodes.filter(person => person.name.toLowerCase().includes(query.toLowerCase()));
  function endPointer(event) {
    pointers.current.delete(event.pointerId);
    if (!pointers.current.size) setDragging(false);
  }
  return <main className="family-app">
    <ArchiveHeader query={query} onQuery={setQuery} count={family.people.length} results={results.map(p => ({ id:p.id,label:p.name,image:p.photo,initials:initials(p.name) }))} onSelect={result => setParams({person:result.id})}/>

    <section ref={viewport} className={`tree-viewport${dragging ? " dragging" : ""}`} aria-label="Interactive family tree. Drag to pan, scroll or pinch to zoom. Use arrow keys to pan and plus or minus to zoom." tabIndex={0}
      onPointerDown={event => {
        if (event.button !== 0) return;
        if (!pointers.current.size) moved.current = false;
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
        event.target.setPointerCapture(event.pointerId); setDragging(true);
      }} onPointerMove={pointerMove} onPointerUp={endPointer} onPointerCancel={endPointer} onLostPointerCapture={endPointer}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        const offsets = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] };
        if (offsets[event.key]) { event.preventDefault(); const [x, y] = offsets[event.key]; setCamera(c => ({ ...c, x: c.x + x, y: c.y + y })); }
        if (event.key === "+" || event.key === "=") { event.preventDefault(); zoom(1.2); }
        if (event.key === "-") { event.preventDefault(); zoom(1 / 1.2); }
        if (event.key === "0") fit();
      }}>
      <div className="tree-world" style={{ width: graph.width, height: graph.height, transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})` }}>
        <svg className="connections" width={graph.width} height={graph.height} aria-hidden="true">
          {connections.map(edge => <g key={edge.id} className={`connection-edge ${edge.type}`} opacity={hovered && !edge.personIds.includes(hovered) ? .3 : 1}>
            {edge.paths.map((d, i) => <path key={i} d={d}/>)}
            {edge.junction && <circle cx={edge.junction.x} cy={edge.junction.y} r="2.5"/>}
            {edge.marker && <text x={edge.marker.x} y={edge.marker.y + 5}>×</text>}
          </g>)}
        </svg>
        {graph.nodes.map(person => <button key={person.id} onMouseEnter={() => setHovered(person.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(person.id)} onBlur={() => setHovered(null)} data-related={hovered ? relatives.has(person.id) : undefined} data-highlighted={highlighted === person.id} className={`person-card${person.id === family.focusPersonId ? " focus-person" : ""}`} style={{ left: person.x, top: person.y }} onClick={event => { if (!moved.current || event.detail === 0) setParams({person:person.id}); }} aria-label={`View ${person.name}, ${ageLabel(person, today)}`}><span className="avatar">{person.photo ? <img src={person.photo} alt=""/> : initials(person.name)}</span><span className="person-copy"><strong>{person.name}</strong><span>{ageLabel(person, today)}</span></span>{person.id === family.focusPersonId && <span className="you-label">Me</span>}</button>)}
      </div>
    </section>

    <div className="canvas-controls" aria-label="Tree view controls"><span className="zoom-level">{Math.round(camera.scale * 100)}%</span><div className="zoom-buttons"><button aria-label="Zoom in" onClick={() => zoom(1.2)}><Icon type="plus"/></button><button aria-label="Zoom out" onClick={() => zoom(1 / 1.2)}><Icon type="minus"/></button></div><button className="fit-button" aria-label="Fit tree to screen" title="Fit tree to screen (0)" onClick={() => fit()}><Icon type="fit"/></button></div>
    <aside className="relationship-info" aria-label="Relationship legend"><div className="relationship-legend">
      <span className="legend-item"><i className="legend-line parent-child"/>Parent & child</span>
      <span className="legend-item"><i className="legend-line married"/>Married</span>
      <span className="legend-item"><i className="legend-line divorced"/>Divorced</span>
      <span className="footer-hint">Drag to explore <span>·</span> Scroll to zoom</span>
    </div></aside>
    {selected && <PersonDetails key={selected.id} person={selected} onNavigate={p => setParams({person:p.id})} today={today} onClose={() => { const next = new URLSearchParams(params); next.delete("person"); next.delete("photo"); setParams(next); }}/>}
  </main>;
}
