// @vitest-environment node
import { expect, it, vi } from 'vitest';
vi.mock('#lib/strapi.js', () => ({ resolveMediaUrl: value => value?.url || null }));
import { normalizeEventIndex, normalizeEventPage, normalizeEventMedia } from './eventContent.js';
const show = { documentId: 'show', source_id: 'DOD-P033-L01', name: 'Takeover', date: '2023-07-22', end_date: '2023-07-23', start_time: '22:00:00.000', end_time: '04:00:00.000', timezone: 'America/Denver', artists: [{ derived: { name: 'Wylie Cable' } }], link: 'https://example.com/event', flyer: { documentId: 'flyer', title: 'Flyer', format: 'image', image: { url: 'https://example.com/flyer.webp' }, alt_text: 'Event flyer' } };
it('uses roster relations and only links to published pages', () => {
  expect(normalizeEventIndex({ ...show, page: { slug: 'takeover' } })).toMatchObject({ artists: ['Wylie Cable'], pageSlug: null });
  expect(normalizeEventIndex({ ...show, page: { slug: 'takeover', publishedAt: '2026-10-23' } })).toMatchObject({ pageSlug: 'takeover', flyerUrl: 'https://example.com/flyer.webp' });
});
it('rejects unusable media and normalizes YouTube links', () => {
  expect(normalizeEventMedia({ format: 'video', video_url: 'https://evil.example/watch?v=JEOty6YJ-IQ' })).toBeNull();
  expect(normalizeEventMedia({ documentId: 'video', format: 'video', video_url: 'https://youtu.be/JEOty6YJ-IQ?si=tracking' })).toMatchObject({ youtubeId: 'JEOty6YJ-IQ', videoUrl: 'https://www.youtube.com/watch?v=JEOty6YJ-IQ' });
});
it('uses shared show facts, ordered media, full lineup and historical ticket CTA', () => {
  const result = normalizeEventPage({ slug: 'takeover', show, lineup: [{ name: 'Guest' }, { name: 'Wylie Cable' }], primary_cta: { kind: 'tickets', label: 'Tickets', url: show.link }, videos: [{ media_item: { documentId: 'video', format: 'video', title: 'Live set', video_url: 'https://youtu.be/JEOty6YJ-IQ' } }] }, Date.parse('2026-10-23'));
  expect(result.page).toMatchObject({ title: 'Takeover', artists: ['Guest', 'Wylie Cable'], dateLabel: 'Jul 22–23, 2023', videoIds: ['video'], primaryCta: { label: 'Original Ticket Listing' } });
  expect(result.media.flyer.alt).toBe('Event flyer');
  expect(normalizeEventPage({ slug: 'orphan' })).toBeNull();
});

it('omits unpublished assets even when a relation is populated', () => {
  expect(normalizeEventMedia({ format: 'image', publishedAt: null, image: { url: 'https://example.com/draft.jpg' } })).toBeNull();
});

it('delivers small index images and larger page previews without losing originals', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/v123/flyer.png';
  const cloudShow = { ...show, flyer: { ...show.flyer, image: { url } } };
  expect(normalizeEventIndex(cloudShow).flyerUrl).toBe('https://res.cloudinary.com/demo/image/upload/f_webp,q_auto,c_limit,w_320/v123/flyer.webp');
  const item = normalizeEventMedia(cloudShow.flyer);
  expect(item.originalImage).toBe(url);
  expect(item.image).toContain('f_webp,q_auto,c_limit,w_1200');
  expect(item.previewImage).toContain('f_webp,q_auto,c_limit,w_640');
});
