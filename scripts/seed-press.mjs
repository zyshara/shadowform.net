// scripts/seed-press.mjs
// Run: node --env-file=.env scripts/seed-press.mjs

const STRAPI_URL   = process.env.STRAPI_API_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error("STRAPI_API_URL and STRAPI_API_TOKEN must be set");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${STRAPI_TOKEN}`,
};

async function strapiGet(path) {
  const res = await fetch(`${STRAPI_URL}${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function strapiPost(path, data) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Outlets
// ---------------------------------------------------------------------------

const OUTLETS = [
  { name: "XLR8R",              website: "https://xlr8r.com" },
  { name: "Bandcamp",           website: "https://bandcamp.com" },
  { name: "Pitchfork",          website: "https://pitchfork.com" },
  { name: "Beatportal",         website: "https://beatportal.com" },
  { name: "Mixmag",             website: "https://mixmag.net" },
  { name: "Forbes",             website: "https://forbes.com" },
  { name: "EARMILK",            website: "https://earmilk.com" },
  { name: "Magnetic Magazine",  website: "https://magneticmag.com" },
  { name: "Resident Advisor",   website: "https://ra.co" },
  { name: "FACT Magazine",      website: "https://factmag.com" },
  { name: "Impose Magazine",    website: "https://imposemagazine.com" },
  { name: "Passionweiss",       website: "https://passionweiss.com" },
  { name: "LA Record",          website: "https://larecord.com" },
  { name: "Dancing Astronaut",  website: "https://dancingastronaut.com" },
  { name: "EDM Identity",       website: "https://edmidentity.com" },
  { name: "Audiofemme",         website: "https://audiofemme.com" },
  { name: "POW Mag",            website: "https://powmag.net" },
  { name: "The Electric Hawk",  website: "https://theelectrichawk.com" },
  { name: "Festival Insider",   website: "https://festivalinsider.com" },
  { name: "FUXWITHIT",          website: "https://fuxwithit.com" },
  { name: "H+ Creative",        website: "https://hpluscreative.com" },
  { name: "Vice",               website: "https://vice.com" },
  { name: "Consequence of Sound", website: "https://consequence.net" },
  { name: "Exclaim!",           website: "https://exclaim.ca" },
  { name: "The Untz",           website: "https://theuntz.com" },
  { name: "Hip Hop DX",         website: "https://hiphopdx.com" },
  { name: "LA Weekly",          website: "https://laweekly.com" },
  { name: "Suspend Magazine",   website: "https://suspendmagazine.com" },
];

// ---------------------------------------------------------------------------
// Press items  (outlet: name must match an entry in OUTLETS above)
// ---------------------------------------------------------------------------

const ITEMS = [
  // --- URL section (have actual links) ------------------------------------
  {
    title:  "Dome of Doom: Over A Decade of Creative Expression — Interview",
    url:    "https://festivalinsider.com/articles/dome-of-doom-over-a-decade-of-creative-expression-interview",
    outlet: "Festival Insider",
  },
  {
    title:  "Podcast 771: Wylie Cable",
    url:    "https://xlr8r.com/podcasts/podcast-771-wylie-cable/",
    outlet: "XLR8R",
  },
  {
    title:  "XLR8R+031 Is a Dome of Doom Special, Curated by Wylie Cable",
    url:    "https://xlr8r.com/xlr8r_plus/xlr8r031-is-a-dome-of-doom-special-curated-by-wylie-cable/",
    outlet: "XLR8R",
  },
  {
    title:  "Dome of Doom 10th Anniversary",
    url:    "https://www.audiofemme.com/dome-of-doom-10th-anniversary/",
    outlet: "Audiofemme",
  },
  {
    title:  "FVCKRENDER for Wylie Cable of Dome of Doom",
    url:    "https://www.hpluscreative.com/post/2019/10/25/fvckrender-for-wylie-cable-of-dome-of-doom",
    date:   "2019-10-25",
    outlet: "H+ Creative",
  },
  {
    title:  "Guest Mix + Interview: Wylie Cable",
    url:    "https://fuxwithit.com/2022/02/23/guest-mix-interview-wylie-cable/",
    date:   "2022-02-23",
    outlet: "FUXWITHIT",
  },
  {
    title:  "Dome of Doom Records: Decade of Doom Compilation — 10 Year Anniversary",
    url:    "https://www.powmag.net/p/dome-of-doom-records-decade-of-doom-compilation-10-year-anniversary",
    outlet: "POW Mag",
  },
  {
    title:  "PREMIERE: Wylie Cable Delivers New Single 'The Lure of Personal Success'",
    url:    "https://dancingastronaut.com/2020/09/premiere-dome-of-dooms-wylie-cable-delivers-new-single-the-lure-of-personal-success-from-upcoming-lp/",
    date:   "2020-09-01",
    outlet: "Dancing Astronaut",
  },
  {
    title:  "Maybe Forever — Dome of Doom",
    url:    "https://theelectrichawk.com/maybe-forever-dome-of-doom/",
    outlet: "The Electric Hawk",
  },
  {
    title:  "18 Labels Directing Bandcamp Revenue to Their Artists",
    url:    "https://pitchfork.com/news/18-labels-directing-bandcamp-revenue-to-their-artists/",
    outlet: "Pitchfork",
  },
  {
    title:  "A Decade Under the Dome of Doom with Wylie Cable",
    url:    "https://www.beatportal.com/articles/435396-a-decade-under-the-dome-of-doom-with-wylie-cable",
    outlet: "Beatportal",
  },
  {
    title:  "Dome of Doom Summer Compilation",
    url:    "https://edmidentity.com/2024/06/28/dome-of-doom-summer-compilation/",
    date:   "2024-06-28",
    outlet: "EDM Identity",
  },
  {
    title:  "Loop Dreams: An Interview with Shrimpnose",
    url:    "https://www.powmag.net/p/loop-dreams-an-interview-with-shrimpnose",
    outlet: "POW Mag",
  },

  // --- Bandcamp -----------------------------------------------------------
  { title: "The Best Beat Tapes on Bandcamp: September 2021", date: "2021-09-01", outlet: "Bandcamp" },
  { title: "Baby Weight, Daedelus, ZOF, More Appear on New Dome of Doom Spring Compilation", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes of 2020", date: "2020-12-01", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: September 2020", date: "2020-09-01", outlet: "Bandcamp" },
  { title: "Album of the Day: Wylie Cable, 'Shimmer, Then Disappear'", outlet: "Bandcamp" },
  { title: "Daedelus's New LP Is A Noisy Tribute to '90s Rave", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: April 2020", date: "2020-04-01", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: February 2020", date: "2020-02-01", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: December 2019 / January 2020", date: "2020-01-01", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes of 2019", date: "2019-12-01", outlet: "Bandcamp" },
  { title: "Rah Zen is Shining Light on Boston's Beat Scene", outlet: "Bandcamp" },
  { title: "The Best Hip-Hop on Bandcamp: September 2019", date: "2019-09-01", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: July 2019", date: "2019-07-01", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: June 2019", date: "2019-06-01", outlet: "Bandcamp" },
  { title: "To Make His Latest LP, Gnome Beats Pushed Himself to the Breaking Point", outlet: "Bandcamp" },
  { title: "On 'A Man + His Plants,' Chicano Rapper Speak Finds His Identity In A Self-Created Eden", outlet: "Bandcamp" },
  { title: "The Best Beat Tapes on Bandcamp: September 2018", date: "2018-09-01", outlet: "Bandcamp" },

  // --- XLR8R --------------------------------------------------------------
  { title: "Istanbul's Badmixday Signs to Dome of Doom for New Album", outlet: "XLR8R" },
  { title: "CLYDE Moves Through Jungle and Hardcore for Dome of Doom", outlet: "XLR8R" },
  { title: "Mexico's Jorge Gamboa Patrón Signs to Dome of Doom with Reflective Album of Spellbinding Flamenco", outlet: "XLR8R" },
  { title: "Dome of Doom Welcomes Renowned Scratch Artist DJ Ride for New Album", outlet: "XLR8R" },
  { title: "Elusive is Back with a New Dome of Doom Album", outlet: "XLR8R" },
  { title: "Bleep Bloop Next on Dome of Doom with New EP", outlet: "XLR8R" },
  { title: "Shrimpnose's New Dome of Doom Album Features Daedelus, Bleep Bloop, and Somni", outlet: "XLR8R" },
  { title: "Dome of Doom Unveils New Daedelus Album, 'What Wands Won't Break'", outlet: "XLR8R" },
  { title: "Dome of Doom Welcomes QRTR for Debut Album, 'Drenched'", outlet: "XLR8R" },
  { title: "NastyNasty Drops Valentine's Day Double-Single", outlet: "XLR8R" },
  { title: "Alphafox Next on Dome of Doom with Debut Album", outlet: "XLR8R" },
  { title: "Gnome Beats Unveils Sophomore Album via Dome of Doom", outlet: "XLR8R" },
  { title: "Dome of Doom Welcomes South Africa's Jon Casey for Debut Album", outlet: "XLR8R" },
  { title: "Wylie Cable Locks in New Dome of Doom Album", outlet: "XLR8R" },
  { title: "Elusive Lines Up Fifth Full-Length on Dome of Doom Records", outlet: "XLR8R" },
  { title: "Toronto's thook Signs to Dome of Doom for New Album", outlet: "XLR8R" },
  { title: "Odd Nosdam's 'Plan 9… Meat Your Hypnotis' LP Set for 20th-Anniversary Reissue", outlet: "XLR8R" },
  { title: "Premiere: Stream Huxley Anne's Debut LP in Full", outlet: "XLR8R" },
  { title: "Daedelus Announces New LP 'Labyrinths'", outlet: "XLR8R" },

  // --- EARMILK ------------------------------------------------------------
  { title: "PENNYWILD Is Fearless with Creativity", outlet: "EARMILK" },
  { title: "Lealani is Liable to Annihilate Your Eardrums with 'Miniscule'", outlet: "EARMILK" },
  { title: "Shrimpnose's Newest Instrumental Project is 'Sullen'", outlet: "EARMILK" },
  { title: "Space Gang is Back with New Shrimpnose Collaboration, 'Polyester'", outlet: "EARMILK" },
  { title: "Speakpanther Take Us for a Ride in the Visual for 'Distill'", outlet: "EARMILK" },
  { title: "Dream Panther's 'MVP' is the Ambient-Rap Project You've Been Waiting For", outlet: "EARMILK" },

  // --- Magnetic Magazine --------------------------------------------------
  { title: "PENNYWILD on Merging Dance, Tech & Music with The Penny Pad, Creating New EP 'MIDI in Motion'", outlet: "Magnetic Magazine" },
  { title: "The Director's Cut: QRTR — Drenched", outlet: "Magnetic Magazine" },
  { title: "Get a Taste of Minneapolis' Underground Scene with Shrimpnose's 'Witherwithout'", outlet: "Magnetic Magazine" },
  { title: "Interview + Playlist: Huxley Anne Brings Intense Emotions into 'Ilium'", outlet: "Magnetic Magazine" },
  { title: "5 Can't Miss Acts at Lowend Theory Festival", outlet: "Magnetic Magazine" },

  // --- Forbes -------------------------------------------------------------
  { title: "How Dome Of Doom Became One Of The LA Beat Scene's Best New Labels", outlet: "Forbes" },

  // --- Mixmag -------------------------------------------------------------
  { title: "Badmixday Announces Details of Sophomore Album 'Goya'", outlet: "Mixmag" },
  { title: "QRTR Releases Debut Album with Dome of Doom", outlet: "Mixmag" },
  { title: "The Beat Scene 2.0: The Legacy of LA's Infamous Beat Scene Pushes Forward", outlet: "Mixmag" },
  { title: "Ivy Lab & Huxley Anne at The Lab London", outlet: "Mixmag" },

  // --- LA Record ----------------------------------------------------------
  { title: "Lealani 'Fantastic Planet' Album Review", outlet: "LA Record" },
  { title: "Video Premiere: Lealani 'Floating'", outlet: "LA Record" },
  { title: "Track Premiere: Wylie Cable 'Pirouette' Feat. Daedelus", outlet: "LA Record" },
  { title: "Track Premiere: Wylie Cable 'Dog Park'", outlet: "LA Record" },
  { title: "Track Premiere: Great Dane 'WW3'", outlet: "LA Record" },
  { title: "Track Premiere: ELOS 'Data West Suite'", outlet: "LA Record" },
  { title: "Video Premiere: Daedelus 'Keeps Fires Burning' (Feat. VŌX)", outlet: "LA Record" },
  { title: "Linafornia Interview: 'I'm In The Right Place'", outlet: "LA Record" },
  { title: "Track Premiere: Linafornia 'Wetttt'", outlet: "LA Record" },
  { title: "Track Premiere: Elos 'Y'know'", outlet: "LA Record" },
  { title: "Eureka The Butcher, 'Dessert Ritual'", outlet: "LA Record" },
  { title: "Track Premiere: Nobody, 'Double Vision'", outlet: "LA Record" },
  { title: "Video Premiere: The Blank Tapes, 'Lover's Lane'", outlet: "LA Record" },

  // --- Passionweiss -------------------------------------------------------
  { title: "'I Just Like Throwing Shit at the Wall and Seeing What Sticks': An Interview with Gangus", outlet: "Passionweiss" },
  { title: "'We Just Have this Insatiable Desire To Make Things': An Interview With Huxley Anne", outlet: "Passionweiss" },
  { title: "POW Premiere: Rah Zen's 'Midnight Satori'", outlet: "Passionweiss" },
  { title: "POTW Premiere: Daedelus & Zeroh are 'The Minotaur'", outlet: "Passionweiss" },
  { title: "Linestepping with Gnome Beats & Myka 9", outlet: "Passionweiss" },
  { title: "DOMEOFDOOM_MIXTAPE//001", outlet: "Passionweiss" },
  { title: "Phedee, 'I B Chillin Duu'", outlet: "Passionweiss" },

  // --- FACT Magazine ------------------------------------------------------
  { title: "Daedelus Against the Clock — 100th Episode Special", outlet: "FACT Magazine" },
  { title: "Daedelus Announces 'Labyrinths' — Hear the Title Track Now", outlet: "FACT Magazine" },

  // --- Impose Magazine ----------------------------------------------------
  { title: "ELOS, 'Not The Best' Featuring Milo & Busdriver", outlet: "Impose Magazine" },
  { title: "Kenny Segal, Kenstrumentals Vol. 2: Summer Rarities", outlet: "Impose Magazine" },
  { title: "Wylie Cable, 'Just Out Here Doin' It'", outlet: "Impose Magazine" },
  { title: "Eureka The Butcher, 'Main Frame'", outlet: "Impose Magazine" },
  { title: "Linafornia, 'Yung'", outlet: "Impose Magazine" },
  { title: "DOMEOFDOOM_MIXTAPE//003", outlet: "Impose Magazine" },
  { title: "DOMEOFDOOM_MIXTAPE//002", outlet: "Impose Magazine" },

  // --- Misc ---------------------------------------------------------------
  { title: "SWISHA Slam Dunks Jersey Club, Footwork, and Baile Funk Together on Debut Album 'JBW2K16'", outlet: "Vice" },
  { title: "Linafornia Artist Interview and Album Release 'YUNG'", outlet: "Suspend Magazine" },
  { title: "Stream: Prolific Electronic Artist Daedelus' New Album, Labyrinths", outlet: "Consequence of Sound" },
  { title: "Daedelus Reveals New Album, Labyrinths", outlet: "Resident Advisor" },
  { title: "Daedelus 'Labyrinths' Album Review", outlet: "Exclaim!" },
  { title: "Huxley Anne Debuts Powerful 'Aphro Dye' from Forthcoming Album", outlet: "The Untz" },
  { title: "Linafornia is Breaking Down Gender Barriers in LA's Beat Scene", outlet: "Hip Hop DX" },
  { title: "Eraserfase, Interview: 'Analog Rituals'", outlet: "LA Weekly" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getExistingOutlets() {
  const res = await strapiGet("/api/dome-of-doom-press-outlets?pagination[pageSize]=100");
  return res.data ?? [];
}

async function getExistingItems() {
  const res = await strapiGet("/api/dome-of-doom-press-items?pagination[pageSize]=200");
  return res.data ?? [];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("Fetching existing outlets…");
  const existing = await getExistingOutlets();
  const outletMap = {}; // name → documentId
  for (const o of existing) {
    outletMap[o.name] = o.documentId;
  }

  // Create missing outlets
  for (const outlet of OUTLETS) {
    if (outletMap[outlet.name]) {
      console.log(`  skip outlet (exists): ${outlet.name}`);
      continue;
    }
    console.log(`  create outlet: ${outlet.name}`);
    const res = await strapiPost("/api/dome-of-doom-press-outlets", {
      ...outlet,
      publishedAt: new Date().toISOString(),
    });
    outletMap[outlet.name] = res.data?.documentId;
  }

  console.log("\nFetching existing press items…");
  const existingItems = await getExistingItems();
  const existingTitles = new Set(existingItems.map((i) => i.title?.trim().toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const item of ITEMS) {
    const titleKey = item.title.trim().toLowerCase();
    if (existingTitles.has(titleKey)) {
      skipped++;
      continue;
    }

    const outletDocId = outletMap[item.outlet];
    if (!outletDocId) {
      console.warn(`  WARN: no outlet found for "${item.outlet}" — skipping "${item.title}"`);
      skipped++;
      continue;
    }

    console.log(`  create: [${item.outlet}] ${item.title}`);
    await strapiPost("/api/dome-of-doom-press-items", {
      title: item.title,
      ...(item.url  ? { url: item.url }   : {}),
      ...(item.date ? { date: item.date } : {}),
      outlet: outletDocId,
      publishedAt: new Date().toISOString(),
    });
    created++;
  }

  console.log(`\nDone. ${created} items created, ${skipped} skipped.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
