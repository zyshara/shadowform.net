// Reviewed inventory import. Offline dry-run by default; --apply creates drafts.
// Add --publish only for the reviewed entries and their specific seed media/pages.
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
const apply = process.argv.includes('--apply');
const publish = process.argv.includes('--publish');
const base = process.env.STRAPI_API_URL;
const headers = { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` };
const inventory = JSON.parse(await readFile(new URL('./data/reviewed-shows.json', import.meta.url), 'utf8'));
const seeded = new Set(['DOD-P033-L01', 'DOD-P007-L01']);
async function api(path, { method = 'GET', data, form } = {}) {
  const response = await fetch(new URL(path, base), { method, headers: { ...headers, ...(data ? { 'Content-Type': 'application/json' } : {}) }, body: form || (data ? JSON.stringify({ data }) : undefined), signal: AbortSignal.timeout(30000) });
  const body = await response.json();
  if (!response.ok) throw new Error(`${method} ${path.split('?')[0]}: ${response.status} ${body.error?.message || ''}`);
  return body;
}
async function list(collection, query = {}) {
  const result = [];
  for (let page = 1;;page++) {
    const body = await api(`/api/${collection}?${new URLSearchParams({ ...query, 'pagination[page]': String(page), 'pagination[pageSize]': '100' })}`);
    result.push(...body.data);
    if (page >= (body.meta?.pagination?.pageCount || 1)) return result;
  }
}
if (!apply) {
  console.log(`DRY RUN: ${inventory.length} reviewed shows; preserve the two seeded detail pages, leave other shows external-only. --apply writes drafts; --apply --publish also publishes this reviewed set and its media/pages.`);
} else {
  if (!base || !process.env.STRAPI_API_TOKEN) throw new Error('Set STRAPI_API_URL and STRAPI_API_TOKEN.');
  const [shows, roster] = await Promise.all([
    list('dome-of-doom-shows', { status: 'draft' }),
    list('dome-of-doom-artists', { 'populate[derived]': 'true', 'populate[overrides]': 'true' }),
    list('dome-of-doom-media-items', { status: 'draft' }),
  ]);
  const nameOf = artist => (artist.overrides?.name || artist.derived?.name || artist.name || '').trim().toLowerCase();
  const imported = [];
  for (const item of inventory) {
    let existing = shows.find(show => show.source_id === item.id);
    // Verified duplicate of an existing legacy CMS entry: retain its document ID.
    if (!existing && item.id === 'DOD-P039-L05') existing = shows.find(show => show.name === 'HARD Summer 2023' && show.date === '2023-08-05');
    if (seeded.has(item.id)) {
      if (!existing) throw new Error(`Run the detail-page seed first: ${item.id}`);
      imported.push(existing);
      continue;
    }
    const artists = item.artists.map(name => {
      const artist = roster.find(candidate => nameOf(candidate) === name.trim().toLowerCase());
      if (!artist) console.log(`No roster relation for ${name}; leaving guest/unmatched credit out of index.`);
      return artist?.documentId;
    }).filter(Boolean);
    const data = { source_id: item.id, name: item.title, date: item.date, end_date: item.endDate,
      date_kind: item.dateKind, type: item.type, venue: item.venue, city: item.city, state: item.state,
      country: item.country, tour_name: item.tour, link: item.url, artists, verification: 'checked',
      source_notes: `Reviewed historical inventory (${item.id}). Full original lineup: ${item.lineup || item.artists.join(', ')}.`,
      source_urls: item.url ? [item.url] : [],
    };
    const result = await api(`/api/dome-of-doom-shows${existing ? `/${existing.documentId}` : ''}?status=draft`, { method: existing ? 'PUT' : 'POST', data });
    imported.push(result.data);
    console.log(`Draft ready: ${item.title}`);
  }
  const nightfall = imported.find(show => show.source_id === 'DOD-P063-L01');
  const files = await api('/api/upload/files?filters[name][$eq]=dod-nightfall-2019.webp');
  let file = files[0];
  if (!file) {
    const form = new FormData();
    form.append('files', new Blob([await readFile(new URL('../../../../src/domeofdoom/assets/shows/nightfall-2019.webp', import.meta.url))], { type: 'image/webp' }), 'dod-nightfall-2019.webp');
    file = (await api('/api/upload', { method: 'POST', form }))[0];
  }
  const media = await list('dome-of-doom-media-items', { status: 'draft', 'filters[source_id][$eq]': 'nightfall-2019-flyer' });
  const flyer = (await api(`/api/dome-of-doom-media-items${media[0] ? `/${media[0].documentId}` : ''}?status=draft`, { method: media[0] ? 'PUT' : 'POST', data: {
    source_id: 'nightfall-2019-flyer', title: 'Nightfall Music Festival 2019 flyer', format: 'image', category: 'flyer', image: file.id,
    alt_text: 'Nightfall Music Festival, November 1–3, 2019, Parker House Haunted Attraction, Denton, Texas. Lineup includes Wylie Cable b2b Gangus.',
    include_in_media_index: true, shows: [nightfall.documentId],
  } })).data;
  await api(`/api/dome-of-doom-shows/${nightfall.documentId}?status=draft`, { method: 'PUT', data: { flyer: flyer.documentId } });
  if (publish) {
    const mediaKeys = ['maybe-forever-flyer', 'maybe-forever-recording-1', 'maybe-forever-recording-2', 'enter-shibuya-2026-flyer', 'nightfall-2019-flyer'];
    const mediaDrafts = await list('dome-of-doom-media-items', { status: 'draft' });
    const pageDrafts = await list('dome-of-doom-show-pages', { status: 'draft' });
    for (const key of mediaKeys) {
      const item = mediaDrafts.find(item => item.source_id === key);
      if (!item) throw new Error(`Missing media draft: ${key}`);
      await api(`/api/dome-of-doom-media-items/${item.documentId}?status=published`, { method: 'PUT', data: {} });
    }
    for (const show of imported) await api(`/api/dome-of-doom-shows/${show.documentId}?status=published`, { method: 'PUT', data: {} });
    for (const slug of ['maybe-forever-dome-of-doom-takeover-2023', 'dome-of-doom-enter-shibuya-2026']) {
      const page = pageDrafts.find(page => page.slug === slug);
      if (!page) throw new Error(`Missing page draft: ${slug}`);
      await api(`/api/dome-of-doom-show-pages/${page.documentId}?status=published`, { method: 'PUT', data: {} });
    }
    console.log(`Published ${imported.length} reviewed shows, ${mediaKeys.length} media items, and 2 optional pages. Other CMS records were not modified.`);
  }
}
