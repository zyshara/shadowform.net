import { cdnImg } from '#lib/cloudinary.js';
import { resolveMediaUrl } from '#lib/strapi.js';
import { showDateLabel } from '../../../../src/domeofdoom/utils/showInventory.js';

const flat = value => value?.data ?? value;
const array = value => Array.isArray(flat(value)) ? flat(value) : [];
const fields = value => flat(value)?.attributes ?? flat(value);
const artistName = raw => { const a = fields(raw); return a?.overrides?.name || a?.derived?.name || a?.name; };
export function normalizeEventMedia(raw) {
  const m = fields(raw);
  if (!m || (Object.hasOwn(m, "publishedAt") && !m.publishedAt)) return null;
  const id = raw.documentId ?? raw.id;
  let youtubeId = null;
  try {
    const url = new URL(m.video_url);
    if (['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(url.hostname)) {
      youtubeId = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/')[2];
    }
  } catch { /* Optional video URL on images. */ }
  if (youtubeId && !/^[\w-]{11}$/.test(youtubeId)) youtubeId = null;
  const image = resolveMediaUrl(fields(m.image));
  if (m.format === 'image' && !image || m.format === 'video' && !youtubeId) return null;
  return { id, title: m.title, format: m.format, category: m.category, image: cdnImg(image, 1200), originalImage: image, previewImage: cdnImg(image, 640),
    thumbnail: cdnImg(resolveMediaUrl(fields(m.thumbnail)), 800), alt: m.alt_text || '', credit: m.credit,
    youtubeId, videoUrl: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null };
}
export function normalizeEventIndex(raw) {
  const s = fields(raw);
  if (!s?.name || !s.date) return null;
  const page = fields(s.page);
  return { cms: true, id: s.source_id || raw.documentId || raw.id, title: s.name,
    date: s.date, endDate: s.end_date, dateKind: s.date_kind || 'event', type: s.type || 'Show',
    venue: s.venue, city: s.city, state: s.state, country: s.country,
    artists: array(s.artists).map(artistName).filter(Boolean), url: s.link,
    flyerUrl: cdnImg(normalizeEventMedia(flat(s.flyer))?.originalImage, 320) || null,
    pageSlug: page?.publishedAt ? page.slug : null };
}
export function normalizeEventPage(raw, now = Date.now()) {
  const p = fields(raw), s = fields(p?.show);
  if (!p?.slug || !s?.name || !s.date || (Object.hasOwn(s, "publishedAt") && !s.publishedAt)) return null;
  const media = {};
  const collect = (placements, format) => array(placements).map(placement => {
    const item = normalizeEventMedia(flat(placement.media_item));
    if (!item || item.format !== format) return null;
    media[item.id] = { ...item, caption: placement.caption };
    return item.id;
  }).filter(Boolean);
  const flyer = normalizeEventMedia(flat(s.flyer));
  if (flyer) media[flyer.id] = flyer;
  const date = { date: s.date, endDate: s.end_date };
  const dateLabel = showDateLabel(date);
  const timezone = s.timezone || 'UTC';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
  const past = (s.end_date || s.date) < today;
  const time = value => value ? new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(`1970-01-01T${value}Z`)) : '';
  const timeLabel = [s.start_time && `${time(s.start_time)}${s.end_time ? `–${time(s.end_time)}` : ''}`, s.start_time && s.timezone].filter(Boolean).join(' · ');
  const primaryCta = p.primary_cta ? { label: past && p.primary_cta.kind === 'tickets' ? 'Original Ticket Listing' : p.primary_cta.label, url: p.primary_cta.url } : null;
  return { page: { slug: p.slug, title: s.name, flyerId: flyer?.id, description: p.description,
    dateLabel, timeLabel, start: s.date, venue: s.venue,
    location: [s.city, s.state, s.country].filter(Boolean).join(', '),
    artists: array(p.lineup).length ? p.lineup.map(credit => credit.name) : array(s.artists).map(artistName).filter(Boolean),
    primaryCta, links: array(p.links), videoIds: collect(p.videos, 'video'), photoIds: collect(p.photos, 'image') }, media };
}
