// Unknown people are omitted from links; their photo remains viewable.
export function photoPeople(photo, people) {
  return people.filter(person => Array.isArray(photo.people) && photo.people.includes(person.id));
}
export function photoTags(photo) {
  return [...new Set((Array.isArray(photo.tags) ? photo.tags : []).filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim()))];
}
export function personPhotos(person, collection = []) {
  const photos = [...collection.filter(photo => Array.isArray(photo.people) && photo.people.includes(person.id)), ...(Array.isArray(person.photos) ? person.photos : [])];
  return photos.filter((photo, index) => typeof photo?.src === 'string' && photo.src.trim() && photos.findIndex(other => other?.src === photo.src) === index);
}

// Percentages are measured from the original image's top-left corner.
export function photoPositions(photo, people) {
  const associated = new Set(photoPeople(photo, people).map(person => person.id));
  const seen = new Set();
  return (Array.isArray(photo.positions) ? photo.positions : []).flatMap(position => {
    if (!position || !associated.has(position.personId) || seen.has(position.personId) ||
      !Number.isFinite(position.x) || !Number.isFinite(position.y) ||
      position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) return [];
    seen.add(position.personId);
    return [{ ...position, person: people.find(person => person.id === position.personId) }];
  });
}
