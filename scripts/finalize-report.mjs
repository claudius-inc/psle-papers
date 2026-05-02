#!/usr/bin/env node
// Generate final wrong.md and collisions.md based on what was actually applied.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const RESULTS_FILE = path.join(ROOT, '.validate-results.jsonl');
const FILES_DIR = path.join(ROOT, 'public/files');
const WRONG_MD = path.join(ROOT, 'wrong.md');
const COLLISIONS_MD = path.join(ROOT, 'collisions.md');

const opts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/json/dropdownOptions.json'), 'utf8'));
const schoolByCode = new Map(opts.School.map(s => [s.code, s.name]));

const SUBJ = { 'English': '1', 'Chinese': '2', 'Mathematics': '3', 'Science': '4', 'Higher Chinese': '5' };
const TYPE = { 'WA1': '1', 'SA1': '2', 'WA2': '3', 'SA2': '4', 'WA3': '5' };
const TYPE_NAME = { '1': 'WA1', '2': 'SA1', '3': 'WA2', '4': 'SA2', '5': 'WA3' };
const SUBJ_NAME = { '1': 'English', '2': 'Chinese', '3': 'Mathematics', '4': 'Science', '5': 'Higher Chinese' };

const records = fs.readFileSync(RESULTS_FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
const preDisk = new Set(records.filter(r => !r.error).map(r => r.file));
const onDisk = new Set(fs.readdirSync(FILES_DIR).filter(f => f.toLowerCase().endsWith('.pdf')));

function correctedName(rec) {
  const p = rec.parsed, ocr = rec.ocrInfo || {};
  const level = ocr.level || p.level;
  const school = (ocr.school && ocr.school.code) || p.school;
  const subject = SUBJ[ocr.subject] || p.subject;
  const examType = ocr.examType;
  let type_ = TYPE[examType] || p.type;
  if (examType === 'Preliminary' && p.type === '4') type_ = '4';
  const year = ocr.year || p.year;
  return `${level}_${school}_${subject}_${type_}_${year}.pdf`;
}

function shouldProcess(rec) {
  if (rec.error || !rec.issues || !rec.issues.length) return false;
  const onlyLowConfSubj = rec.issues.length === 1 &&
    rec.issues[0].startsWith('subject mismatch') &&
    rec.ocrInfo && rec.ocrInfo.subject !== 'Higher Chinese';
  if (onlyLowConfSubj) return false;
  return true;
}

const fixed = []; // applied successfully
const collisions = []; // had a target-name collision pre-rename
const skipped = []; // false positives we deliberately skipped
const errors = []; // unreadable PDFs

for (const rec of records) {
  if (rec.error) { errors.push(rec); continue; }
  if (!rec.issues || !rec.issues.length) continue;
  if (!shouldProcess(rec)) { skipped.push(rec); continue; }
  const target = correctedName(rec);
  if (target === rec.file) continue;
  if (preDisk.has(target)) {
    collisions.push({ ...rec, target });
  } else {
    fixed.push({ ...rec, target });
  }
}

function row(rec, target) {
  const p = rec.parsed, ocr = rec.ocrInfo || {};
  const codedSchool = schoolByCode.get(p.school) || '?';
  const codedSubject = SUBJ_NAME[p.subject] || '?';
  const codedType = TYPE_NAME[p.type] || '?';
  const actSchool = (ocr.school && ocr.school.name) || codedSchool;
  const actSchoolCode = (ocr.school && ocr.school.code) || p.school;
  const actSubject = ocr.subject || codedSubject;
  const actType = ocr.examType || codedType;
  const actYear = ocr.year || p.year;
  return { codedSchool, codedSubject, codedType, actSchool, actSchoolCode, actSubject, actType, actYear };
}

// ===== collisions.md =====
const colLines = [];
colLines.push('# Naming collisions — manual review needed');
colLines.push('');
colLines.push(`Generated: ${new Date().toISOString()}`);
colLines.push(`Count: ${collisions.length}`);
colLines.push('');
colLines.push('Each row below is a PDF whose OCR-detected metadata maps to a filename that **already exists** for another PDF. This usually means one of three things:');
colLines.push('1. **Duplicate paper** — the two PDFs are the same paper, one of which was misnamed. Pick one to keep.');
colLines.push('2. **Both mislabeled** — neither filename is correct; the OCR-detected name belongs to a third paper.');
colLines.push('3. **OCR error** — the detection was wrong and the original filename is fine.');
colLines.push('');
colLines.push('| Source PDF (currently) | OCR thinks it should be | Issue |');
colLines.push('|---|---|---|');
for (const c of collisions) {
  colLines.push(`| \`${c.file}\` | \`${c.target}\` | ${c.issues.join('; ')} |`);
}
colLines.push('');
fs.writeFileSync(COLLISIONS_MD, colLines.join('\n'));
console.error(`Wrote ${COLLISIONS_MD}: ${collisions.length} entries`);

// ===== wrong.md (final version) =====
const lines = [];
lines.push('# PDF / filename mismatches');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push(`Total PDFs scanned: ${records.length}`);
lines.push(`Issues found: ${fixed.length + collisions.length + skipped.length + errors.length}`);
lines.push(`- **Fixed by rename**: ${fixed.length}`);
lines.push(`- **Collisions (manual review)**: ${collisions.length} — see \`collisions.md\``);
lines.push(`- **Subject mismatch (low-confidence, skipped)**: ${skipped.length}`);
lines.push(`- **Unreadable**: ${errors.length}`);
lines.push('');
lines.push('Filename pattern: `{Level}_{SchoolCode}_{Subject}_{Type}_{Year}.pdf`');
lines.push('Subject codes: 1=English, 2=Chinese, 3=Mathematics, 4=Science, **5=Higher Chinese (NEW)**');
lines.push('');
lines.push('---');
lines.push('');

function writeSection(title, items) {
  if (!items.length) return;
  lines.push(`## ${title} (${items.length})`);
  lines.push('');
  lines.push('| Old filename | New filename | School | Subject | Year | Exam type |');
  lines.push('|---|---|---|---|---|---|');
  for (const it of items) {
    const r = row(it, it.target);
    lines.push(`| \`${it.file}\` | \`${it.target}\` | ${r.actSchool} (${r.actSchoolCode}) | ${r.actSubject} | ${r.actYear} | ${r.actType} |`);
  }
  lines.push('');
}

// Categorize fixed
function bucket(it) {
  const tags = it.issues.map(i => i.toLowerCase());
  if (tags.some(t => t.includes('higher chinese'))) return 'higher-chinese';
  if (tags.some(t => t.startsWith('school mismatch'))) return 'school';
  if (tags.some(t => t.startsWith('exam type mismatch'))) return 'examtype';
  if (tags.some(t => t.startsWith('year mismatch'))) return 'year';
  if (tags.some(t => t.startsWith('level mismatch'))) return 'level';
  if (tags.some(t => t.startsWith('subject mismatch'))) return 'subject';
  return 'other';
}
const fixedByCat = { 'higher-chinese': [], school: [], examtype: [], year: [], level: [], subject: [], other: [] };
for (const it of fixed) fixedByCat[bucket(it)].push(it);

writeSection('Fixed: Higher Chinese mislabeled as Chinese (subject 2 → 5)', fixedByCat['higher-chinese']);
writeSection('Fixed: School mismatch', fixedByCat.school);
writeSection('Fixed: Exam type mismatch', fixedByCat.examtype);
writeSection('Fixed: Year mismatch', fixedByCat.year);
writeSection('Fixed: Level mismatch', fixedByCat.level);
writeSection('Fixed: Subject mismatch', fixedByCat.subject);

if (skipped.length) {
  lines.push(`## Skipped — low-confidence subject detection (${skipped.length})`);
  lines.push('');
  lines.push('These had OCR-detected subjects that don\'t match the filename, but the detection is unreliable in these cases (e.g. school name contains the keyword). Left untouched.');
  lines.push('');
  for (const r of skipped) {
    lines.push(`- \`${r.file}\` — OCR says ${r.ocrInfo.subject}, filename codes ${SUBJ_NAME[r.parsed.subject]}`);
  }
  lines.push('');
}

if (errors.length) {
  lines.push(`## Unreadable (${errors.length})`);
  lines.push('');
  for (const r of errors) {
    lines.push(`- \`${r.file}\` — ${r.error}`);
  }
  lines.push('');
}

fs.writeFileSync(WRONG_MD, lines.join('\n'));
console.error(`Wrote ${WRONG_MD}`);
console.error(`Summary: fixed=${fixed.length} collisions=${collisions.length} skipped=${skipped.length} errors=${errors.length}`);
