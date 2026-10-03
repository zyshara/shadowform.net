// server/scripts/seedJenis32Activities.js
//
// One-time seed of the jenis32-activity content type in Strapi, per the
// jenis32 gameplan section 5.2. Run with:
//   node --experimental-vm-modules server/scripts/seedJenis32Activities.js
//
// Requires STRAPI_API_URL and STRAPI_API_TOKEN in env (or .env file).
// Skips any activity whose slug already exists, same as
// seedHakubutsukanMuseums.js — intentionally skip-not-overwrite, since
// Jennifer edits this copy live in Strapi admin after the initial seed and
// a blind upsert would clobber those edits on a re-run.

import "dotenv/config";
import { strapiPost, strapiGet } from "../lib/strapi.js";

const ACTIVITIES = [
  // ── Anytime ──
  {
    slug: "introduce-yourself",
    title: "Introduce yourself",
    prompt: "Create your profile",
    type: "profile",
    config: {},
    group: "anytime",
    order: 1,
    required: true,
    enabled: true,
  },
  {
    slug: "nickname-for-jen",
    title: "What's your nickname for Jen?",
    prompt: "Jen, JLD, jdeck, zy, dumb hoe, what do you know me as?",
    type: "text",
    config: {},
    group: "anytime",
    order: 2,
    required: false,
    enabled: true,
  },
  {
    slug: "draw-jen",
    title: "Draw Jen from memory",
    prompt: "Bonus points if she's birthday themed.",
    type: "drawing",
    config: {},
    group: "anytime",
    order: 4,
    required: false,
    enabled: true,
  },
  {
    slug: "reminds-you-of-jen",
    title: "Upload a gif",
    prompt: "Pick your best twitter slop that reminds you of me",
    type: "media",
    config: { accept: ["gif"], allowMultiple: false },
    group: "anytime",
    order: 5,
    required: false,
    enabled: true,
  },
  {
    slug: "you-and-jen-decorated",
    title: "Upload a picture of you and Jen",
    prompt: "Then decorate it: draw on it and add stickers.",
    type: "photo-decorate",
    config: {},
    group: "anytime",
    order: 6,
    required: false,
    enabled: true,
  },
  {
    slug: "birthday-message",
    title: "Record Jen a happy birthday message",
    prompt: "Friendly, wholesome, your choice.",
    type: "audio",
    config: { maxSeconds: 120 },
    group: "anytime",
    order: 7,
    required: false,
    enabled: true,
  },
  {
    slug: "pet-tax",
    title: "Pet tax",
    prompt: "A photo of your cat / dog / creature.",
    type: "media",
    config: { accept: ["image"], allowMultiple: false, caption: true },
    group: "anytime",
    order: 9,
    required: false,
    enabled: true,
  },
  {
    slug: "modelo-time",
    title: "Modelo Time",
    prompt: "Is it Modelo time?",
    type: "runaway",
    config: {
      question: "Is it Modelo time?",
      yesLabel: "Yes",
      noLabel: "No",
      successMessage: "It's always Modelo time.",
      taunts: ["nope", "nice try", "it's Modelo time"],
    },
    group: "anytime",
    order: 10,
    required: false,
    enabled: true,
  },

  // ── During the party ──
  {
    slug: "goldshire-inn",
    title: "Upload a photo from the Goldshire Inn",
    prompt: "Character name, race, and class make a great caption.",
    type: "media",
    config: { accept: ["image"], allowMultiple: true, maxFiles: 10, caption: true },
    group: "party",
    order: 11,
    required: false,
    enabled: true,
  },
  {
    slug: "birthday-shot",
    title: "Upload a photo or video of you taking a shot",
    prompt: "Water is acceptable.",
    type: "media",
    config: { accept: ["image", "video"], allowMultiple: false, caption: true },
    group: "party",
    order: 12,
    required: false,
    enabled: true,
  },
];

async function slugExists(slug) {
  try {
    const res = await strapiGet("/api/jenis32-activities", {
      "filters[slug][$eq]": slug,
      "pagination[pageSize]": 1,
    });
    return res.data.length > 0;
  } catch {
    return false;
  }
}

async function seed() {
  let created = 0;
  let skipped = 0;

  for (const activity of ACTIVITIES) {
    if (await slugExists(activity.slug)) {
      console.log(`skip  ${activity.title}`);
      skipped++;
      continue;
    }

    await strapiPost("/api/jenis32-activities", { data: activity });
    console.log(`added ${activity.title}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
