#!/usr/bin/env node
// Validate that each PDF's first page matches its filename codes.
// Filename pattern: {Level}_{SchoolCode}_{Subject}_{Type}_{Year}.pdf
// Outputs mismatches to wrong.md.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const FILES_DIR = path.join(ROOT, 'public/files');
const TMP_DIR = path.join(os.tmpdir(), 'pdfocr_run');
const OUT_FILE = path.join(ROOT, 'wrong.md');
const PROGRESS_FILE = path.join(ROOT, '.validate-progress.json');
const RESULTS_FILE = path.join(ROOT, '.validate-results.jsonl');

fs.mkdirSync(TMP_DIR, { recursive: true });

const opts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/json/dropdownOptions.json'), 'utf8'));
const schoolByCode = new Map(opts.School.map(s => [s.code, s.name]));
const subjectByCode = new Map(opts.Subject.map(s => [s.code, s.name]));
const typeByCode = new Map(opts.Type.map(s => [s.code, s.name]));
const levelByCode = new Map(opts.Level.map(s => [s.code, s.name]));

const SUBJECT_FILENAME_TO_NAME = {
  '1': 'English',
  '2': 'Chinese',
  '3': 'Mathematics',
  '4': 'Science',
};
const TYPE_FILENAME_TO_NAME = {
  '1': 'WA1', '2': 'SA1', '3': 'WA2', '4': 'SA2', '5': 'WA3',
};

function detectSubject(text) {
  // Higher Chinese first (must check before Chinese).
  if (/HIGHER\s*CHINESE|高级华文|高級華文/i.test(text)) return 'Higher Chinese';
  // Strip common school-name/program tokens that contaminate the keyword search.
  // "Anglo-Chinese", "Sino-Chinese", "Chinese Girls" (school name), "Chinese High" etc.
  const stripped = text
    .replace(/ANGLO[\s\-]?CHINESE/gi, '')
    .replace(/SINO[\s\-]?CHINESE/gi, '')
    .replace(/CHINESE\s+(GIRLS|HIGH|SCHOOL)/gi, '')
    .replace(/CATHOLIC\s+HIGH/gi, '');
  if (/MATHEMATICS|\bMATHS\b|数学|數學/i.test(stripped)) return 'Mathematics';
  if (/\bSCIENCE\b|科学|科學/i.test(stripped)) return 'Science';
  if (/\bENGLISH\b|\bEL\b/i.test(stripped)) return 'English';
  if (/CHINESE|华文|中文|華文|\bCL\b/i.test(stripped)) return 'Chinese';
  return null;
}

function detectExamType(text) {
  const t = text.toUpperCase();
  // Preliminary is typically P6 final (mapped to SA2 in filenames).
  if (/\bPRELIM(?:INARY)?\b/.test(t)) return 'Preliminary';

  // SA2 — explicit "Second/2/II" before or after SEMESTRAL ASSESSMENT, or End-of-Year/EOY.
  if (
    /(?:SECOND|2ND|TWO|II)\s+SEMESTRAL\s+ASSESSMENT/.test(t) ||
    /SEMESTRAL\s+ASSESSMENT\s+(?:TWO|II|2)\b/.test(t) ||
    /END[\s\-]?OF[\s\-]?YEAR/.test(t) ||
    /\bEOY\b/.test(t) ||
    /\bSA\s*2\b/.test(t) ||
    /\bSA2\b/.test(t)
  ) return 'SA2';

  // SA1 — "First/1/I" before or after SEMESTRAL ASSESSMENT, or Mid-Year.
  if (
    /(?:FIRST|1ST|ONE|I)\s+SEMESTRAL\s+ASSESSMENT/.test(t) ||
    /SEMESTRAL\s+ASSESSMENT\s+(?:ONE|I|1)\b/.test(t) ||
    /MID[\s\-]?YEAR/.test(t) ||
    /\bSA\s*1\b/.test(t) ||
    /\bSA1\b/.test(t)
  ) return 'SA1';

  // WA3
  if (
    /(?:THIRD|3RD|THREE|III)\s+(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT/.test(t) ||
    /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:THREE|III|3)\b/.test(t) ||
    /\bWA\s*3\b/.test(t) || /\bWA3\b/.test(t) ||
    /\bCA\s*3\b/.test(t) || /\bCA3\b/.test(t) ||
    /TERM\s*3\s+(?:WEIGHTED|CONTINUAL)/.test(t)
  ) return 'WA3';

  // WA2
  if (
    /(?:SECOND|2ND|TWO|II)\s+(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT/.test(t) ||
    /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:TWO|II|2)\b/.test(t) ||
    /\bWA\s*2\b/.test(t) || /\bWA2\b/.test(t) ||
    /\bCA\s*2\b/.test(t) || /\bCA2\b/.test(t) ||
    /TERM\s*2\s+(?:WEIGHTED|CONTINUAL)/.test(t)
  ) return 'WA2';

  // WA1
  if (
    /(?:FIRST|1ST|ONE|I)\s+(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT/.test(t) ||
    /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:ONE|I|1)\b/.test(t) ||
    /\bWA\s*1\b/.test(t) || /\bWA1\b/.test(t) ||
    /\bCA\s*1\b/.test(t) || /\bCA1\b/.test(t) ||
    /TERM\s*1\s+(?:WEIGHTED|CONTINUAL)/.test(t)
  ) return 'WA1';

  return null;
}

function detectLevel(text) {
  const map = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6 };
  const t = text.toUpperCase();
  // Collect all candidate levels and pick the most-frequent (resilient to OCR noise / "PRIMARY 20 marks" type matches).
  const counts = new Map();
  function bump(n) { if (!n) return; counts.set(n, (counts.get(n) || 0) + 1); }
  for (const m of t.matchAll(/PRIMARY\s*([1-6])(?!\d)/g)) bump(m[1]);
  for (const m of t.matchAll(/\bP\s*([1-6])(?![0-9])\b/g)) bump(m[1]);
  for (const m of t.matchAll(/\bPR\.?\s*([1-6])(?!\d)\b/g)) bump(m[1]);
  for (const m of t.matchAll(/\bPRI\.?\s*([1-6])(?!\d)\b/g)) bump(m[1]);
  for (const m of t.matchAll(/PRIMARY\s+(ONE|TWO|THREE|FOUR|FIVE|SIX)/g)) bump(String(map[m[1]]));
  for (const m of text.matchAll(/小学\s*([一二三四五六])\s*年级/g)) {
    const cn = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6 };
    bump(String(cn[m[1]]));
  }
  // Chinese: 三/四/五/六/一/二 年级
  for (const m of text.matchAll(/([一二三四五六])\s*年级/g)) {
    const cn = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6 };
    bump(String(cn[m[1]]));
  }
  if (!counts.size) return null;
  let best = null, bestCount = -1;
  for (const [lvl, c] of counts) {
    if (c > bestCount) { best = lvl; bestCount = c; }
  }
  return best;
}

function detectYear(text) {
  // Find any 4-digit year 2017-2027 (range covers source data 2019-2025 with margin).
  const matches = [...text.matchAll(/\b(20(1[7-9]|2[0-7]))\b/g)].map(m => m[1]);
  if (matches.length === 0) return null;
  // Prefer the most-frequent year
  const counts = new Map();
  for (const y of matches) counts.set(y, (counts.get(y) || 0) + 1);
  let best = null, bestCount = -1;
  for (const [y, c] of counts) {
    if (c > bestCount) { best = y; bestCount = c; }
  }
  return best;
}

function normalizeForMatch(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectSchool(text, expectedName) {
  const norm = normalizeForMatch(text);
  // Try exact substring match against every known school
  let bestMatch = null;
  let bestLen = 0;
  for (const [code, name] of schoolByCode) {
    if (code === '0') continue;
    const nname = normalizeForMatch(name);
    if (norm.includes(nname) && nname.length > bestLen) {
      bestMatch = { code, name };
      bestLen = nname.length;
    }
  }
  if (bestMatch) return bestMatch;
  // Heuristic: look for 'school' / 'primary' line and try fuzzy
  return null;
}

function runCmd(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', d => stdout += d);
    child.stderr.on('data', d => stderr += d);
    child.on('error', err => resolve({ status: -1, stdout, stderr: String(err) }));
    child.on('close', code => resolve({ status: code, stdout, stderr }));
  });
}

const TESS_LANGS = fs.existsSync('/opt/homebrew/share/tessdata/chi_sim.traineddata') ? 'eng+chi_sim' : 'eng';

async function ocrFirstPage(pdfPath, baseName) {
  const outPrefix = path.join(TMP_DIR, baseName);
  const pngPath = `${outPrefix}.png`;
  const txtPrefix = outPrefix;
  const render = await runCmd('pdftoppm', ['-f', '1', '-l', '1', '-r', '150', '-png', '-singlefile', pdfPath, outPrefix]);
  if (render.status !== 0) {
    return { error: `pdftoppm failed: ${render.stderr || render.stdout}` };
  }
  if (!fs.existsSync(pngPath)) return { error: 'PNG not generated' };
  const ocr = await runCmd('tesseract', [pngPath, txtPrefix, '-l', TESS_LANGS]);
  if (ocr.status !== 0) {
    try { fs.unlinkSync(pngPath); } catch {}
    return { error: `tesseract failed: ${ocr.stderr || ocr.stdout}` };
  }
  let text = '';
  try { text = fs.readFileSync(`${txtPrefix}.txt`, 'utf8'); } catch {}
  try { fs.unlinkSync(pngPath); } catch {}
  try { fs.unlinkSync(`${txtPrefix}.txt`); } catch {}
  return { text };
}

function parseFilename(name) {
  // {Level}_{SchoolCode}_{Subject}_{Type}_{Year}.pdf
  const base = name.replace(/\.pdf$/i, '');
  const parts = base.split('_');
  if (parts.length !== 5) return null;
  const [level, school, subject, type, year] = parts;
  return { level, school, subject, type, year };
}

function compare(parsedFromName, ocrInfo) {
  const issues = [];
  const expectedSchool = schoolByCode.get(parsedFromName.school);
  const expectedSubject = SUBJECT_FILENAME_TO_NAME[parsedFromName.subject];
  const expectedType = TYPE_FILENAME_TO_NAME[parsedFromName.type];
  const expectedYear = parsedFromName.year;
  const expectedLevel = parsedFromName.level;

  if (ocrInfo.subject) {
    // Higher Chinese flagged as a separate subject from Chinese
    if (ocrInfo.subject === 'Higher Chinese' && expectedSubject === 'Chinese') {
      issues.push(`subject is Higher Chinese (filename codes Chinese)`);
    } else if (ocrInfo.subject !== expectedSubject && !(ocrInfo.subject === 'Higher Chinese' && expectedSubject === 'Chinese')) {
      issues.push(`subject mismatch: PDF says ${ocrInfo.subject}, filename codes ${expectedSubject}`);
    }
  }

  if (ocrInfo.year && ocrInfo.year !== expectedYear) {
    issues.push(`year mismatch: PDF says ${ocrInfo.year}, filename codes ${expectedYear}`);
  }

  if (ocrInfo.examType) {
    // Preliminary commonly maps to SA2 for P6 — accept as match
    const looksLikeMatch =
      ocrInfo.examType === expectedType ||
      (ocrInfo.examType === 'Preliminary' && expectedType === 'SA2');
    if (!looksLikeMatch) {
      issues.push(`exam type mismatch: PDF says ${ocrInfo.examType}, filename codes ${expectedType}`);
    }
  }

  if (ocrInfo.level && ocrInfo.level !== expectedLevel) {
    issues.push(`level mismatch: PDF says P${ocrInfo.level}, filename codes P${expectedLevel}`);
  }

  if (ocrInfo.school && ocrInfo.school.code !== parsedFromName.school) {
    issues.push(`school mismatch: PDF says ${ocrInfo.school.name} (${ocrInfo.school.code}), filename codes ${expectedSchool} (${parsedFromName.school})`);
  }

  return issues;
}

async function processOne(file) {
  const parsed = parseFilename(file);
  const baseName = file.replace(/\.pdf$/i, '');
  if (!parsed) {
    return { file, error: 'unparseable filename' };
  }
  const pdfPath = path.join(FILES_DIR, file);
  const ocr = await ocrFirstPage(pdfPath, baseName);
  if (ocr.error) {
    return { file, error: ocr.error, parsed };
  }
  const text = ocr.text || '';
  const ocrInfo = {
    subject: detectSubject(text),
    examType: detectExamType(text),
    level: detectLevel(text),
    year: detectYear(text),
    school: detectSchool(text),
  };
  const issues = compare(parsed, ocrInfo);
  return {
    file,
    parsed,
    ocrInfo,
    issues,
    text,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity;
  const startFrom = args.includes('--start') ? Number(args[args.indexOf('--start') + 1]) : 0;
  const workers = args.includes('--workers') ? Number(args[args.indexOf('--workers') + 1]) : Math.max(2, os.cpus().length - 2);
  const sample = args.includes('--sample');

  const allFiles = fs.readdirSync(FILES_DIR).filter(f => f.toLowerCase().endsWith('.pdf')).sort();
  console.error(`Total PDFs: ${allFiles.length}`);

  let files = allFiles.slice(startFrom);
  if (sample) {
    const step = Math.floor(allFiles.length / 30) || 1;
    files = allFiles.filter((_, i) => i % step === 0).slice(0, 30);
  }
  if (Number.isFinite(limit)) files = files.slice(0, limit);

  const resultsStream = fs.createWriteStream(RESULTS_FILE, { flags: 'a' });

  let processed = 0;
  let mismatched = 0;
  let unreadable = 0;
  const startTime = Date.now();

  // Concurrency pool
  let idx = 0;
  async function worker() {
    while (true) {
      const myIdx = idx++;
      if (myIdx >= files.length) return;
      const file = files[myIdx];
      const rec = await processOne(file);
      processed++;
      if (rec.error) unreadable++;
      else if (rec.issues && rec.issues.length) mismatched++;
      resultsStream.write(JSON.stringify(rec) + '\n');
      if (processed % 50 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = processed / elapsed;
        const remaining = (files.length - processed) / rate;
        console.error(`[${processed}/${files.length}] mismatched=${mismatched} unreadable=${unreadable} rate=${rate.toFixed(2)}/s ETA=${(remaining/60).toFixed(1)}min`);
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ processed, mismatched, unreadable, total: files.length, lastFile: rec.file }, null, 2));
      }
    }
  }

  console.error(`Workers: ${workers}`);
  await Promise.all(Array.from({ length: workers }, () => worker()));

  resultsStream.end();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ processed, mismatched, unreadable, total: files.length, done: true }, null, 2));
  console.error(`Done. processed=${processed} mismatched=${mismatched} unreadable=${unreadable}`);
}

main().catch(err => { console.error(err); process.exit(1); });
