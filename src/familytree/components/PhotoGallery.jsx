import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./PhotoGallery.css";
import { photoPeople, photoPositions, photoTags } from "../photos.js";

function PhotoLightbox({ photos, initialIndex, name, onClose, returnFocus, people, allPhotos, onNavigate, onTag, activePhotoId, onPhotoChange }) {
  const dialog = useRef(null);
  const touch = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [failed, setFailed] = useState(false);
  const titleId = useId();
  const [filter, setFilter] = useState(null);
  const [filteredPhoto, setFilteredPhoto] = useState(null);
  const filtered = filter ? allPhotos.filter(p => photoTags(p).includes(filter)) : [];
  const currentPhotos = filteredPhoto !== null ? filtered : photos;
  const currentIndex = filteredPhoto !== null ? filteredPhoto : index;
  const photo = currentPhotos[currentIndex];
  const taggedPeople = photoPeople(photo, people);
  const tags = photoTags(photo);
  const positions = photoPositions(photo, people);
  const [showPositions, setShowPositions] = useState(false);
  const [activePosition, setActivePosition] = useState(null);
  const back = useRef(null);
  const imageArea = useRef(null);
  const [area, setArea] = useState({ width: 1, height: 1 });
  const [natural, setNatural] = useState({ width: 1, height: 1 });
  useEffect(() => {
    if (!imageArea.current) return;
    const observer = new ResizeObserver(([entry]) => setArea({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(imageArea.current);
    return () => observer.disconnect();
  }, [filter, filteredPhoto]);
  const ratio = Math.min(area.width / natural.width, area.height / natural.height);
  const frame = { width: natural.width * ratio, height: natural.height * ratio };
  const navigate = person => { onClose(); onNavigate?.(person); };
  useEffect(() => { if (filter && filteredPhoto === null) back.current?.focus(); }, [filter, filteredPhoto]);
  useEffect(() => {
    if (!activePhotoId) return;
    const next = currentPhotos.findIndex(p => (p.id || p.src) === activePhotoId);
    if (next >= 0) { if (filteredPhoto !== null) setFilteredPhoto(next); else setIndex(next); }
  }, [activePhotoId]);
  const move = step => {
    if (filter && filteredPhoto === null) return;
    const nextPhoto = currentPhotos[(currentIndex + step + currentPhotos.length) % currentPhotos.length];
    onPhotoChange?.(nextPhoto.id || nextPhoto.src, true);
    if (filteredPhoto !== null) setFilteredPhoto(current => (current + step + filtered.length) % filtered.length);
    else setIndex(current => (current + step + photos.length) % photos.length);
  };
  useEffect(() => {
    const previous = returnFocus;
    const element = dialog.current;
    element.showModal();
    return () => {
      element.close();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { setFailed(false); setActivePosition(null); setShowPositions(false); }, [index, filteredPhoto, filter]);
  return createPortal(<dialog ref={dialog} className="photo-lightbox" aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); event.stopPropagation(); move(event.key === "ArrowRight" ? 1 : -1);
      }
    }}>
    <h2 id={titleId} className="gallery-sr-only">Photographs of {name}</h2>
    <header className="photo-toolbar">
      <span className="photo-window-title">PHOTOGRAPHS</span>
      {filter && <button ref={back} className="photo-filter-back" onClick={() => { if (filteredPhoto !== null) setFilteredPhoto(null); else setFilter(null); }}>{filteredPhoto !== null ? `Back to #${filter}` : "Back to person photographs"}</button>}
      <div className="photo-tools">
        {(!filter || filteredPhoto !== null) && <>
          <span className="photo-counter" aria-live="polite" aria-atomic="true">{currentIndex + 1} / {currentPhotos.length}</span>
          {positions.length > 0 && <button className="photo-position-toggle" aria-label="Show people markers" aria-pressed={showPositions} onClick={() => setShowPositions(value => !value)}>People</button>}
          {currentPhotos.length > 1 && <><button className="photo-prev" aria-label="Previous photograph" onClick={() => move(-1)}>‹</button><button className="photo-next" aria-label="Next photograph" onClick={() => move(1)}>›</button></>}
        </>}
        <button className="photo-close" aria-label="Close photograph" onClick={onClose} autoFocus>×</button>
      </div>
    </header>
    {filter && filteredPhoto === null ? <section className="filtered-photos" aria-label={`Photos tagged ${filter}`}><h3>#{filter} <small>{filtered.length} photographs</small></h3><div>{filtered.map((item, i) => <button key={item.id || item.src} aria-label={`Open ${item.caption || `photograph ${i + 1}`}`} onClick={() => { setFilteredPhoto(i); dialog.current.querySelector('.photo-close')?.focus(); }}><img src={item.src} alt={item.caption || `Photograph tagged ${filter}`} loading="lazy"/></button>)}</div></section> : <figure className="photo-stage"
      onTouchStart={event => { const point = event.touches[0]; touch.current = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null; }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={event => {
        const start = touch.current; touch.current = null;
        if (!start || !event.changedTouches.length) return;
        const point = event.changedTouches[0];
        const dx = point.clientX - start.x, dy = point.clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
      }}>
      <div ref={imageArea} className="photo-image-area" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      {failed ? <p role="status">This photograph could not be loaded.</p> : <div className="positioned-photo" data-markers-visible={showPositions} style={frame}>
        <img key={photo.src + index} src={photo.src} alt={photo.caption || `Photograph ${currentIndex + 1} of ${name}`} onLoad={event => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onClick={() => { if (positions.length) setShowPositions(value => !value); }} onError={() => setFailed(true)} draggable="false"/>
        {positions.map(position => <button key={position.personId} className="photo-person-marker" style={{ left: `${position.x}%`, top: `${position.y}%` }} aria-label={`View ${position.person.name}`} aria-expanded={activePosition === position.personId} onClick={() => { if (window.matchMedia("(hover: hover)").matches || activePosition === position.personId) navigate(position.person); else setActivePosition(position.personId); }}>
          <span className="marker-dot" aria-hidden="true"/><span className="marker-name" data-visible={activePosition === position.personId}>{position.person.name}</span>
        </button>)}
      </div>}
      </div>
      <figcaption>
        {(photo.caption || photo.year != null) && <p>{photo.caption}{photo.caption && photo.year != null ? " · " : ""}{photo.year}</p>}
        {taggedPeople.length > 0 && <section className="photo-tag-section" aria-label="In this photo"><h3>In this photo</h3><div>{taggedPeople.map(person => <button key={person.id} onClick={() => navigate(person)}>{person.name}</button>)}</div></section>}
        {tags.length > 0 && <section className="photo-tag-section" aria-label="Photo tags"><div>{tags.map(tag => <button key={tag} onClick={() => { if (onTag) { onClose(); onTag(tag); } else { setFilter(tag); setFilteredPhoto(null); } }}>#{tag}</button>)}</div></section>}
      </figcaption>
    </figure>}

  </dialog>, document.body);
}

export default function PhotoGallery({ photos = [], full = false, showCount = true, hideHeading = false, showCaptions = false, onHeadingClick, name, people = [], allPhotos = photos, onNavigate, onTag, activePhotoId, onPhotoChange }) {
  const usable = photos.filter(photo => typeof photo?.src === "string" && photo.src.trim());
  const [active, setActive] = useState(null);
  const headingId = useId();
  const trigger = useRef(null);
  const pool = activePhotoId && !usable.some(p => (p.id || p.src) === activePhotoId) ? allPhotos : usable;
  const requested = activePhotoId ? pool.findIndex(p => (p.id || p.src) === activePhotoId) : -1;
  const shown = onPhotoChange ? (requested >= 0 ? requested : null) : active;
  if (!usable.length && shown === null) return null;
  return <section className="photo-gallery detail-section" aria-labelledby={headingId}>
    {!hideHeading && <header><h3 id={headingId}>{onHeadingClick ? <button className="gallery-heading-action" onClick={onHeadingClick}>Photographs</button> : "Photographs"}</h3>{showCount && <span aria-label={`${usable.length} photographs`}>{String(usable.length).padStart(2, "0")}</span>}</header>}
    {hideHeading && <h3 id={headingId} className="gallery-sr-only">Photographs</h3>}
    <div className={`photo-thumbnails${full ? " photo-thumbnails--full" : ""}`}>{(full ? usable : usable.slice(0, 3)).map((photo, index) => <button key={index} aria-label={`Open photograph ${index + 1} of ${usable.length}${photo.caption ? `: ${photo.caption}` : ` of ${name}`}`} onClick={event => { trigger.current = event.currentTarget; setActive(index); onPhotoChange?.(photo.id || photo.src); }}>
      <img src={photo.src} alt={photo.caption || `Photograph of ${name}`} loading="lazy"/>
      {showCaptions && photo.caption && <span className="thumbnail-caption">{photo.caption}</span>}
      {!full && index === 2 && usable.length > 3 && <span className="photo-more" aria-hidden="true">+{usable.length - 3}</span>}
    </button>)}</div>
    {shown !== null && <PhotoLightbox photos={pool} initialIndex={shown} activePhotoId={activePhotoId} onPhotoChange={onPhotoChange} returnFocus={trigger.current} name={name} people={people} allPhotos={allPhotos} onNavigate={onNavigate} onTag={onTag} onClose={() => { setActive(null); onPhotoChange?.(null, true); }}/>}
  </section>;
}
