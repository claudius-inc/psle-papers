import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const root = ".output/public";
const siteUrl = "https://sgexamhub.com";
const keywordMapPath = "SEO_KEYWORD_MAP.md";
const csvOut = "reports/seo/keyword-landing-page-audit.csv";
const mdOut = "reports/seo/keyword-landing-page-audit.md";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const readText = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");

const decodeHtml = (value) =>
  value
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

const stripTags = (value) => value.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");

const normalizeText = (value) =>
  decodeHtml(value)
    .toLowerCase()
    .replace(/\bsgexamhub\b/g, "sg exam hub")
    .replace(/\bp([2-6])\b/g, "primary $1")
    .replace(/\bmath(?:s|ematics)?\b/g, "math")
    .replace(/\bpdfs\b/g, "pdf")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const keywordTokens = (query) => {
  const tokens = normalizeText(query).split(" ").filter(Boolean);
  return [...new Set(tokens.filter((token) => token.length > 1 || /^\d$/.test(token)))];
};

const csvEscape = (value) => {
  const stringValue = String(value ?? "");
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

const pageFileForPath = (path) => {
  if (path === "/") return join(root, "index.html");
  return join(root, path.replace(/^\//, ""), "index.html");
};

const walkHtml = (dir) => {
  const htmlFiles = [];
  const walk = (currentDir) => {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.name === "index.html") htmlFiles.push(fullPath);
    }
  };
  walk(dir);
  return htmlFiles;
};

const parseKeywordMapRows = () => {
  const keywordMap = readText(keywordMapPath);
  const rows = [];
  for (const line of keywordMap.split("\n")) {
    if (!line.startsWith("|")) continue;
    if (line.includes("| ---")) continue;
    if (line.includes("Query cluster")) continue;

    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length < 4) continue;

    const [query, rawPath, intent, monitor] = cells;
    const path = rawPath.match(/`([^`]+)`/)?.[1];
    if (!query || !path || !path.startsWith("/")) continue;
    rows.push({ query, path, intent, monitor });
  }
  return rows;
};

if (!existsSync(root)) {
  fail(`Missing ${root}. Run npm run generate before npm run seo:keyword-coverage.`);
  process.exit();
}

const sitemap = readText("public/sitemap.xml");
const keywordRows = parseKeywordMapRows();
const htmlFiles = walkHtml(root);
const generatedHtml = htmlFiles
  .map((file) => ({
    file,
    routePath:
      relative(root, file) === "index.html"
        ? "/"
        : `/${relative(root, file).replace(/\/index\.html$/, "")}`,
    html: readText(file),
  }));
const allHtml = generatedHtml.map((page) => page.html).join("\n");
const reportRows = [];

if (!keywordRows.length) fail("No keyword-map rows found.");

for (const row of keywordRows) {
  const file = pageFileForPath(row.path);
  const html = readText(file);
  const pageExists = Boolean(html);
  const title = pageExists ? decodeHtml(html.match(/<title>([^<]*)<\/title>/)?.[1] || "") : "";
  const description = pageExists
    ? decodeHtml(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "")
    : "";
  const canonical = pageExists
    ? decodeHtml(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "")
    : "";
  const canonicalUrl = `${siteUrl}${row.path === "/" ? "/" : row.path}`;
  const sitemapUrl = `${siteUrl}${row.path === "/" ? "/" : row.path}`;
  const inSitemap = sitemap.includes(`<loc>${sitemapUrl}</loc>`);
  const internallyLinked =
    row.path === "/" ||
    allHtml.includes(`href="${row.path}"`) ||
    allHtml.includes(`href="${row.path}/"`);
  const normalizedPageText = normalizeText(`${title} ${description} ${stripTags(html)}`);
  const missingTokens = pageExists
    ? keywordTokens(row.query).filter((token) => !normalizedPageText.includes(token))
    : keywordTokens(row.query);
  const status =
    pageExists &&
    inSitemap &&
    canonical === canonicalUrl &&
    internallyLinked &&
    missingTokens.length === 0
      ? "PASS"
      : "FAIL";

  if (status === "FAIL") {
    fail(
      `Keyword coverage failed for "${row.query}" -> ${row.path}: ${[
        pageExists ? "" : "missing generated page",
        inSitemap ? "" : "missing sitemap URL",
        canonical === canonicalUrl ? "" : `canonical mismatch (${canonical || "missing"})`,
        internallyLinked ? "" : "missing internal link",
        missingTokens.length ? `missing query terms: ${missingTokens.join(" ")}` : "",
      ]
        .filter(Boolean)
        .join("; ")}`,
    );
  }

  reportRows.push({
    query: row.query,
    path: row.path,
    status,
    title,
    description,
    inSitemap: inSitemap ? "yes" : "no",
    internallyLinked: internallyLinked ? "yes" : "no",
    missingQueryTerms: missingTokens.join(" "),
    intent: row.intent,
    monitor: row.monitor,
  });
}

mkdirSync(dirname(csvOut), { recursive: true });
const csvHeader = [
  "Query cluster",
  "Preferred landing page",
  "Status",
  "Title",
  "Description",
  "In sitemap",
  "Internally linked",
  "Missing query terms",
  "Search intent",
  "What to monitor",
];
const csvRows = reportRows.map((row) =>
  [
    row.query,
    row.path,
    row.status,
    row.title,
    row.description,
    row.inSitemap,
    row.internallyLinked,
    row.missingQueryTerms,
    row.intent,
    row.monitor,
  ]
    .map(csvEscape)
    .join(","),
);
writeFileSync(csvOut, `${csvHeader.join(",")}\n${csvRows.join("\n")}\n`);

const passCount = reportRows.filter((row) => row.status === "PASS").length;
const failCount = reportRows.length - passCount;
const mdRows = reportRows
  .map(
    (row) =>
      `| ${row.query} | \`${row.path}\` | ${row.status} | ${row.inSitemap} | ${row.internallyLinked} | ${row.missingQueryTerms || "-"} |`,
  )
  .join("\n");
writeFileSync(
  mdOut,
  `# Keyword Landing Page Audit\n\nGenerated from \`${keywordMapPath}\` against \`${root}\`.\n\n- Query clusters checked: ${reportRows.length}\n- Passing clusters: ${passCount}\n- Failing clusters: ${failCount}\n\n| Query cluster | Preferred landing page | Status | In sitemap | Internally linked | Missing query terms |\n| --- | --- | --- | --- | --- | --- |\n${mdRows}\n`,
);

console.log(`Keyword landing page audit checked ${reportRows.length} query clusters.`);
console.log(`Wrote ${csvOut}`);
console.log(`Wrote ${mdOut}`);

if (process.exitCode) process.exit();
