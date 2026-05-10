import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const svgPath = "public/og-image.svg";
const pngPath = "public/og-image.png";
const manifestPath = "public/og-image.manifest.json";
const expectedWidth = 1200;
const expectedHeight = 630;

const commandExists = (command) => {
  try {
    execFileSync("/bin/sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const run = (command, args) => {
  execFileSync(command, args, { stdio: "inherit" });
};

const renderers = [
  {
    name: "rsvg-convert",
    render: () => run("rsvg-convert", ["-w", String(expectedWidth), "-h", String(expectedHeight), "-f", "png", "-o", pngPath, svgPath]),
  },
  {
    name: "magick",
    render: () => run("magick", [svgPath, pngPath]),
  },
  {
    name: "convert",
    render: () => run("convert", [svgPath, pngPath]),
  },
  {
    name: "inkscape",
    render: () =>
      run("inkscape", [
        svgPath,
        "--export-type=png",
        `--export-filename=${pngPath}`,
        `--export-width=${expectedWidth}`,
        `--export-height=${expectedHeight}`,
      ]),
  },
  {
    name: "sips",
    render: () => run("sips", ["-s", "format", "png", svgPath, "--out", pngPath]),
  },
];

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

const readPngDimensions = (path) => {
  const png = readFileSync(path);
  const signature = png.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a PNG file.`);
  }
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
};

if (!existsSync(svgPath)) {
  console.error(`Missing source SVG: ${svgPath}`);
  process.exit(1);
}

const renderer = renderers.find(({ name }) => commandExists(name));
if (!renderer) {
  console.error(
    "Cannot generate public/og-image.png. Install one of: rsvg-convert, ImageMagick, Inkscape, or macOS sips.",
  );
  process.exit(1);
}

renderer.render();

const dimensions = readPngDimensions(pngPath);
if (dimensions.width !== expectedWidth || dimensions.height !== expectedHeight) {
  console.error(
    `Generated ${pngPath} is ${dimensions.width}x${dimensions.height}; expected ${expectedWidth}x${expectedHeight}.`,
  );
  process.exit(1);
}

writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      source: svgPath,
      output: pngPath,
      width: expectedWidth,
      height: expectedHeight,
      renderer: renderer.name,
      svgSha256: sha256(svgPath),
      pngSha256: sha256(pngPath),
    },
    null,
    2,
  )}\n`,
);

console.log(`Generated ${pngPath} from ${svgPath} using ${renderer.name}.`);
