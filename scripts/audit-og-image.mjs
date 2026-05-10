import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const svgPath = "public/og-image.svg";
const pngPath = "public/og-image.png";
const manifestPath = "public/og-image.manifest.json";
const expectedWidth = 1200;
const expectedHeight = 630;
const requiredSvgSnippets = [
  "SG Exam Hub",
  "2,299 PDF papers",
  "Free download",
];
const forbiddenSvgSnippets = [
  "2,200+",
  "2,300+",
  "totalPaperCountRounded",
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

const readPngDimensions = (path) => {
  const png = readFileSync(path);
  const signature = png.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    fail(`${path} is not a PNG file.`);
    return { width: 0, height: 0 };
  }
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
};

for (const path of [svgPath, pngPath, manifestPath]) {
  if (!existsSync(path)) fail(`Missing OG image audit target: ${path}`);
}

if (!process.exitCode) {
  const svg = readFileSync(svgPath, "utf8");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const dimensions = readPngDimensions(pngPath);

  for (const snippet of requiredSvgSnippets) {
    if (!svg.includes(snippet)) fail(`${svgPath} is missing required social preview copy: ${snippet}`);
  }

  for (const snippet of forbiddenSvgSnippets) {
    if (svg.includes(snippet)) fail(`${svgPath} contains stale social preview copy: ${snippet}`);
  }

  if (manifest.source !== svgPath) fail(`${manifestPath} points to ${manifest.source}; expected ${svgPath}.`);
  if (manifest.output !== pngPath) fail(`${manifestPath} points to ${manifest.output}; expected ${pngPath}.`);
  if (manifest.width !== expectedWidth || manifest.height !== expectedHeight) {
    fail(`${manifestPath} declares ${manifest.width}x${manifest.height}; expected ${expectedWidth}x${expectedHeight}.`);
  }
  if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
    fail(`${pngPath} is ${dimensions.width}x${dimensions.height}; expected ${expectedWidth}x${expectedHeight}.`);
  }
  if (manifest.svgSha256 !== sha256(svgPath)) {
    fail(`${svgPath} changed without regenerating ${pngPath}. Run npm run seo:og-image.`);
  }
  if (manifest.pngSha256 !== sha256(pngPath)) {
    fail(`${pngPath} changed without updating ${manifestPath}. Run npm run seo:og-image.`);
  }
}

if (process.exitCode) process.exit();
console.log("OG image audit passed.");
