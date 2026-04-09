import { normalizeHeader } from "./header.js";
import { normalizeArtist } from "./artist.js";

function normalizeArtistCard(raw) {
  if (!raw) return null;

  const artist = normalizeArtist(raw.artist);

  if (!artist) return null;

  const { 
     name, 
     primary_genre, 
     location, 
     genres, 
     blurb, 
     icon 
  } = artist;

  return {
    name,
    primary_genre,
    location,
    genres,
    blurb,
    icon,
    links: (raw.links ?? []).map((l) => ({
      label: l.label    ?? "",
      url:   l.url?.url ?? "",
    })),
  };
}

export function normalizeManagementPage(raw) {
  if (!raw) return null;

  return {
    header:       normalizeHeader(raw.header),
    artist_cards: (raw.artists ?? []).map(normalizeArtistCard),
  };
}
