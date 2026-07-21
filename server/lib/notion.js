// server/lib/notion.js
//
// Notion API 2025-09-03+ splits databases into "data sources" — querying
// happens against a data source, not the database itself, so we resolve
// and cache each database's default data source id on first use.

import { Client } from "@notionhq/client";
import { logger } from "./logger.js";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const dataSourceIdCache = new Map();

async function getDataSourceId(databaseId) {
  if (dataSourceIdCache.has(databaseId)) return dataSourceIdCache.get(databaseId);

  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = database.data_sources[0].id;
  dataSourceIdCache.set(databaseId, dataSourceId);
  return dataSourceId;
}

export async function queryDatabase(databaseId, filter, { pageSize } = {}) {
  logger.debug("[notion] querying database:", databaseId);
  const res = await notion.dataSources.query({
    data_source_id: await getDataSourceId(databaseId),
    ...(filter ? { filter } : {}),
    ...(pageSize ? { page_size: pageSize } : {}),
  });
  return res.results;
}

export async function createPage(databaseId, properties) {
  logger.debug("[notion] creating page in:", databaseId);
  return notion.pages.create({
    parent: { data_source_id: await getDataSourceId(databaseId) },
    properties,
  });
}

export async function updatePage(pageId, properties) {
  logger.debug("[notion] updating page:", pageId);
  return notion.pages.update({
    page_id: pageId,
    properties,
  });
}

export async function getPage(pageId) {
  logger.debug("[notion] fetching page:", pageId);
  return notion.pages.retrieve({ page_id: pageId });
}
