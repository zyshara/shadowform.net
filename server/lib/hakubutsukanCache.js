// In-memory singleton for normalized hakubutsukan data. Same pattern as
// strapiCatalogCache.js — fetchAndCacheHakubutsukanData.js writes here;
// server/routes/spas.js reads to seed the client bundle per request.

let museums    = [];
let exhibits   = [];
let heroImages = [];
let tags       = [];

export function getMuseums()    { return museums;    }
export function setMuseums(v)   { museums = v;       }

export function getExhibits()   { return exhibits;   }
export function setExhibits(v)  { exhibits = v;      }

export function getHeroImages()  { return heroImages; }
export function setHeroImages(v) { heroImages = v;    }

export function getTags()        { return tags;       }
export function setTags(v)       { tags = v;          }
