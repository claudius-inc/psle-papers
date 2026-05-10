import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const defaultTrackerPath = "reports/seo/gsc-url-inspection-tracker.csv";
const defaultOutputPath = "reports/seo/gsc-url-inspection-status.md";

const usage = `Usage:
  node scripts/analyze-gsc-reindex-tracker.mjs [--tracker <csv>] [--out <md>] [--fail-on-pending]

Inputs:
  --tracker          GSC URL Inspection tracker CSV. Defaults to ${defaultTrackerPath}.
  --out              Markdown status report path. Defaults to ${defaultOutputPath}.
  --fail-on-pending  Exit non-zero if any priority URL is not completed.`;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }
  return options;
};

const fail = (message) => {
  console.error(message);
  console.error("");
  console.error(usage);
  process.exit(1);
};

const normalizeHeader = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseCsv = (path) => {
  const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
};

const getField = (record, aliases) => {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key].trim();
  }
  return "";
};

const statusBucket = (row) => {
  const status = getField(row, ["Status"]).toLowerCase();
  const liveTest = getField(row, ["GSC live test result"]);
  const requestedAt = getField(row, ["Indexing requested at"]);
  const recheckedAt = getField(row, ["Google result rechecked at"]);

  if (["complete", "completed", "done", "refreshed"].includes(status)) return "complete";
  if (recheckedAt && requestedAt) return "recheck-recorded";
  if (requestedAt) return "requested";
  if (liveTest) return "live-tested";
  return "pending";
};

const options = parseArgs();
const trackerPath = options.tracker || defaultTrackerPath;
const outputPath = options.out || defaultOutputPath;

if (!existsSync(trackerPath)) fail(`Missing tracker file: ${trackerPath}`);

const rows = parseCsv(trackerPath).map((row) => ({
  priority: getField(row, ["Priority"]),
  url: getField(row, ["URL"]),
  liveTest: getField(row, ["GSC live test result"]),
  indexingRequestedAt: getField(row, ["Indexing requested at"]),
  googleResultRecheckedAt: getField(row, ["Google result rechecked at"]),
  status: getField(row, ["Status"]) || "Pending",
  notes: getField(row, ["Notes"]),
  bucket: statusBucket(row),
}));

if (!rows.length) fail(`No URL Inspection rows found in ${trackerPath}`);
if (rows.some((row) => !row.priority || !row.url)) {
  fail(`${trackerPath} must include Priority and URL values for every row.`);
}

const counts = rows.reduce(
  (summary, row) => {
    summary[row.bucket] = (summary[row.bucket] || 0) + 1;
    return summary;
  },
  {
    pending: 0,
    "live-tested": 0,
    requested: 0,
    "recheck-recorded": 0,
    complete: 0,
  },
);

const incompleteRows = rows.filter((row) => row.bucket !== "complete");
const report = [
  "# GSC URL Inspection Status",
  "",
  `Tracker: \`${trackerPath}\``,
  "",
  "## Summary",
  "",
  `- Total priority URLs: ${rows.length}`,
  `- Complete: ${counts.complete}`,
  `- Recheck recorded: ${counts["recheck-recorded"]}`,
  `- Indexing requested: ${counts.requested}`,
  `- Live tested only: ${counts["live-tested"]}`,
  `- Pending: ${counts.pending}`,
  "",
  "## Completion Rule",
  "",
  "The SEO objective remains incomplete until every priority URL is marked `Complete` after GSC URL Inspection, sitemap resubmission, and public Google result rechecks.",
  "",
  "## Incomplete URLs",
  "",
  incompleteRows.length
    ? "| Priority | URL | Status | Requested | Rechecked | Notes |\n| --- | --- | --- | --- | --- | --- |"
    : "All priority URLs are marked complete.",
  ...incompleteRows.map(
    (row) =>
      `| ${row.priority} | ${row.url} | ${row.status || row.bucket} | ${
        row.indexingRequestedAt || "-"
      } | ${row.googleResultRecheckedAt || "-"} | ${row.notes || "-"} |`,
  ),
  "",
];

mkdirSync(outputPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
writeFileSync(outputPath, `${report.join("\n")}\n`);
console.log(`Wrote ${outputPath}`);
console.log(
  `GSC URL Inspection status: ${counts.complete}/${rows.length} complete, ${incompleteRows.length} incomplete.`,
);

if (options["fail-on-pending"] && incompleteRows.length) {
  process.exit(1);
}
