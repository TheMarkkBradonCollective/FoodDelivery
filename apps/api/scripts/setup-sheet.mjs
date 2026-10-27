#!/usr/bin/env node
/**
 * Idempotent setup for the shared "TMBC Apps Database" spreadsheet.
 * Only touches tabs named "<TAB_PREFIX> - <table>" (default prefix "FoodDelivery"):
 *  - creates missing tabs sized to exactly their columns and ~100 rows
 *    (the file's 10M-cell limit is shared by every app; the API appends rows as needed);
 *  - fixes row-1 headers and widens a tab only if it has too few columns.
 * Run: npm run sheets:setup -w apps/api   (env from `vercel env pull apps/api/.env.local`)
 */
import { TABLES, tabName, rangeOf, tabPrefix } from "../src/lib/tables.mjs";
import { sheetsClient } from "./google.mjs";

const { sheets, spreadsheetId } = sheetsClient();
const meta = await sheets.spreadsheets.get({
  spreadsheetId,
  fields: "sheets.properties(sheetId,title,gridProperties)",
});
const byTitle = new Map((meta.data.sheets ?? []).map((s) => [s.properties.title, s.properties]));
console.log(`Prefix: "${tabPrefix()} - "`);

const requests = [];
for (const [table, cols] of Object.entries(TABLES)) {
  const title = tabName(table);
  const props = byTitle.get(title);
  if (!props) {
    requests.push({
      addSheet: {
        properties: { title, gridProperties: { rowCount: 100, columnCount: cols.length, frozenRowCount: 1 } },
      },
    });
    console.log(`create ${title} (${cols.length} cols x 100 rows)`);
  } else if ((props.gridProperties?.columnCount ?? 0) < cols.length) {
    requests.push({
      updateSheetProperties: {
        properties: { sheetId: props.sheetId, gridProperties: { columnCount: cols.length } },
        fields: "gridProperties.columnCount",
      },
    });
    console.log(`widen ${title} to ${cols.length} cols`);
  }
}
if (requests.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });

const tables = Object.keys(TABLES);
const current = await sheets.spreadsheets.values.batchGet({
  spreadsheetId,
  ranges: tables.map((t) => rangeOf(t, "1:1")),
});
const fixes = [];
tables.forEach((t, i) => {
  const cols = TABLES[t];
  const row = current.data.valueRanges?.[i]?.values?.[0] ?? [];
  if (!(row.length === cols.length && cols.every((c, j) => row[j] === c))) {
    fixes.push({ range: rangeOf(t, "1:1"), values: [cols] });
  }
});
if (fixes.length) {
  await sheets.spreadsheets.values.batchClear({ spreadsheetId, requestBody: { ranges: fixes.map((f) => f.range) } });
  await sheets.spreadsheets.values.batchUpdate({ spreadsheetId, requestBody: { valueInputOption: "RAW", data: fixes } });
  console.log(`headers fixed: ${fixes.length} tab(s)`);
} else {
  console.log("headers OK");
}
