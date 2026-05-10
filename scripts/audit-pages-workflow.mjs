import { existsSync, readFileSync } from "node:fs";

const workflowPath = ".github/workflows/nuxtjs.yml";
const packagePath = "package.json";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const readRequiredFile = (path) => {
  if (!existsSync(path)) {
    fail(`Missing required file: ${path}`);
    process.exit();
  }
  return readFileSync(path, "utf8");
};

const assertIncludes = (content, snippets, messagePrefix) => {
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      fail(`${messagePrefix}: ${snippet}`);
    }
  }
};

const workflow = readRequiredFile(workflowPath);
const packageJson = JSON.parse(readRequiredFile(packagePath));
const scripts = packageJson.scripts || {};

const requiredWorkflowSnippets = [
  "workflow_dispatch:",
  "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true",
  'node-version: "24"',
  "actions/checkout@v6",
  "fetch-depth: 1",
  "filter: blob:none",
  "!/public/files/",
  "sparse-checkout-cone-mode: false",
  "actions/setup-node@v6",
  "actions/configure-pages@v6",
  'group: "pages"',
  "cancel-in-progress: true",
  "run generate",
  "run seo:audit",
  "Remove PDFs from Pages artifact",
  "rm -rf ./.output/public/files",
  "actions/upload-pages-artifact@v5",
  "actions/deploy-pages@v5",
  "Wait for Pages edge cache",
  "npm run seo:audit:live",
];

assertIncludes(
  workflow,
  requiredWorkflowSnippets,
  "Pages workflow is missing required SEO deployment gate",
);

for (const staleSnippet of [
  "actions/checkout@v5",
  "fetch-depth: 0",
  "cancel-in-progress: false",
]) {
  if (workflow.includes(staleSnippet)) {
    fail(`Pages workflow contains stale deployment setting: ${staleSnippet}`);
  }
}

const requiredGenerateSnippets = [
  "node scripts/ensure-viewer-school-seo.mjs",
  "node scripts/ensure-snippet-focused-ui.mjs",
  "npm run seo:sitemap",
  "nuxt generate",
];

assertIncludes(
  scripts.generate || "",
  requiredGenerateSnippets,
  "generate script is missing required SEO preparation step",
);

const requiredLocalAuditSnippets = [
  "node scripts/audit-domain-consistency.mjs",
  "node scripts/audit-pages-workflow.mjs",
  "node scripts/audit-conversion-analytics.mjs",
  "node scripts/audit-school-name-quality.mjs",
  "node scripts/audit-snippet-focused-ui.mjs",
  "node scripts/audit-seo-output.mjs",
  "node scripts/audit-top-school-funnel.mjs",
  "node scripts/audit-free-exam-funnel.mjs",
  "node scripts/audit-broad-landing-funnels.mjs",
  "node scripts/audit-sitemap-priority-schools.mjs",
];

assertIncludes(
  scripts["seo:audit"] || "",
  requiredLocalAuditSnippets,
  "seo:audit script is missing required local SEO gate",
);

const requiredLiveAuditSnippets = [
  "node scripts/audit-live-seo.mjs",
  "node scripts/audit-live-school-name-quality.mjs",
  "node scripts/audit-live-snippet-focused-ui.mjs",
  "node scripts/audit-live-top-school-funnel.mjs",
  "node scripts/audit-live-free-exam-funnel.mjs",
  "node scripts/audit-live-broad-landing-funnels.mjs",
  "node scripts/audit-live-sitemap-priority-schools.mjs",
];

assertIncludes(
  scripts["seo:audit:live"] || "",
  requiredLiveAuditSnippets,
  "seo:audit:live script is missing required live SEO gate",
);

const deployIndex = workflow.indexOf("actions/deploy-pages@v5");
const liveAuditIndex = workflow.indexOf("npm run seo:audit:live");
if (deployIndex === -1 || liveAuditIndex === -1 || liveAuditIndex < deployIndex) {
  fail("Pages workflow must run the live SEO audit after deploy-pages completes.");
}

if (process.exitCode) process.exit();
console.log("Pages workflow SEO gate audit passed.");
