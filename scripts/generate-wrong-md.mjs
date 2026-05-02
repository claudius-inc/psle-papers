#!/usr/bin/env node
// Reads .validate-results.jsonl and writes wrong.md listing PDFs whose
// first-page content does not match the filename codes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const RESULTS_FILE = path.join(ROOT, '.validate-results.jsonl');
const OUT_FILE = path.join(ROOT, 'wrong.md');

const opts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/json/dropdownOptions.json'), 'utf8'));
const schoolByCode = new Map(opts.School.map(s => [s.code, s.name]));

const SUBJECT_FILENAME_TO_NAME = { '1': 'English', '2': 'Chinese', '3': 'Mathematics', '4': 'Science' };
const TYPE_FILENAME_TO_NAME = { '1': 'WA1', '2': 'SA1', '3': 'WA2', '4': 'SA2', '5': 'WA3' };

// Detect a wider set of exam-type names from the OCR text (for the "actual" column)
function detectActualExamTypeFromText(text) {
  const t = text.toUpperCase();
  if (/\bPRELIM(?:INARY)?\b/.test(t)) return 'Preliminary Examination';
  if (/\bCLASS\s+TEST\b/.test(t)) return 'Class Test';
  if (/\bDIAGNOSTIC\s+TEST\b/.test(t)) return 'Diagnostic Test';
  if (/\bREVISION\b/.test(t)) return 'Revision';
  if (/\bMOCK\s+EXAM\b/.test(t)) return 'Mock Exam';
  if (/(?:SECOND|2ND|TWO|II)\s+SEMESTRAL/.test(t) || /SEMESTRAL\s+ASSESSMENT\s+(?:TWO|II|2)\b/.test(t) || /END[\s\-]?OF[\s\-]?YEAR/.test(t) || /\bEOY\b/.test(t) || /\bSA2?\s*2\b/.test(t)) return 'SA2';
  if (/(?:FIRST|1ST|ONE|I)\s+SEMESTRAL/.test(t) || /SEMESTRAL\s+ASSESSMENT\s+(?:ONE|I|1)\b/.test(t) || /MID[\s\-]?YEAR/.test(t) || /\bSA\s*1\b/.test(t)) return 'SA1';
  if (/(?:THIRD|3RD|THREE|III)\s+(?:WEIGHTED|CONTINUAL)/.test(t) || /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:THREE|III|3)\b/.test(t) || /\bWA\s*3\b/.test(t) || /\bCA\s*3\b/.test(t) || /TERM\s*3\s+(?:WEIGHTED|CONTINUAL)/.test(t)) return 'WA3';
  if (/(?:SECOND|2ND|TWO|II)\s+(?:WEIGHTED|CONTINUAL)/.test(t) || /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:TWO|II|2)\b/.test(t) || /\bWA\s*2\b/.test(t) || /\bCA\s*2\b/.test(t) || /TERM\s*2\s+(?:WEIGHTED|CONTINUAL)/.test(t)) return 'WA2';
  if (/(?:FIRST|1ST|ONE|I)\s+(?:WEIGHTED|CONTINUAL)/.test(t) || /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:ONE|I|1)\b/.test(t) || /\bWA\s*1\b/.test(t) || /\bCA\s*1\b/.test(t) || /TERM\s*1\s+(?:WEIGHTED|CONTINUAL)/.test(t)) return 'WA1';
  return null;
}

function loadResults() {
  const raw = fs.readFileSync(RESULTS_FILE, 'utf8').split('\n').filter(Boolean);
  return raw.map(line => JSON.parse(line));
}

function writeWrongMd(records) {
  const issuesRecs = records.filter(r => (r.issues && r.issues.length) || r.error);
  const lines = [];
  lines.push(`# PDF / filename mismatches`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total PDFs scanned: ${records.length}`);
  lines.push(`Total issues found: ${issuesRecs.length}`);
  lines.push('');
  lines.push('Filename pattern: `{Level}_{SchoolCode}_{Subject}_{Type}_{Year}.pdf`');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Group: HigherChinese-mislabel, year, exam-type, subject, school, level, errors
  const buckets = {
    higherChinese: [],
    subject: [],
    year: [],
    examType: [],
    school: [],
    level: [],
    errors: [],
    other: [],
  };
  for (const r of issuesRecs) {
    if (r.error) { buckets.errors.push(r); continue; }
    const tags = r.issues.map(i => i.toLowerCase());
    if (tags.some(t => t.includes('higher chinese'))) buckets.higherChinese.push(r);
    else if (tags.some(t => t.startsWith('subject mismatch'))) buckets.subject.push(r);
    else if (tags.some(t => t.startsWith('year mismatch'))) buckets.year.push(r);
    else if (tags.some(t => t.startsWith('exam type mismatch'))) buckets.examType.push(r);
    else if (tags.some(t => t.startsWith('school mismatch'))) buckets.school.push(r);
    else if (tags.some(t => t.startsWith('level mismatch'))) buckets.level.push(r);
    else buckets.other.push(r);
  }

  function rowFor(r) {
    const p = r.parsed || {};
    const codedSchool = schoolByCode.get(p.school) || '?';
    const codedSubject = SUBJECT_FILENAME_TO_NAME[p.subject] || '?';
    const codedType = TYPE_FILENAME_TO_NAME[p.type] || '?';
    // For "actual subject", use OCR finding (incl Higher Chinese), else fall back to coded
    const actualSubject = (r.ocrInfo && r.ocrInfo.subject) || codedSubject;
    const actualSchoolName = (r.ocrInfo && r.ocrInfo.school && r.ocrInfo.school.name) || codedSchool;
    const actualSchoolCode = (r.ocrInfo && r.ocrInfo.school && r.ocrInfo.school.code) || p.school;
    const actualYear = (r.ocrInfo && r.ocrInfo.year) || p.year;
    // Refine actual exam type using full text
    const actualExamType =
      (r.text ? detectActualExamTypeFromText(r.text) : null) ||
      (r.ocrInfo && r.ocrInfo.examType) ||
      codedType;
    return { p, codedSchool, codedSubject, codedType, actualSubject, actualSchoolName, actualSchoolCode, actualYear, actualExamType };
  }

  function section(title, recs) {
    if (!recs.length) return;
    lines.push(`## ${title} (${recs.length})`);
    lines.push('');
    lines.push('| PDF | School (actual) | School Code | Subject | Year | Exam Type |');
    lines.push('|-----|-----------------|-------------|---------|------|-----------|');
    for (const r of recs) {
      const row = rowFor(r);
      lines.push(`| \`${r.file}\` | ${row.actualSchoolName} | ${row.actualSchoolCode} | ${row.actualSubject} | ${row.actualYear} | ${row.actualExamType} |`);
    }
    lines.push('');
    // Detail block
    for (const r of recs) {
      const row = rowFor(r);
      lines.push(`<details><summary>${r.file}</summary>`);
      lines.push('');
      lines.push(`- Filename codes → Level: P${row.p.level} · School: ${row.codedSchool} (${row.p.school}) · Subject: ${row.codedSubject} · Type: ${row.codedType} · Year: ${row.p.year}`);
      lines.push(`- PDF first page → School: ${row.actualSchoolName} (${row.actualSchoolCode}) · Subject: ${row.actualSubject} · Type: ${row.actualExamType} · Year: ${row.actualYear}`);
      if (r.issues && r.issues.length) {
        lines.push(`- Issues:`);
        for (const issue of r.issues) lines.push(`  - ${issue}`);
      }
      if (r.error) lines.push(`- Error: ${r.error}`);
      lines.push('');
      lines.push('</details>');
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  section('Higher Chinese mislabeled as Chinese', buckets.higherChinese);
  section('Subject mismatch', buckets.subject);
  section('Year mismatch', buckets.year);
  section('Exam type mismatch', buckets.examType);
  section('School mismatch', buckets.school);
  section('Level mismatch', buckets.level);
  section('Other / multiple issues', buckets.other);
  section('Unreadable / errors', buckets.errors);

  fs.writeFileSync(OUT_FILE, lines.join('\n'));
  console.error(`Wrote ${OUT_FILE}: ${issuesRecs.length} issues out of ${records.length} PDFs`);
}

const records = loadResults();
writeWrongMd(records);
