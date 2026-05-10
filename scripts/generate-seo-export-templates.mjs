import { mkdirSync, writeFileSync } from "node:fs";

const outputDirectory = "reports/seo";

const gscHeader = "Query,Page,Clicks,Impressions,CTR,Position\n";
const ga4Header = "Event name,Landing page,Session source / medium,Event count\n";

const checklist = [
  "# SEO Outcome Export Templates",
  "",
  "Use these templates when exporting the real GSC and GA4 evidence required to close the SEO objective.",
  "",
  "## Files",
  "",
  "- `reports/seo/gsc-before-template.csv`: copy this shape for the baseline GSC Performance export.",
  "- `reports/seo/gsc-after-template.csv`: copy this shape for the comparison GSC Performance export.",
  "- `reports/seo/ga4-organic-events-template.csv`: copy this shape for the GA4 organic event export.",
  "",
  "## Required GSC Export Shape",
  "",
  "Export Search Console Performance data with these columns:",
  "",
  "- Query",
  "- Page",
  "- Clicks",
  "- Impressions",
  "- CTR",
  "- Position",
  "",
  "Use a baseline period before the latest SEO deployment and a matching comparison period after Google has recrawled the priority URLs.",
  "",
  "## Required GA4 Export Shape",
  "",
  "Export GA4 events filtered to Organic Search, or include `Session source / medium` so the analyzer can isolate `google / organic` rows.",
  "",
  "Required event names:",
  "",
  "- page_engaged_time",
  "- page_scroll_depth",
  "- page_session_summary",
  "- paper_search",
  "- search",
  "- paper_view_click",
  "- paper_open",
  "- paper_pdf_load",
  "- paper_download",
  "- file_download",
  "",
  "## Analyzer Command",
  "",
  "Save the real exports as:",
  "",
  "- `reports/seo/gsc-before.csv`",
  "- `reports/seo/gsc-after.csv`",
  "- `reports/seo/ga4-organic-events.csv`",
  "",
  "Then run:",
  "",
  "```sh",
  "npm run seo:outcomes -- \\",
  "  --gsc-before reports/seo/gsc-before.csv \\",
  "  --gsc-after reports/seo/gsc-after.csv \\",
  "  --ga4 reports/seo/ga4-organic-events.csv \\",
  "  --out reports/seo/outcome-report.md",
  "```",
  "",
  "The SEO objective remains incomplete until this command passes on real exported data and public Google snippets have refreshed.",
  "",
];

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(`${outputDirectory}/gsc-before-template.csv`, gscHeader);
writeFileSync(`${outputDirectory}/gsc-after-template.csv`, gscHeader);
writeFileSync(`${outputDirectory}/ga4-organic-events-template.csv`, ga4Header);
writeFileSync(`${outputDirectory}/outcome-export-checklist.md`, `${checklist.join("\n")}\n`);
console.log("Wrote SEO outcome export templates.");
