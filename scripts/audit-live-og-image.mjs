import { createHash } from "node:crypto";

const siteUrl = "https://sgexamhub.com";
const manifestPath = "/og-image.manifest.json";
const pngPath = "/og-image.png";
const expectedWidth = 1200;
const expectedHeight = 630;

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const fetchBuffer = async (path) => {
  const response = await fetch(`${siteUrl}${path}`, {
    headers: {
      "user-agent": "SGExamHubLiveOgImageAudit/1.0",
    },
  });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
};

const sha256 = (buffer) => createHash("sha256").update(buffer).digest("hex");

const readPngDimensions = (png) => {
  const signature = png.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    fail(`Live ${pngPath} is not a PNG file.`);
    return { width: 0, height: 0 };
  }
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
};

try {
  const [manifestBuffer, pngBuffer] = await Promise.all([
    fetchBuffer(manifestPath),
    fetchBuffer(pngPath),
  ]);
  const manifest = JSON.parse(manifestBuffer.toString("utf8"));
  const dimensions = readPngDimensions(pngBuffer);

  if (manifest.output !== `public${pngPath}`) {
    fail(`Live ${manifestPath} points to ${manifest.output}; expected public${pngPath}.`);
  }
  if (manifest.width !== expectedWidth || manifest.height !== expectedHeight) {
    fail(`Live ${manifestPath} declares ${manifest.width}x${manifest.height}; expected ${expectedWidth}x${expectedHeight}.`);
  }
  if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
    fail(`Live ${pngPath} is ${dimensions.width}x${dimensions.height}; expected ${expectedWidth}x${expectedHeight}.`);
  }
  if (manifest.pngSha256 !== sha256(pngBuffer)) {
    fail(`Live ${pngPath} hash does not match ${manifestPath}.`);
  }

  if (process.exitCode) process.exit();
  console.log("Live OG image audit passed.");
} catch (error) {
  fail(`Live OG image audit failed: ${error.message}`);
  process.exit();
}
