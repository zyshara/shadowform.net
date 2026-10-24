import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router";
import Button from "@/components/Button";
import ArrowUpRightIcon from "@/components/ArrowUpRightIcon";
import ArtworkOverlay from "@/components/ArtworkOverlay";
import MediaCarousel from "@/components/MediaCarousel";
import { responsiveImage } from "@/utils/responsiveImage";

function EventVideo({ media }) {
  const [playing, setPlaying] = useState(false);
  return <article className="min-w-0">
    <div className="event-video-frame">
      {playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}?autoplay=1`}
        title={media.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> :
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${media.title}`} className="event-video-play event-artwork group">
          <img {...responsiveImage(media.thumbnail || `https://i.ytimg.com/vi/${media.youtubeId}/hqdefault.jpg`, "(min-width: 768px) 35vw, 90vw", [320, 640, 960])} alt="" loading="lazy" decoding="async" />
          <ArtworkOverlay name={media.title} />
          <span className="event-play-icon" aria-hidden="true">▶</span>
        </button>}
    </div>
    <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-dod-white">{media.title}</h3>
    <a href={media.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-dod-lilac underline underline-offset-4">Watch on YouTube <ArrowUpRightIcon size={12} /></a>
  </article>;
}

export default function ShowPage({ page, media = {} }) {
  usePageTitle(page.title);
  const flyer = media[page.flyerId];
  const videos = page.videoIds.map(id => media[id]);
  const photos = page.photoIds.map(id => media[id]);
  return <div className="event-page">
    <Link to="/shows" className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-dod-lilac hover:text-dod-neon-mint">← All shows</Link>
    <div className={`event-hero ${!flyer ? "event-hero-no-flyer" : ""}`}>
      {flyer && <a href={flyer.originalImage || flyer.image} target="_blank" rel="noopener noreferrer" aria-label="View full event flyer (opens in a new tab)" className="event-flyer-link">
        <img className="event-flyer" {...responsiveImage(flyer.image, "(min-width: 1024px) 35vw, 90vw", [400, 800, 1200])} alt={flyer.alt} fetchPriority="high" />
      </a>}
      <div className="event-details">
        <h1>{page.title}</h1>
        <dl className="event-facts">
          <div><dt>Date</dt><dd><time dateTime={page.start}>{page.dateLabel}</time><span className="block mt-1 text-xs text-dod-lilac/70">{page.timeLabel}</span></dd></div>
          {page.venue && <div><dt>Venue</dt><dd>{page.venue}</dd></div>}
          <div><dt>Location</dt><dd>{page.location}</dd></div>
        </dl>
        <div className="event-lineup"><h2>Artists</h2><ul>{page.artists.map(artist => <li key={artist}>{artist}</li>)}</ul></div>
        <p className="text-sm leading-relaxed text-dod-white/60">{page.description}</p>
        {page.primaryCta && <div className="event-cta">
          <Button href={page.primaryCta.url} style={{ width: "100%", maxWidth: "none", gap: 12 }}>{page.primaryCta.label}<ArrowUpRightIcon size={17} /></Button>
        </div>}
        <div className="flex flex-wrap gap-x-6 gap-y-3">{page.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-dod-lilac underline underline-offset-4">{link.label}<ArrowUpRightIcon size={13} /></a>)}</div>
      </div>
    </div>
    <div className="event-media">
      {videos.length > 0 && <MediaCarousel title="Event Videos" items={videos} kind="videos" renderItem={media => <EventVideo media={media} />} />}
      {photos.length > 0 && <MediaCarousel title="Artwork and Photos" items={photos} kind="photos" renderItem={media => <a href={media.originalImage || media.image} target="_blank" rel="noopener noreferrer" className="event-artwork group"><img className="aspect-square w-full object-cover border border-dod-lilac/40" {...responsiveImage(media.previewImage || media.image, "(min-width: 768px) 35vw, 90vw", [320, 640, 960])} alt={media.alt} loading="lazy" decoding="async" /><ArtworkOverlay name={media.title} />{media.credit && <span className="text-xs text-dod-lilac">{media.credit}</span>}</a>} />}
    </div>
  </div>;
}
