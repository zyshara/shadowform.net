import { strapiGetAllPages } from '#lib/strapi.js';
import { cached } from '#lib/cache.js';
import { normalizeEventIndex, normalizeEventPage } from './models/eventContent.js';
const artistPopulate = { 'populate[artists][populate][derived]': 'true', 'populate[artists][populate][overrides]': 'true' };
const indexPopulate = {
  ...artistPopulate, 'populate[flyer][populate][image]': 'true',
  'populate[page][fields][0]': 'slug', 'populate[page][fields][1]': 'publishedAt',
  'populate[page][filters][publishedAt][$notNull]': 'true',
};
const loadIndex = cached(async () => (await strapiGetAllPages('/api/dome-of-doom-shows', { status: 'published', ...indexPopulate })).map(normalizeEventIndex).filter(Boolean));
// Public pages use published CMS records exclusively; draft records never fall back to fixtures.
export async function getEventIndex() {
  return { enabled: true, shows: await loadIndex() };
}
export async function getEventPage(slug) {
  const populate = {
    'populate[show][populate][flyer][populate][image]': 'true',
    'populate[show][populate][artists][populate][derived]': 'true',
    'populate[show][populate][artists][populate][overrides]': 'true',
    'populate[lineup]': 'true', 'populate[primary_cta]': 'true', 'populate[links]': 'true',
    'populate[videos][populate][media_item][populate][thumbnail]': 'true',
    'populate[photos][populate][media_item][populate][image]': 'true',
  };
  const pages = await strapiGetAllPages('/api/dome-of-doom-show-pages', { status: 'published', 'filters[slug][$eq]': slug, ...populate });
  return { enabled: true, content: pages[0] ? normalizeEventPage(pages[0]) : null };
}
