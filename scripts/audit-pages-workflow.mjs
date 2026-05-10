import { existsSync, readFileSync } from "node:fs";

const workflowPath = ".github/workflows/nuxtjs.yml";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

if (!existsSync(workflowPath)) {
  fail(`Missing Pages workflow: ${workflowPath}`);
  process.exit();
}

const workflow = readFileSync(workflowPath, "utf8");

const requiredSnippets = [
  "workflow_dispatch:",
  "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true",
  'node-version: "24"',
  "actions/checkout@v5",
  "actions/setup-node@v6",
  "actions/configure-pages@v6",
  "npm run generate",
  "npm run seo:audit",
  "Remove PDFs from Pages artifact",
  "rm -rf ./.output/public/files",
  "actions/upload-pages-artifact@v5",
  "actions/deploy-pages@v5",
  "Wait for Pages edge cache",
  "npm run seo:audit:live",
];

for (const snippet of requiredSnippets) {
  if (!workflow.includes(snippet)) {
    fail(`Pages workflow is missing required SEO deployment gate: ${snippet}`);
  }
}

const deployIndex = workflow.indexOf("actions/deploy-pages@v5");
const liveAuditIndex = workflow.indexOf("npm run seo:audit:live");
if (deployIndex === -1 || liveAuditIndex === -1 || liveAuditIndex < deployIndex) {
  fail("Pages workflow must run the live SEO audit after deploy-pages completes.");
}

if (process.exitCode) process.exit();
console.log("Pages workflow SEO gate audit passed.");
