#!/usr/bin/env node
// Reads .validate-results.jsonl (full OCR text), re-runs detection with improved
// regexes, recomputes issues, and writes back the same JSONL file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const RESULTS_FILE = path.join(ROOT, '.validate-results.jsonl');

const opts = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/json/dropdownOptions.json'), 'utf8'));
const schoolByCode = new Map(opts.School.map(s => [s.code, s.name]));

const SUBJECT_FILENAME_TO_NAME = { '1': 'English', '2': 'Chinese', '3': 'Mathematics', '4': 'Science' };
const TYPE_FILENAME_TO_NAME = { '1': 'WA1', '2': 'SA1', '3': 'WA2', '4': 'SA2', '5': 'WA3' };

function detectSubject(text) {
  if (/HIGHER\s*CHINESE|高级华文|高級華文|HCL\b/i.test(text)) return 'Higher Chinese';

  // Strip ambiguous tokens that don't indicate paper subject.
  let s = text
    .replace(/ANGLO[\s\-]?CHINESE/gi, '')
    .replace(/SINO[\s\-]?CHINESE/gi, '')
    .replace(/CHINESE\s+(?:GIRLS|HIGH|SCHOOL|YEW)/gi, '')
    .replace(/CATHOLIC\s+HIGH/gi, '')
    .replace(/SCIENCE\s+(?:TEACHER|TEACHERS|ROOM|LAB)/gi, '');

  // Strong title-style indicators (weight 5)
  const englishTitle = (s.match(/ENGLISH\s+LANGUAGE/gi) || []).length;
  const chineseTitle = (s.match(/CHINESE\s+LANGUAGE/gi) || []).length;
  const mathTitle = (s.match(/MATHEMATICS/gi) || []).length;
  const scienceTitle = (s.match(/\bSCIENCE\b/gi) || []).length;

  // Native-language characters (weight 3)
  const chineseChars = (s.match(/华文|中文|華文|语文|語文/g) || []).length;
  const mathChars = (s.match(/数学|數學/g) || []).length;
  const scienceChars = (s.match(/科学|科學/g) || []).length;
  const englishChars = (s.match(/英文|英语|英語/g) || []).length;

  // Bare keywords (weight 1)
  const englishWeak = (s.match(/\bENGLISH\b/gi) || []).length - englishTitle;
  const chineseWeak = (s.match(/\bCHINESE\b/gi) || []).length - chineseTitle;

  const counts = {
    'English': englishTitle * 5 + englishChars * 3 + englishWeak,
    'Chinese': chineseTitle * 5 + chineseChars * 3 + chineseWeak,
    'Mathematics': mathTitle * 5 + mathChars * 3,
    'Science': scienceTitle * 5 + scienceChars * 3,
  };

  let best = null, bestCount = 0;
  for (const [subj, c] of Object.entries(counts)) {
    if (c > bestCount) { best = subj; bestCount = c; }
  }
  // Require at least one strong-title-or-native hit (weight >= 3) to return a subject.
  return bestCount >= 3 ? best : null;
}

function detectExamType(text) {
  const t = text.toUpperCase();
  if (/\bPRELIM(?:INARY)?\b/.test(t)) return 'Preliminary';
  if (
    /(?:SECOND|2ND|TWO|II)\s+SEMESTRAL\s+ASSESSMENT/.test(t) ||
    /SEMESTRAL\s+ASSESSMENT\s+(?:TWO|II|2)\b/.test(t) ||
    /END[\s\-]?OF[\s\-]?YEAR/.test(t) || /\bEOY\b/.test(t) ||
    /\bSA\s*2\b/.test(t) || /\bSA2\b/.test(t)
  ) return 'SA2';
  if (
    /(?:FIRST|1ST|ONE|I)\s+SEMESTRAL\s+ASSESSMENT/.test(t) ||
    /SEMESTRAL\s+ASSESSMENT\s+(?:ONE|I|1)\b/.test(t) ||
    /MID[\s\-]?YEAR/.test(t) ||
    /\bSA\s*1\b/.test(t) || /\bSA1\b/.test(t)
  ) return 'SA1';
  // NOTE: "Term N Weighted Assessment" is intentionally NOT mapped here — different
  // schools number their WAs differently relative to terms (e.g. some schools call
  // their Term 3 WA "WA2" because Term 2 holds SA1). We only trust ordinal labels.
  if (
    /(?:THIRD|3RD|THREE|III)\s+(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT/.test(t) ||
    /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:THREE|III|3)\b/.test(t) ||
    /\bWA\s*3\b/.test(t) || /\bWA3\b/.test(t) ||
    /\bCA\s*3\b/.test(t) || /\bCA3\b/.test(t)
  ) return 'WA3';
  if (
    /(?:SECOND|2ND|TWO|II)\s+(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT/.test(t) ||
    /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:TWO|II|2)\b/.test(t) ||
    /\bWA\s*2\b/.test(t) || /\bWA2\b/.test(t) ||
    /\bCA\s*2\b/.test(t) || /\bCA2\b/.test(t)
  ) return 'WA2';
  if (
    /(?:FIRST|1ST|ONE|I)\s+(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT/.test(t) ||
    /(?:WEIGHTED|CONTINUAL)\s+ASSESSMENT\s+(?:ONE|I|1)\b/.test(t) ||
    /\bWA\s*1\b/.test(t) || /\bWA1\b/.test(t) ||
    /\bCA\s*1\b/.test(t) || /\bCA1\b/.test(t)
  ) return 'WA1';
  return null;
}

function detectLevel(text) {
  const map = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5, SIX: 6 };
  const t = text.toUpperCase();
  const counts = new Map();
  function bump(n, w = 1) { if (!n) return; counts.set(n, (counts.get(n) || 0) + w); }
  for (const m of t.matchAll(/PRIMARY\s*([1-6])(?!\d)/g)) bump(m[1], 3);
  for (const m of t.matchAll(/PRIMARY\s+(ONE|TWO|THREE|FOUR|FIVE|SIX)/g)) bump(String(map[m[1]]), 3);
  for (const m of t.matchAll(/\bP\s*([1-6])(?!\d)\b/g)) bump(m[1], 1);
  for (const m of t.matchAll(/\bPR\.?\s*([1-6])(?!\d)\b/g)) bump(m[1], 1);
  for (const m of t.matchAll(/\bPRI\.?\s*([1-6])(?!\d)\b/g)) bump(m[1], 1);
  for (const m of text.matchAll(/小学\s*([一二三四五六])\s*年级/g)) {
    const cn = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6 };
    bump(String(cn[m[1]]), 3);
  }
  for (const m of text.matchAll(/([一二三四五六])\s*年级/g)) {
    const cn = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6 };
    bump(String(cn[m[1]]), 2);
  }
  if (!counts.size) return null;
  let best = null, bestCount = -1;
  for (const [lvl, c] of counts) {
    if (c > bestCount) { best = lvl; bestCount = c; }
  }
  return best;
}

function detectYear(text) {
  const matches = [...text.matchAll(/\b(20(1[7-9]|2[0-7]))\b/g)].map(m => m[1]);
  if (!matches.length) return null;
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

function detectSchool(text) {
  const norm = normalizeForMatch(text);
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
  return bestMatch;
}

function compare(parsed, ocrInfo) {
  const issues = [];
  const expectedSchool = schoolByCode.get(parsed.school);
  const expectedSubject = SUBJECT_FILENAME_TO_NAME[parsed.subject];
  const expectedType = TYPE_FILENAME_TO_NAME[parsed.type];
  const expectedYear = parsed.year;
  const expectedLevel = parsed.level;

  if (ocrInfo.subject) {
    if (ocrInfo.subject === 'Higher Chinese' && expectedSubject === 'Chinese') {
      issues.push(`subject is Higher Chinese (filename codes Chinese)`);
    } else if (ocrInfo.subject !== expectedSubject) {
      issues.push(`subject mismatch: PDF says ${ocrInfo.subject}, filename codes ${expectedSubject}`);
    }
  }

  if (ocrInfo.year && ocrInfo.year !== expectedYear) {
    issues.push(`year mismatch: PDF says ${ocrInfo.year}, filename codes ${expectedYear}`);
  }

  if (ocrInfo.examType) {
    const looksLikeMatch = ocrInfo.examType === expectedType ||
      (ocrInfo.examType === 'Preliminary' && expectedType === 'SA2');
    if (!looksLikeMatch) {
      issues.push(`exam type mismatch: PDF says ${ocrInfo.examType}, filename codes ${expectedType}`);
    }
  }

  if (ocrInfo.level && ocrInfo.level !== expectedLevel) {
    issues.push(`level mismatch: PDF says P${ocrInfo.level}, filename codes P${expectedLevel}`);
  }

  if (ocrInfo.school && ocrInfo.school.code !== parsed.school) {
    issues.push(`school mismatch: PDF says ${ocrInfo.school.name} (${ocrInfo.school.code}), filename codes ${expectedSchool} (${parsed.school})`);
  }

  return issues;
}

const records = fs.readFileSync(RESULTS_FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
console.error(`Loaded ${records.length} records`);

const out = [];
let mismatched = 0;
for (const r of records) {
  if (r.error) { out.push(r); continue; }
  const text = r.text || '';
  const ocrInfo = {
    subject: detectSubject(text),
    examType: detectExamType(text),
    level: detectLevel(text),
    year: detectYear(text),
    school: detectSchool(text),
  };
  const issues = compare(r.parsed, ocrInfo);
  if (issues.length) mismatched++;
  out.push({ ...r, ocrInfo, issues });
}

fs.writeFileSync(RESULTS_FILE, out.map(r => JSON.stringify(r)).join('\n') + '\n');
console.error(`Re-detected. mismatched=${mismatched} of ${records.length}`);
