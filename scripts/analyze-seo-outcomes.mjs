import { existsSync, readFileSync, writeFileSync } from "node:fs";

const requiredGa4EventGroups = {
  engagement: ["page_engaged_time", "page_scroll_depth", "page_session_summary"],
  collectionPathClick: [
    "download_exam_collection_click",
    "free_exam_collection_click",
    "past_year_collection_click",
    "test_paper_collection_click",
    "top_school_collection_click",
    "revision_collection_click",
    "psle_collection_click",
    "related_collection_click",
    "viewer_collection_click",
    "empty_search_recovery_click",
  ],
  paperOpen: ["paper_view_click", "paper_open"],
  pdfPreview: ["paper_pdf_load"],
  download: ["paper_download", "file_download"],
};

const usage = `Usage:
  node scripts/analyze-seo-outcomes.mjs --gsc-before <csv> --gsc-after <csv> --ga4 <csv> [--out <md>]

Inputs:
  --gsc-before  Google Search Console Performance export for the baseline period.
  --gsc-after   Google Search Console Performance export for the comparison period.
  --ga4         GA4 event export filtered to Organic Search, or with source/medium columns.
  --out         Optional markdown report path. Defaults to stdout only.

Expected GSC columns include query, page, clicks, impressions, CTR, and average position.
Expected GA4 columns include event name, landing page, and event count, with optional source/medium, source, collection_title, school_name, and target_path.

Every GA4 outcome row must include relevant landing page values so the report proves organic users arrived through SEO entry pages.
Collection-path click evidence must include target_path values so the report proves organic users continued into specific paper collections.`;

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

const requireFile = (path, label) => {
  if (!path) fail(`Missing ${label}.`);
  if (!existsSync(path)) fail(`Missing ${label} file: ${path}`);
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeHeader = (value) =>
  normalize(value)
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizePath = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    return new URL(raw, "https://sgexamhub.com").pathname.replace(/\/$/, "") || "/";
  } catch {
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    return path.replace(/\/$/, "") || "/";
  }
};

const parseNumber = (value) => {
  const raw = String(value ?? "").replace(/[%,$,]/g, "").trim();
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseCtr = (value) => {
  const raw = String(value ?? "").trim();
  const parsed = parseNumber(raw);
  if (!parsed) return 0;
  return raw.includes("%") || parsed > 1 ? parsed / 100 : parsed;
};

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
  if (!rows.length) return [];

  const headerIndex = rows.findIndex((candidate) => {
    const normalized = candidate.map(normalizeHeader);
    return (
      normalized.some((header) => ["query", "top queries", "search query"].includes(header)) ||
      normalized.some((header) => ["event name", "event"].includes(header))
    );
  });
  if (headerIndex === -1) return [];

  const headers = rows[headerIndex].map(normalizeHeader);
  return rows.slice(headerIndex + 1).map((values) => {
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
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
  }
  return "";
};

const parseKeywordMap = () => {
  const markdown = readFileSync("SEO_KEYWORD_MAP.md", "utf8");
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.includes("---"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter(([query, page]) => query && page && query !== "Query cluster")
    .map(([query, page, intent, monitor]) => ({
      query,
      normalizedQuery: normalize(query),
      page: normalizePath(page.replace(/`/g, "")),
      intent,
      monitor,
    }));
};

const parseGscRows = (path) =>
  parseCsv(path)
    .map((record) => ({
      query: getField(record, ["query", "top queries", "search query"]),
      page: normalizePath(getField(record, ["page", "pages", "landing page", "url"])),
      clicks: parseNumber(getField(record, ["clicks"])),
      impressions: parseNumber(getField(record, ["impressions"])),
      ctr: parseCtr(getField(record, ["ctr", "average ctr"])),
      position: parseNumber(getField(record, ["position", "average position", "avg position"])),
    }))
    .filter((row) => row.query || row.page);

const rowMatchesCluster = (row, cluster) => {
  const query = normalize(row.query);
  const queryMatches =
    query === cluster.normalizedQuery ||
    query.includes(cluster.normalizedQuery) ||
    cluster.normalizedQuery.includes(query);
  const pageMatches = !row.page || row.page === cluster.page;
  return queryMatches && pageMatches;
};

const aggregateGsc = (rows, cluster) => {
  const matched = rows.filter((row) => rowMatchesCluster(row, cluster));
  const clicks = matched.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = matched.reduce((sum, row) => sum + row.impressions, 0);
  const weightedPositionNumerator = matched.reduce(
    (sum, row) => sum + row.position * Math.max(row.impressions, 1),
    0,
  );
  const weightedPositionDenominator = matched.reduce(
    (sum, row) => sum + Math.max(row.impressions, 1),
    0,
  );
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: weightedPositionDenominator
      ? weightedPositionNumerator / weightedPositionDenominator
      : 0,
    rows: matched.length,
  };
};

const analyzeGsc = (beforeRows, afterRows, clusters) =>
  clusters.map((cluster) => {
    const before = aggregateGsc(beforeRows, cluster);
    const after = aggregateGsc(afterRows, cluster);
    const clickDelta = after.clicks - before.clicks;
    const ctrDelta = after.ctr - before.ctr;
    const positionDelta = before.position && after.position ? before.position - after.position : 0;
    const clickThroughImproved = clickDelta > 0 || ctrDelta > 0.0001;
    const rankingImproved = positionDelta > 0.01;
    const improved = clickThroughImproved || rankingImproved;
    return {
      ...cluster,
      before,
      after,
      clickDelta,
      ctrDelta,
      positionDelta,
      clickThroughImproved,
      rankingImproved,
      improved,
    };
  });

const parseGa4Rows = (path) =>
  parseCsv(path)
    .map((record) => {
      const sourceMedium = getField(record, [
        "session source / medium",
        "source / medium",
        "session source medium",
        "first user source / medium",
      ]);
      return {
        eventName: getField(record, ["event name", "event"]),
        landingPage: normalizePath(getField(record, [
          "landing page",
          "landing page + query string",
          "page path",
          "page path and screen class",
        ])),
        sourceMedium,
        source: getField(record, ["source", "event source"]),
        collectionTitle: getField(record, ["collection title", "collection_title"]),
        schoolName: getField(record, ["school name", "school_name"]),
        targetPath: normalizePath(getField(record, ["target path", "target_path"])),
        count: parseNumber(getField(record, [
          "event count",
          "eventcount",
          "events",
          "count",
          "conversions",
        ])),
      };
    })
    .filter((row) => row.eventName);

const isOrganicRow = (row) => {
  if (!row.sourceMedium) return true;
  const source = normalize(row.sourceMedium);
  return (
    source.includes("google organic") ||
    source.includes("google / organic") ||
    source.includes("organic search")
  );
};

const broadSeoLandingPages = new Set([
  "/",
  "/download-exam-papers",
  "/free-exam-papers",
  "/past-year-exam-papers",
  "/test-papers",
  "/top-school-exam-papers",
]);

const isRelevantSeoLandingPage = (path) =>
  broadSeoLandingPages.has(path) || path.startsWith("/exam-papers") || path.startsWith("/view/");

const analyzeGa4 = (rows) => {
  const organicRows = rows.filter(isOrganicRow);
  const eventCounts = new Map();
  for (const row of organicRows) {
    eventCounts.set(row.eventName, (eventCounts.get(row.eventName) || 0) + row.count);
  }

  return Object.entries(requiredGa4EventGroups).map(([group, events]) => {
    const matchingRows = organicRows.filter((row) => events.includes(row.eventName));
    const count = events.reduce((sum, eventName) => sum + (eventCounts.get(eventName) || 0), 0);
    const landingPageRows = matchingRows.filter(
      (row) => row.count > 0 && isRelevantSeoLandingPage(row.landingPage),
    );
    const targetPathRows = matchingRows.filter((row) => row.count > 0 && row.targetPath);
    const targetPathRequired = group === "collectionPathClick";
    const landingPagePresent = landingPageRows.length > 0;
    const targetPathPresent = !targetPathRequired || targetPathRows.length > 0;
    return {
      group,
      events,
      count,
      landingPageRows: landingPageRows.length,
      landingPagePresent,
      targetPathRequired,
      targetPathRows: targetPathRows.length,
      targetPathPresent,
      passed: count > 0 && landingPagePresent && targetPathPresent,
    };
  });
};

const formatPercent = (value) => `${(value * 100).toFixed(2)}%`;
const formatDelta = (value) => (value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2));
const formatIntegerDelta = (value) => (value > 0 ? `+${value}` : String(value));

const buildReport = ({ gscResults, ga4Results }) => {
  const improvedClusters = gscResults.filter((result) => result.improved);
  const clickThroughImprovedClusters = gscResults.filter(
    (result) => result.clickThroughImproved,
  );
  const rankingOnlyClusters = gscResults.filter(
    (result) => result.rankingImproved && !result.clickThroughImproved,
  );
  const afterClusters = gscResults.filter((result) => result.after.rows > 0);
  const ga4Passed = ga4Results.every((result) => result.passed);
  const gscPassed = clickThroughImprovedClusters.length > 0;
  const complete = gscPassed && ga4Passed;

  const lines = [
    "# SEO Outcome Evidence Report",
    "",
    `Status: ${complete ? "PASS" : "INCOMPLETE"}`,
    "",
    "## Summary",
    "",
    `- GSC clusters with current-period data: ${afterClusters.length}/${gscResults.length}`,
    `- GSC clusters with click or CTR improvement: ${clickThroughImprovedClusters.length}/${gscResults.length}`,
    `- GSC clusters with ranking-only improvement: ${rankingOnlyClusters.length}/${gscResults.length}`,
    `- GSC clusters with any improvement: ${improvedClusters.length}/${gscResults.length}`,
    `- GA4 organic event groups present: ${ga4Results.filter((result) => result.passed).length}/${ga4Results.length}`,
    "",
    "## GSC Click, CTR, And Ranking Evidence",
    "",
    "| Query cluster | Preferred page | Clicks | CTR | Avg position | Status |",
    "| --- | --- | ---: | ---: | ---: | --- |",
  ];

  for (const result of gscResults
    .filter((item) => item.after.rows || item.before.rows || item.improved)
    .sort((a, b) => Math.abs(b.clickDelta) - Math.abs(a.clickDelta))
    .slice(0, 50)) {
    const status = result.clickThroughImproved
      ? "Click/CTR improved"
      : result.rankingImproved
        ? "Ranking improved only"
        : "No improvement yet";
    lines.push(
      `| ${result.query} | ${result.page} | ${result.before.clicks} -> ${result.after.clicks} (${formatIntegerDelta(result.clickDelta)}) | ${formatPercent(result.before.ctr)} -> ${formatPercent(result.after.ctr)} (${formatPercent(result.ctrDelta)}) | ${result.before.position.toFixed(2)} -> ${result.after.position.toFixed(2)} (${formatDelta(result.positionDelta)}) | ${status} |`,
    );
  }

  if (!afterClusters.length) {
    lines.push("| No matching GSC rows found |  |  |  |  | Export GSC data with query and page columns |");
  }

  lines.push(
    "",
    "## GA4 Organic Engagement And Conversion Evidence",
    "",
    "| Requirement | Accepted events | Organic event count | Dimension evidence | Status |",
    "| --- | --- | ---: | --- | --- |",
  );

  for (const result of ga4Results) {
    const dimensionEvidence = [
      result.landingPageRows > 0
        ? `${result.landingPageRows} row(s) with relevant landing page`
        : "Missing relevant landing page",
      result.targetPathRequired
        ? result.targetPathRows > 0
          ? `${result.targetPathRows} row(s) with target_path`
          : "Missing target_path"
        : "target_path not required",
    ].join("; ");
    lines.push(
      `| ${result.group} | ${result.events.join(", ")} | ${result.count} | ${dimensionEvidence} | ${result.passed ? "Present" : "Missing"} |`,
    );
  }

  lines.push(
    "",
    "## Completion Interpretation",
    "",
    complete
      ? "The supplied exports show improved GSC acquisition plus GA4 organic landing-page engagement, collection-path clicks, paper-open behavior, PDF previews, and downloads."
      : "The supplied exports do not yet prove the SEO goal. Keep the goal open until GSC shows improved clicks or CTR, and GA4 shows organic landing-page engagement, collection-path clicks, paper opens, PDF previews, and downloads.",
  );

  return {
    complete,
    text: `${lines.join("\n")}\n`,
  };
};

const options = parseArgs();
requireFile(options["gsc-before"], "--gsc-before");
requireFile(options["gsc-after"], "--gsc-after");
requireFile(options.ga4, "--ga4");

const clusters = parseKeywordMap();
const gscResults = analyzeGsc(
  parseGscRows(options["gsc-before"]),
  parseGscRows(options["gsc-after"]),
  clusters,
);
const ga4Results = analyzeGa4(parseGa4Rows(options.ga4));
const report = buildReport({ gscResults, ga4Results });

if (options.out) {
  writeFileSync(options.out, report.text);
  console.log(`Wrote SEO outcome report to ${options.out}`);
} else {
  process.stdout.write(report.text);
}

if (!report.complete) process.exit(2);
