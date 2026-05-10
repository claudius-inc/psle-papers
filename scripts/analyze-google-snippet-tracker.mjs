import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const defaultTrackerPath = "reports/seo/google-snippet-recheck-tracker.csv";
const defaultOutputPath = "reports/seo/google-snippet-recheck-status.md";

const usage = `Usage:
  node scripts/analyze-google-snippet-tracker.mjs [--tracker <csv>] [--out <md>] [--fail-on-stale]

Inputs:
  --tracker        Public Google snippet recheck CSV. Defaults to ${defaultTrackerPath}.
  --out            Markdown status report path. Defaults to ${defaultOutputPath}.
  --fail-on-stale  Exit non-zero if any query is pending, stale, or not marked fresh.`;

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

const isAffirmative = (value) => ["yes", "y", "true", "1", "stale"].includes(value.toLowerCase());
const isNegative = (value) => ["no", "n", "false", "0", "fresh"].includes(value.toLowerCase());

const statusBucket = (row) => {
  const status = getField(row, ["Status"]).toLowerCase();
  const staleValue = getField(row, ["Stale snippet found"]);
  const checkedAt = getField(row, ["Checked at"]);

  if (["fresh", "complete", "completed", "passed"].includes(status) || isNegative(staleValue)) {
    return "fresh";
  }
  if (["stale", "failed", "blocked"].includes(status) || isAffirmative(staleValue)) {
    return "stale";
  }
  if (checkedAt) return "checked-needs-status";
  return "pending";
};

const options = parseArgs();
const trackerPath = options.tracker || defaultTrackerPath;
const outputPath = options.out || defaultOutputPath;

if (!existsSync(trackerPath)) fail(`Missing snippet tracker file: ${trackerPath}`);

const rows = parseCsv(trackerPath).map((row) => ({
  query: getField(row, ["Query"]),
  googleSearchUrl: getField(row, ["Google search URL"]),
  checkedAt: getField(row, ["Checked at"]),
  staleSnippetFound: getField(row, ["Stale snippet found"]),
  status: getField(row, ["Status"]) || "Pending",
  notes: getField(row, ["Notes"]),
  bucket: statusBucket(row),
}));

if (!rows.length) fail(`No Google snippet recheck rows found in ${trackerPath}`);
if (rows.some((row) => !row.query || !row.googleSearchUrl)) {
  fail(`${trackerPath} must include Query and Google search URL values for every row.`);
}

const counts = rows.reduce(
  (summary, row) => {
    summary[row.bucket] = (summary[row.bucket] || 0) + 1;
    return summary;
  },
  {
    fresh: 0,
    stale: 0,
    "checked-needs-status": 0,
    pending: 0,
  },
);

const incompleteRows = rows.filter((row) => row.bucket !== "fresh");
const report = [
  "# Google Snippet Recheck Status",
  "",
  `Tracker: \`${trackerPath}\``,
  "",
  "## Summary",
  "",
  `- Total recheck queries: ${rows.length}`,
  `- Fresh: ${counts.fresh}`,
  `- Stale: ${counts.stale}`,
  `- Checked without final status: ${counts["checked-needs-status"]}`,
  `- Pending: ${counts.pending}`,
  "",
  "## Completion Rule",
  "",
  "The SEO objective remains incomplete until every public Google recheck query is marked `Fresh` with no stale count text, stale school casing, or noisy paper-list snippets.",
  "",
  "## Incomplete Queries",
  "",
  incompleteRows.length
    ? "| Query | Google URL | Status | Checked | Notes |\n| --- | --- | --- | --- | --- |"
    : "All public Google snippet rechecks are marked fresh.",
  ...incompleteRows.map(
    (row) =>
      `| ${row.query} | ${row.googleSearchUrl} | ${row.status || row.bucket} | ${
        row.checkedAt || "-"
      } | ${row.notes || "-"} |`,
  ),
  "",
];

mkdirSync(outputPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
writeFileSync(outputPath, `${report.join("\n")}\n`);
console.log(`Wrote ${outputPath}`);
console.log(
  `Google snippet recheck status: ${counts.fresh}/${rows.length} fresh, ${incompleteRows.length} incomplete.`,
);

if (options["fail-on-stale"] && incompleteRows.length) {
  process.exit(1);
}
