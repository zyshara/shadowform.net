// server/cron/notion.js

import cron from "node-cron";
import { logger } from "../lib/logger.js";
import { queryDatabase, createPage, updatePage, getPage } from "../lib/notion.js";
import { createEvent, updateEvent } from "../lib/googleCalendar.js";

const RELEASES_DATABASE_ID              = process.env.NOTION_RELEASES_DATABASE_ID;
const ROLLOUTS_DATABASE_ID              = process.env.NOTION_ROLLOUTS_DATABASE_ID;
const ROLLOUT_TASKS_DATABASE_ID         = process.env.NOTION_ROLLOUT_TASKS_DATABASE_ID;
const ROLLOUT_TASK_TEMPLATE_DATABASE_ID = process.env.NOTION_ROLLOUT_TASK_TEMPLATE_DATABASE_ID;

// 1min cron interval + a wide buffer: Notion's last_edited_time filter can
// lag well behind real time for edits made by collaborators (vs. the
// integration's own writes), so a short window can miss an edit entirely
// with no error — it just silently never syncs. queryDatabase now paginates
// fully, so widening this costs nothing extra in practice at this table's size.
const LOOKBACK_MS = 10 * 60 * 1000;

// maps a Rollout Task's Artist relation to the calendar it belongs on
const ARTIST_CALENDAR_IDS = {
  "334b025f-27d3-8018-8e92-d77ddcfd2649": process.env.GOOGLE_CALENDAR_ID_RED_SPEAR, // Red Spear
  "334b025f-27d3-803f-82af-e878c57fa2ca": process.env.GOOGLE_CALENDAR_ID_LOW_POLY,  // Low Poly
};

// De-dupes calendar syncs against a "Google Calendar Last Sync" Notion date
// property. A wide LOOKBACK_MS means the same edited page reappears in the
// query on every tick for the whole window — without this, that's a Google
// Calendar API call per tick per page, which is what tripped a rate limit.
// Persisted on the page itself, so it survives restarts and is visible in
// Notion, unlike the in-memory map this replaced.
function alreadySynced(page) {
  const lastSync = page.properties["Google Calendar Last Sync"]?.date?.start;
  if (!lastSync) return false;
  return new Date(lastSync) >= new Date(page.last_edited_time);
}

function getTitle(page, propertyName = "Name") {
  return page.properties[propertyName]?.title?.[0]?.plain_text ?? "Untitled";
}

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

// Scenario 0: Rollout Tasks past due (and not already finished/dead) get
// rolled to today and flagged Overdue. Runs before scenario 1 so a fresh
// tick's status/date changes are picked up by the same tick's calendar sync.
async function markOverdueRolloutTasks() {
  const today = todayISODate();

  const overdueTasks = await queryDatabase(ROLLOUT_TASKS_DATABASE_ID, {
    and: [
      { property: "Due Date", date: { before: today } },
      { property: "Status", status: { does_not_equal: "Done" } },
      { property: "Status", status: { does_not_equal: "Archived" } },
      { property: "Status", status: { does_not_equal: "Dropped" } },
    ],
  });

  for (const task of overdueTasks) {
    const taskName = task.properties["Name"]?.formula?.string ?? getTitle(task, "Description");
    try {
      logger.info(`[notionCron] marking overdue: ${taskName}`);
      await updatePage(task.id, {
        "Due Date": { date: { start: today } },
        Status:     { status: { name: "Overdue" } },
      });
    } catch (err) {
      logger.error(`[notionCron] failed to mark overdue "${taskName}":`, err.message);
    }
  }
}

// Every Rollout Task Template item becomes a Rollout Task, due-dated off the
// Rollout's Release Date (drilled down from the rollup) plus the template's offset.
async function createRolloutTasksFromTemplate(rollout) {
  const releaseDateStart = rollout.properties["Release Date"]?.rollup?.array?.[0]?.date?.start;
  if (!releaseDateStart) {
    logger.warn(`[notionCron] rollout "${getTitle(rollout)}" has no Release Date yet, skipping task creation`);
    return;
  }

  const artistId = rollout.properties["Artist"]?.rollup?.array?.[0]?.relation?.[0]?.id;
  if (!artistId) {
    logger.warn(`[notionCron] rollout "${getTitle(rollout)}" has no Artist yet`);
  }

  const templates = await queryDatabase(ROLLOUT_TASK_TEMPLATE_DATABASE_ID);

  for (const template of templates) {
    const templateName = getTitle(template);
    const offset        = template.properties["Offset Days"]?.number ?? 0;
    const dueDate        = addDays(releaseDateStart, offset);

    logger.info(`[notionCron] creating rollout task: ${templateName} (due ${dueDate})`);

    await createPage(ROLLOUT_TASKS_DATABASE_ID, {
      Description: { title: [{ text: { content: templateName } }] },
      Rollout:     { relation: [{ id: rollout.id }] },
      "Due Date":  { date: { start: dueDate } },
      Status:      { status: { name: "To Do" } },
      ...(artistId ? { Artist: { relation: [{ id: artistId }] } } : {}),
    });
  }
}

// Scenario 1: new Releases without a linked Rollout get one created, along
// with a full set of Rollout Tasks generated from the task template database.
async function createMissingRollouts() {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();

  const recentReleases = await queryDatabase(RELEASES_DATABASE_ID, {
    timestamp: "created_time",
    created_time: { on_or_after: since },
  });

  for (const release of recentReleases) {
    const hasRollout = release.properties["Rollout"]?.relation?.length > 0;
    if (hasRollout) continue;

    const releaseName = getTitle(release);
    try {
      logger.info(`[notionCron] creating rollout for release: ${releaseName}`);

      const created = await createPage(ROLLOUTS_DATABASE_ID, {
        Name:    { title: [{ text: { content: releaseName } }] },
        Release: { relation: [{ id: release.id }] },
        Status:  { select: { name: "In Progress" } },
      });

      // re-fetch so the Release Date rollup (pulled through the relation we
      // just set) is populated before we compute task due dates from it
      const rollout = await getPage(created.id);
      await createRolloutTasksFromTemplate(rollout);
    } catch (err) {
      logger.error(`[notionCron] failed to create rollout for release "${releaseName}":`, err.message);
    }
  }
}

// Creates the calendar event if `page` has no Google Calendar Event ID yet
// (and writes the new id back), otherwise updates the existing event in place.
async function createOrUpdateCalendarEvent({ page, calendarId, summary, date }) {
  const event = {
    summary,
    start: { date },
    end:   { date },
  };

  const existingEventId = page.properties["Google Calendar Event ID"]?.rich_text?.[0]?.plain_text;
  const syncedAt = new Date().toISOString();

  if (existingEventId) {
    logger.info(`[notionCron] updating calendar event: ${summary}`);
    await updateEvent(calendarId, existingEventId, event);
    await updatePage(page.id, {
      "Google Calendar Last Sync": { date: { start: syncedAt } },
    });
    return;
  }

  logger.info(`[notionCron] creating calendar event: ${summary}`);
  const created = await createEvent(calendarId, event);
  await updatePage(page.id, {
    "Google Calendar Event ID":  { rich_text: [{ text: { content: created.id } }] },
    "Google Calendar Last Sync": { date: { start: syncedAt } },
  });
}

// Scenario 2a: recently created/edited Rollout Tasks get a matching Google
// Calendar event, keyed off the Artist relation to pick the right calendar.
async function syncTaskToCalendar(task) {
  const taskName = task.properties["Name"]?.formula?.string ?? getTitle(task, "Description");

  const artistId  = task.properties["Artist"]?.relation?.[0]?.id;
  const calendarId = ARTIST_CALENDAR_IDS[artistId];
  if (!calendarId) {
    logger.warn(`[notionCron] task "${taskName}" has no mapped artist calendar, skipping`);
    return;
  }

  const dueDate = task.properties["Due Date"]?.date?.start;
  if (!dueDate) {
    logger.warn(`[notionCron] task "${taskName}" has no Due Date, skipping calendar sync`);
    return;
  }

  const status  = task.properties["Status"]?.status?.name ?? "";
  const warning = status === "Overdue" ? "⚠️ " : "";
  const summary = `${warning}[${status}] Release:${taskName}`;

  await createOrUpdateCalendarEvent({ page: task, calendarId, summary, date: dueDate });
}

async function syncRolloutTasksToCalendar() {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();

  const recentTasks = await queryDatabase(ROLLOUT_TASKS_DATABASE_ID, {
    timestamp: "last_edited_time",
    last_edited_time: { on_or_after: since },
  });

  for (const task of recentTasks) {
    if (alreadySynced(task)) continue;
    try {
      await syncTaskToCalendar(task);
    } catch (err) {
      logger.error(`[notionCron] failed to sync task "${getTitle(task, "Description")}" to calendar:`, err.message);
    }
  }
}

// Scenario 2b: recently created/edited Rollouts get a matching all-day
// Google Calendar event on their Release Date.
async function syncRolloutToCalendar(rollout) {
  const releaseName = getTitle(rollout);

  const artistId    = rollout.properties["Artist"]?.rollup?.array?.[0]?.relation?.[0]?.id;
  const calendarId  = ARTIST_CALENDAR_IDS[artistId];
  if (!calendarId) {
    logger.warn(`[notionCron] rollout "${releaseName}" has no mapped artist calendar, skipping`);
    return;
  }

  const releaseDate = rollout.properties["Release Date"]?.rollup?.array?.[0]?.date?.start;
  if (!releaseDate) {
    logger.warn(`[notionCron] rollout "${releaseName}" has no Release Date, skipping calendar sync`);
    return;
  }

  const summary = `Release - ${releaseName}`;

  await createOrUpdateCalendarEvent({ page: rollout, calendarId, summary, date: releaseDate });
}

// Rollout Task titles are a formula sourced from their related Rollout's
// Name — renaming a Rollout recalculates that formula's *displayed* value on
// each task, but doesn't touch the task's own last_edited_time (Notion only
// bumps that for direct edits to the page itself). So syncRolloutTasksToCalendar's
// last_edited_time filter never picks these tasks up on its own, no matter how
// wide the lookback window is. Whenever a Rollout resyncs, force its related
// tasks to resync too, regardless of their own last_edited_time.
async function resyncTasksForRollout(rollout) {
  const relatedTasks = await queryDatabase(ROLLOUT_TASKS_DATABASE_ID, {
    property: "Rollout",
    relation: { contains: rollout.id },
  });

  for (const task of relatedTasks) {
    try {
      await syncTaskToCalendar(task);
    } catch (err) {
      logger.error(`[notionCron] failed to cascade-sync task "${getTitle(task, "Description")}" after rollout change:`, err.message);
    }
  }
}

async function syncRolloutsToCalendar() {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();

  const recentRollouts = await queryDatabase(ROLLOUTS_DATABASE_ID, {
    timestamp: "last_edited_time",
    last_edited_time: { on_or_after: since },
  });

  for (const rollout of recentRollouts) {
    try {
      // the rollout itself may already be in sync (its own calendar event
      // doesn't need touching), but its tasks' titles are formula-derived
      // from its Name and need cascading every time the rollout shows up
      // here — not just the one tick its own event actually changes.
      if (!alreadySynced(rollout)) {
        await syncRolloutToCalendar(rollout);
      }
      await resyncTasksForRollout(rollout);
    } catch (err) {
      logger.error(`[notionCron] failed to sync rollout "${getTitle(rollout)}" to calendar:`, err.message);
    }
  }
}

async function syncNotionTasks() {
  logger.info("[notionCron] starting sync...");

  await markOverdueRolloutTasks();
  await createMissingRollouts();
  await syncRolloutsToCalendar();
  await syncRolloutTasksToCalendar();

  logger.info("[notionCron] sync complete");
}

export function startNotionCron() {
  cron.schedule("* * * * *", async () => {
    try {
      await syncNotionTasks();
    } catch (err) {
      logger.error("[notionCron] sync failed:", err.message);
    }
  });

  logger.info("[notionCron] job registered (every minute)");
}
