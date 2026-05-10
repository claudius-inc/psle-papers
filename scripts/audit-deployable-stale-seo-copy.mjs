import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const roots = ["app", "public", ".output/public"];
const reportPath = "reports/seo/deployable-stale-seo-copy-audit.md";

const staleSnippets = [
  "2,200+Papers",
  "2,200+ Papers",
  "2,300+Papers",
  "2,300+ Papers",
  "Anglo chinese School",
  "Anglo chinese School (primary)",
  "Anglo chinese School (junior)",
  "Methodist Girls' School (primary)",
  "Chij (katong) Primary",
  "Chij (",
  "Methodist Girls' School (Primary)P6",
];

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".vue",
  ".xml",
]);

const extensionOf = (path) => {
  const filename = path.split("/").at(-1) || "";
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex) : "";
};

const shouldReadFile = (path) => {
  if (path.endsWith(".map")) return false;
  if (path.includes("/files/") && path.endsWith(".pdf")) return false;
  return textExtensions.has(extensionOf(path));
};

const walk = (root) => {
  const files = [];
  if (!existsSync(root)) return files;

  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (shouldReadFile(fullPath)) {
        files.push(fullPath);
      }
    }
  };

  visit(root);
  return files;
};

const failures = [];
const checkedFiles = roots.flatMap(walk);

for (const file of checkedFiles) {
  const content = readFileSync(file, "utf8");
  for (const snippet of staleSnippets) {
    if (content.includes(snippet)) {
      failures.push({ file, snippet });
    }
  }
}

mkdirSync(dirname(reportPath), { recursive: true });
const report = [
  "# Deployable Stale SEO Copy Audit",
  "",
  "Checks deployable source and generated output for exact stale snippets that are still visible in public Google results.",
  "",
  `- Roots checked: ${roots.map((root) => `\`${root}\``).join(", ")}`,
  `- Files checked: ${checkedFiles.length}`,
  `- Stale snippets checked: ${staleSnippets.length}`,
  `- Failures: ${failures.length}`,
  "",
  failures.length
    ? "| File | Stale snippet |\n| --- | --- |\n" +
      failures
        .map(
          (failure) =>
            `| \`${relative(".", failure.file)}\` | \`${failure.snippet.replace(/`/g, "\\`")}\` |`,
        )
        .join("\n")
    : "No deployable source or generated output contains the tracked stale SEO snippets.",
  "",
];

writeFileSync(reportPath, `${report.join("\n")}\n`);
console.log(`Deployable stale SEO copy audit checked ${checkedFiles.length} files.`);
console.log(`Wrote ${reportPath}`);

if (failures.length) {
  for (const failure of failures) {
    console.error(`${relative(".", failure.file)} contains stale snippet: ${failure.snippet}`);
  }
  process.exit(1);
}
