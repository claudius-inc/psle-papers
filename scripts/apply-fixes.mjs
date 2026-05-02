#!/usr/bin/env node
// Reads .validate-results.jsonl and renames mislabeled PDFs in public/files/
// to match the OCR-detected metadata. Updates public/json/files.json in lockstep.
//
// Usage:
//   node scripts/apply-fixes.mjs            # dry-run, prints planned renames
//   node scripts/apply-fixes.mjs --apply    # actually rename files + update files.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const FILES_DIR = path.join(ROOT, 'public/files');
const RESULTS_FILE = path.join(ROOT, '.validate-results.jsonl');
const FILES_JSON = path.join(ROOT, 'public/json/files.json');

const APPLY = process.argv.includes('--apply');

const SUBJECT_NAME_TO_CODE = {
  'English': '1',
  'Chinese': '2',
  'Mathematics': '3',
  'Science': '4',
  'Higher Chinese': '5',
};
const TYPE_NAME_TO_CODE = {
  'WA1': '1', 'SA1': '2', 'WA2': '3', 'SA2': '4', 'WA3': '5',
};

function correctedFilename(rec) {
  const p = rec.parsed;
  const ocr = rec.ocrInfo || {};
  let level = p.level;
  let school = p.school;
  let subject = p.subject;
  let type = p.type;
  let year = p.year;
  const reasons = [];

  // Level
  if (ocr.level && ocr.level !== p.level) {
    level = ocr.level;
    reasons.push(`level ${p.level}→${ocr.level}`);
  }

  // School (use OCR-detected school code)
  if (ocr.school && ocr.school.code && ocr.school.code !== p.school) {
    school = ocr.school.code;
    reasons.push(`school ${p.school}→${ocr.school.code}`);
  }

  // Subject (Higher Chinese gets new code 5)
  if (ocr.subject && SUBJECT_NAME_TO_CODE[ocr.subject]) {
    const newCode = SUBJECT_NAME_TO_CODE[ocr.subject];
    if (newCode !== p.subject) {
      subject = newCode;
      reasons.push(`subject ${p.subject}→${newCode} (${ocr.subject})`);
    }
  }

  // Exam type — Preliminary == SA2 by convention so don't rewrite that case
  if (ocr.examType && TYPE_NAME_TO_CODE[ocr.examType]) {
    const newCode = TYPE_NAME_TO_CODE[ocr.examType];
    if (newCode !== p.type && !(ocr.examType === 'Preliminary' && p.type === '4')) {
      type = newCode;
      reasons.push(`type ${p.type}→${newCode} (${ocr.examType})`);
    }
  }

  // Year
  if (ocr.year && ocr.year !== p.year) {
    year = ocr.year;
    reasons.push(`year ${p.year}→${ocr.year}`);
  }

  const newName = `${level}_${school}_${subject}_${type}_${year}.pdf`;
  return { newName, reasons, changed: reasons.length > 0 };
}

function shouldSkip(rec) {
  if (rec.error) return 'unreadable';
  if (!rec.issues || !rec.issues.length) return 'no-issues';
  // Skip the two known false-positive subject-detection cases (no Higher Chinese, no Math/Science fp).
  // We trust Higher Chinese; for "subject mismatch" between non-Higher-Chinese subjects, OCR can mis-fire
  // when school name contains the keyword. Skip those.
  const onlySubjectMismatch =
    rec.issues.length === 1 && rec.issues[0].startsWith('subject mismatch') &&
    rec.ocrInfo && rec.ocrInfo.subject !== 'Higher Chinese';
  if (onlySubjectMismatch) return 'subject-mismatch-low-confidence';
  return null;
}

function loadResults() {
  return fs.readFileSync(RESULTS_FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
}

const records = loadResults();
const renamePlan = [];
const skipped = { unreadable: 0, 'no-issues': 0, 'subject-mismatch-low-confidence': 0, 'no-change': 0, 'collision': 0 };

const existingFiles = new Set(fs.readdirSync(FILES_DIR));

for (const rec of records) {
  const reason = shouldSkip(rec);
  if (reason) { skipped[reason]++; continue; }
  const { newName, reasons, changed } = correctedFilename(rec);
  if (!changed) { skipped['no-change']++; continue; }
  if (newName === rec.file) { skipped['no-change']++; continue; }

  // Collision check
  if (existingFiles.has(newName) && newName !== rec.file) {
    renamePlan.push({ from: rec.file, to: newName, reasons, collision: true });
    skipped.collision++;
    continue;
  }
  renamePlan.push({ from: rec.file, to: newName, reasons });
}

// Group by reason category for the dry-run summary
const byCategory = new Map();
for (const r of renamePlan) {
  const cat = r.collision ? 'collision' : (r.reasons.some(x => x.includes('Higher Chinese')) ? 'higher-chinese' :
              r.reasons.some(x => x.startsWith('subject')) ? 'subject' :
              r.reasons.some(x => x.startsWith('school')) ? 'school' :
              r.reasons.some(x => x.startsWith('type')) ? 'type' :
              r.reasons.some(x => x.startsWith('year')) ? 'year' :
              r.reasons.some(x => x.startsWith('level')) ? 'level' : 'other');
  if (!byCategory.has(cat)) byCategory.set(cat, []);
  byCategory.get(cat).push(r);
}

console.log(`Rename plan: ${renamePlan.length} (${renamePlan.filter(r => !r.collision).length} actionable, ${renamePlan.filter(r => r.collision).length} collisions)\n`);
for (const [cat, list] of byCategory) {
  console.log(`== ${cat} (${list.length}) ==`);
  for (const r of list.slice(0, 5)) {
    console.log(`  ${r.from} -> ${r.to}  [${r.reasons.join(', ')}]${r.collision ? ' *** COLLISION ***' : ''}`);
  }
  if (list.length > 5) console.log(`  ... and ${list.length - 5} more`);
  console.log();
}
console.log('Skipped:', skipped);

if (!APPLY) {
  console.log('\nDRY-RUN. Re-run with --apply to perform renames + update files.json.');
  process.exit(0);
}

console.log('\nAPPLYING renames...');
let renamed = 0;
let failed = 0;
for (const r of renamePlan) {
  if (r.collision) continue;
  const fromPath = path.join(FILES_DIR, r.from);
  const toPath = path.join(FILES_DIR, r.to);
  try {
    fs.renameSync(fromPath, toPath);
    renamed++;
  } catch (err) {
    console.error(`FAILED ${r.from}: ${err.message}`);
    failed++;
  }
}
console.log(`Renamed ${renamed}, failed ${failed}.`);

// Rebuild files.json from current directory state
const newList = fs.readdirSync(FILES_DIR)
  .filter(f => f.toLowerCase().endsWith('.pdf'))
  .map(f => f.replace(/\.pdf$/i, ''))
  .sort();
fs.writeFileSync(FILES_JSON, JSON.stringify(newList, null, 2));
console.log(`Wrote ${FILES_JSON}: ${newList.length} entries`);
