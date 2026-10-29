import { expect, it } from 'vitest';
import collection from './data/photos.json';
import family from './data/family.json';
import { personPhotos, photoPeople, photoTags } from './photos.js';
it('shares the latest photograph between Bernard and Elizabeth', () => {
 const photo=collection.find(p=>p.src.endsWith('-02.webp'));
 for(const id of ['bernard','elizabeth']) expect(personPhotos(family.people.find(p=>p.id===id),collection)).toContain(photo);
 expect(new Set(collection.map(p=>p.id)).size).toBe(collection.length);
});
it('ignores nonexistent people and normalizes descriptive tags',()=>{
 expect(photoPeople({people:['missing','elizabeth']},family.people).map(p=>p.id)).toEqual(['elizabeth']);
 expect(photoTags({tags:['vacation',' vacation ',null,'']})).toEqual(['vacation']);
});
it('merges old galleries without duplicates',()=>{
 expect(personPhotos({id:'a',photos:[{src:'/one.webp'},{src:'/two.webp'}]},[{id:'one',src:'/one.webp',people:['a']}]).map(p=>p.src)).toEqual(['/one.webp','/two.webp']);
});
