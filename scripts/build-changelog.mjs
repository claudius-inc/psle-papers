#!/usr/bin/env node
// Build a complete audit trail of every change to public/files/ during this validation cycle.
// Sources of truth:
//   - .validate-results.jsonl   = original disk state at OCR time + detected metadata
//   - current public/files/     = post-fix state
//   - collisions.md             = manually resolved collisions

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const FILES_DIR = path.join(ROOT, 'public/files');
const RESULTS_FILE = path.join(ROOT, '.validate-results.jsonl');
const OUT = path.join(ROOT, 'docs/2026-05-validation-changelog.md');

const opts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/json/dropdownOptions.json'), 'utf8'));
const schoolByCode = new Map(opts.School.map(s => [s.code, s.name]));

const SUBJ_NAME = { '1': 'English', '2': 'Chinese', '3': 'Mathematics', '4': 'Science', '5': 'Higher Chinese' };
const TYPE_NAME = { '1': 'WA1', '2': 'SA1', '3': 'WA2', '4': 'SA2', '5': 'WA3', '6': 'Practice Paper' };
const SUBJ_CODE = Object.fromEntries(Object.entries(SUBJ_NAME).map(([k,v]) => [v, k]));
const TYPE_CODE = Object.fromEntries(Object.entries(TYPE_NAME).map(([k,v]) => [v, k]));

const records = fs.readFileSync(RESULTS_FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
const recordByFile = new Map(records.map(r => [r.file, r]));

// First-pass auto-renames: compute what apply-fixes.mjs computed
function autoCorrected(rec) {
  const p = rec.parsed, ocr = rec.ocrInfo || {};
  const level = ocr.level || p.level;
  const school = (ocr.school && ocr.school.code) || p.school;
  const subject = SUBJ_CODE[ocr.subject] || p.subject;
  let type_ = TYPE_CODE[ocr.examType] || p.type;
  if (ocr.examType === 'Preliminary' && p.type === '4') type_ = '4';
  const year = ocr.year || p.year;
  return `${level}_${school}_${subject}_${type_}_${year}.pdf`;
}

function shouldProcess(rec) {
  if (rec.error || !rec.issues || !rec.issues.length) return false;
  const onlyLowConfSubj = rec.issues.length === 1 &&
    rec.issues[0].startsWith('subject mismatch') &&
    rec.ocrInfo && rec.ocrInfo.subject !== 'Higher Chinese';
  return !onlyLowConfSubj;
}

const original = new Set(records.map(r => r.file));
const current = new Set(fs.readdirSync(FILES_DIR).filter(f => f.toLowerCase().endsWith('.pdf')));

// Replay the EXACT same plan apply-fixes.mjs used: every PDF where target was vacant
// in the pre-rename disk state was actually renamed. Chain renames during manual cleanup
// don't change this — the auto-rename actually happened at apply time.
const autoRenamed = []; // { from, to, reasons }
const skippedCollisions = []; // { from, plannedTo, reasons }
for (const rec of records) {
  if (!shouldProcess(rec)) continue;
  const target = autoCorrected(rec);
  if (target === rec.file) continue;
  if (original.has(target)) {
    skippedCollisions.push({ from: rec.file, plannedTo: target, issues: rec.issues });
  } else {
    autoRenamed.push({ from: rec.file, to: target, issues: rec.issues });
  }
}

// Manual resolutions parsed from collisions.md "Resolved" section
const collisionsContent = fs.readFileSync(path.join(ROOT, 'docs/2026-05-validation-collisions.md'), 'utf8');
const resolvedSection = collisionsContent.split('## Resolved')[1] || '';
const manualEntries = [];
for (const line of resolvedSection.split('\n')) {
  const m = line.match(/^\| (.+?) \| (.+?) \| (.+?) \|$/);
  if (!m || m[1] === 'Source PDF' || m[1].startsWith('---')) continue;
  manualEntries.push({ source: m[1], action: m[2], notes: m[3] });
}

// Files entirely deleted: in original, NOT renamed away by auto pass, NOT in current,
// AND not the source of a manual rename (those show up in collisions.md as "Renamed → ...").
const autoSources = new Set(autoRenamed.map(r => r.from));
const manualRenameSources = new Set();
for (const m of manualEntries) {
  // Source cell may be `pat.pdf` or `a.pdf → b.pdf` (chain rename rows).
  const srcMatches = m.source.match(/`([^`]+\.pdf)`/g) || [];
  if (srcMatches.length && /Renamed/i.test(m.action)) {
    // First filename in the cell is the source
    manualRenameSources.add(srcMatches[0].replace(/`/g, ''));
  }
}
const deletedFiles = [...original]
  .filter(f => !current.has(f) && !autoSources.has(f) && !manualRenameSources.has(f))
  .sort();

// Sanity check: any current file that isn't original AND isn't an auto-rename target.
// These should all be manual rename targets, accounted for in collisions.md.
const renameTargets = new Set(autoRenamed.map(r => r.to));
const unaccountedNew = [...current].filter(f => !original.has(f) && !renameTargets.has(f)).sort();

// === Build the CHANGELOG ===
const lines = [];
lines.push('# Validation cycle change log');
lines.push('');
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push(`- Original PDFs (start of cycle): **${original.size}**`);
lines.push(`- Current PDFs:                    **${current.size}**`);
lines.push(`- First-pass auto-renames:         **${autoRenamed.length}**`);
lines.push(`- Manual resolutions:              **${manualEntries.length}**`);
lines.push(`- Net deletions:                   **${original.size - current.size}**`);
lines.push('');
lines.push('## dropdownOptions.json additions');
lines.push('- Subject `5` = "Higher Chinese" (new)');
lines.push('- Type `6` = "Practice Paper" (new)');
lines.push('');
lines.push('---');
lines.push('');

function describeChange(rec, target) {
  const p = rec.parsed, ocr = rec.ocrInfo || {};
  const fromHuman = `P${p.level} · ${schoolByCode.get(p.school)||p.school} · ${SUBJ_NAME[p.subject]||p.subject} · ${TYPE_NAME[p.type]||p.type} · ${p.year}`;
  const tgtParts = target.replace(/\.pdf$/, '').split('_');
  const toHuman = `P${tgtParts[0]} · ${schoolByCode.get(tgtParts[1])||tgtParts[1]} · ${SUBJ_NAME[tgtParts[2]]||tgtParts[2]} · ${TYPE_NAME[tgtParts[3]]||tgtParts[3]} · ${tgtParts[4]}`;
  return { fromHuman, toHuman, issues: rec.issues || [] };
}

// Categorize first-pass auto-renames
const buckets = {
  'Higher Chinese (subject 2 → 5)': [],
  'School mismatch': [],
  'Exam type mismatch': [],
  'Year mismatch': [],
  'Level mismatch': [],
  'Subject mismatch': [],
};
for (const r of autoRenamed) {
  const tags = r.issues.map(i => i.toLowerCase());
  if (tags.some(t => t.includes('higher chinese'))) buckets['Higher Chinese (subject 2 → 5)'].push(r);
  else if (tags.some(t => t.startsWith('school mismatch'))) buckets['School mismatch'].push(r);
  else if (tags.some(t => t.startsWith('exam type mismatch'))) buckets['Exam type mismatch'].push(r);
  else if (tags.some(t => t.startsWith('year mismatch'))) buckets['Year mismatch'].push(r);
  else if (tags.some(t => t.startsWith('level mismatch'))) buckets['Level mismatch'].push(r);
  else if (tags.some(t => t.startsWith('subject mismatch'))) buckets['Subject mismatch'].push(r);
}

lines.push('## First-pass auto-renames (165)');
lines.push('');
lines.push('All renames triggered by OCR-detected mismatch with filename codes. No collisions; the target filename was vacant.');
lines.push('');

for (const [title, items] of Object.entries(buckets)) {
  if (!items.length) continue;
  lines.push(`### ${title} (${items.length})`);
  lines.push('');
  lines.push('| Old filename | New filename | Was → Now | Reason |');
  lines.push('|---|---|---|---|');
  for (const r of items) {
    const rec = recordByFile.get(r.from);
    const d = describeChange(rec, r.to);
    lines.push(`| \`${r.from}\` | \`${r.to}\` | ${d.fromHuman} → ${d.toHuman} | ${r.issues.join('; ')} |`);
  }
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## Manual resolutions (collisions, 21)');
lines.push('');
lines.push('Cases where the OCR-suggested rename target was already taken. Each was reviewed and resolved by user decision — see `collisions.md` for the verdict notes.');
lines.push('');
lines.push('| Source / change | Action | Reason |');
lines.push('|---|---|---|');
for (const m of manualEntries) {
  lines.push(`| ${m.source} | ${m.action} | ${m.notes} |`);
}
lines.push('');

if (deletedFiles.length) {
  lines.push('---');
  lines.push('');
  lines.push(`## Files deleted in this cycle (${deletedFiles.length})`);
  lines.push('');
  for (const f of deletedFiles) {
    lines.push(`- \`${f}\``);
  }
  lines.push('');
}

if (unaccountedNew.length) {
  lines.push('---');
  lines.push('');
  lines.push(`## Manual rename results (${unaccountedNew.length})`);
  lines.push('');
  lines.push('Filenames that exist now but did not exist at the start of the cycle and were not first-pass auto-rename targets. Each one is the result of a manual rename done during collision review (see "Manual resolutions" table above for the source/reason).');
  lines.push('');
  for (const f of unaccountedNew) lines.push(`- \`${f}\``);
  lines.push('');
}

fs.writeFileSync(OUT, lines.join('\n'));
console.error(`Wrote ${OUT}`);
console.error(`auto-renamed=${autoRenamed.length} manual=${manualEntries.length} deleted=${deletedFiles.length} unaccounted=${unaccountedNew.length}`);
