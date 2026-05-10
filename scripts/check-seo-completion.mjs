import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const defaultOutputPath = "reports/seo/seo-completion-check.md";

const usage = `Usage:
  node scripts/check-seo-completion.mjs [--out <md>]

Runs the final SEO objective checks:
  1. GSC URL Inspection tracker has every priority URL marked Complete.
  2. Public Google snippet tracker has every query marked Fresh.
  3. Real GSC and GA4 exports prove organic acquisition, collection-path clicks, engagement, paper opens, PDF previews, and downloads.`;

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

const runCheck = ({ label, command, args }) => {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    label,
    commandLine: [command, ...args].join(" "),
    status: result.status === 0 ? "PASS" : "INCOMPLETE",
    exitCode: result.status ?? 1,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
};

const options = parseArgs();
const outputPath = options.out || defaultOutputPath;

const checks = [
  runCheck({
    label: "GSC URL Inspection requests",
    command: "npm",
    args: ["run", "seo:reindex-status", "--", "--fail-on-pending"],
  }),
  runCheck({
    label: "Public Google snippet freshness",
    command: "npm",
    args: ["run", "seo:snippet-status", "--", "--fail-on-stale"],
  }),
  runCheck({
    label: "GSC and GA4 organic outcome evidence",
    command: "npm",
    args: [
      "run",
      "seo:outcomes",
      "--",
      "--gsc-before",
      "reports/seo/gsc-before.csv",
      "--gsc-after",
      "reports/seo/gsc-after.csv",
      "--ga4",
      "reports/seo/ga4-organic-events.csv",
      "--out",
      "reports/seo/outcome-report.md",
    ],
  }),
];

const complete = checks.every((check) => check.status === "PASS");
const lines = [
  "# SEO Completion Check",
  "",
  `Status: ${complete ? "PASS" : "INCOMPLETE"}`,
  "",
  "## Objective",
  "",
  "Improve website visibility, SEO, keywords, search ranking, Google click-through, on-site engagement, exam-paper opens, and PDF downloads.",
  "",
  "## Required Evidence",
  "",
  "- GSC URL Inspection requests are complete for priority pages.",
  "- Public Google snippets are fresh and no longer show stale counts, casing, or noisy paper-list snippets.",
  "- GSC exports show improved organic clicks, CTR, impressions, or ranking for target keyword clusters.",
  "- GA4 organic exports show collection-path clicks, engagement, paper opens, PDF previews, and PDF downloads.",
  "",
  "## Checks",
  "",
  "| Check | Command | Status | Exit code |",
  "| --- | --- | --- | ---: |",
  ...checks.map(
    (check) =>
      `| ${check.label} | \`${check.commandLine}\` | ${check.status} | ${check.exitCode} |`,
  ),
  "",
  "## Details",
  "",
  ...checks.flatMap((check) => [
    `### ${check.label}`,
    "",
    `Command: \`${check.commandLine}\``,
    "",
    check.stdout ? "Stdout:" : "Stdout: _(none)_",
    ...(check.stdout ? ["", "```text", check.stdout, "```"] : []),
    "",
    check.stderr ? "Stderr:" : "Stderr: _(none)_",
    ...(check.stderr ? ["", "```text", check.stderr, "```"] : []),
    "",
  ]),
  "## Completion Rule",
  "",
  complete
    ? "All required SEO completion evidence is present."
    : "Do not mark the SEO objective complete until this command reports PASS.",
  "",
];

mkdirSync(outputPath.split("/").slice(0, -1).join("/") || ".", { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${outputPath}`);
console.log(`SEO completion check: ${complete ? "PASS" : "INCOMPLETE"}`);

if (options.help) {
  console.log(usage);
}

if (!complete) process.exit(1);
