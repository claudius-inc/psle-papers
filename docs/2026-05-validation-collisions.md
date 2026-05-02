# Naming collisions — manual review needed

Generated: 2026-05-01T15:01:12.097Z
Count: 0 — all resolved 🎉 (was 21)

Each row below is a PDF whose OCR-detected metadata maps to a filename that **already exists** for another PDF. This usually means one of three things:
1. **Duplicate paper** — the two PDFs are the same paper, one of which was misnamed. Pick one to keep.
2. **Both mislabeled** — neither filename is correct; the OCR-detected name belongs to a third paper.
3. **OCR error** — the detection was wrong and the original filename is fine.

| Source PDF (currently) | OCR thinks it should be | Issue |
|---|---|---|

## Resolved

| Source PDF | Action | Notes |
|---|---|---|
| `4_1244_1_2_2021.pdf` | Deleted | Duplicate of `4_5622_1_2_2021.pdf` (Nan Hua Primary School). The 1244 (Chua Chu Kang) filename was wrong and the correct paper already existed. |
| `5_7102_4_2_2021.pdf` | Renamed → `5_7102_4_3_2021.pdf` | Confirmed WA2. Target name was vacated when the original `5_7102_4_3_2021.pdf` (actually WA3) was renamed to `5_7102_4_5_2021.pdf` in the first pass. |
| `3_1217_3_2_2019.pdf` | Renamed → `3_1217_3_3_2019.pdf` | Confirmed WA2. Target was vacated by first-pass renames. |
| `5_7102_3_2_2021.pdf` | Renamed → `5_7102_3_3_2021.pdf` | Confirmed WA2. Target was vacated when original `5_7102_3_3_2021.pdf` (actually WA3) was renamed to `5_7102_3_5_2021.pdf` in the first pass. |
| `3_1073_2_1_2023.pdf` | Renamed → `3_1073_2_6_2023.pdf` | Mock Paper for SA2 prep, not an actual SA2. Used new exam-type code `6` (Practice Paper) added to dropdownOptions. |
| `2_5001_3_2_2019.pdf` | Renamed → `2_5001_3_6_2019.pdf` | Revision paper (SA2 prep), not an actual SA1/SA2. Marked as Practice Paper (code 6). |
| `3_1073_4_4_2022.pdf` | Deleted | Duplicate of `3_1073_4_4_2020.pdf`. The 2022 filename was wrong — actual year is 2020 and the correct paper already existed. |
| `3_1121_3_1_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive (likely matched `2024` from a printed date elsewhere on cover, e.g. an updated form template). |
| `3_5026_1_4_2019.pdf` | Deleted | Duplicate of `3_5026_1_2_2019.pdf` (actually SA1, not SA2 as the original filename claimed). |
| `3_5214_1_1_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `3_5240_4_1_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `5_5638_2_3_2023.pdf` | No action — filename correct | Verified: actual level is P5. Cover title says "PRIMARY FIVE"; OCR matched "Primary6" from a class-label form field (false positive). |
| `5_5027_3_1_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `5_5240_4_4_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `5_5622_3_4_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `5_5622_4_4_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `5_1073_1_1_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `3_5258_1_3_2021.pdf` → `3_5258_1_5_2021.pdf` | Renamed (chain step 1) | Confirmed by user: this paper is actually WA3, not WA2 as the old filename claimed. |
| `3_5258_1_2_2021.pdf` → `3_5258_1_3_2021.pdf` | Renamed (chain step 2) | Confirmed by user: this paper is actually WA2, not SA1. Target slot was vacated by step 1 above. |
| `3_5622_4_1_2021.pdf` | No action — filename correct | Verified: actual year is 2021. OCR false positive. |
| `4_1073_1_2_2019.pdf` | No action — filename correct | Verified: actual exam type is SA1 (Semestral Assessment 1). OCR false positive. |
| `3_1077_3_1_2024.pdf` | Deleted | Cover page unclear (no year, content nearly identical to `3_1077_3_3_2024.pdf` which is the kept WA2). Removed to avoid ambiguity. |
| `2_5638_4_1_2021.pdf` → `3_5638_4_1_2021.pdf` | Reverted (auto-rename undone) | First-pass auto-rename took P3→P2 because cover title said "PRIMARY 2", but the class field "3.6" indicates P3. Confirmed: actual level is P3 (P2 paper used by P3 class for review). |
| `3_5638_4_1_2021.pdf` → `3_5001_4_1_2021.pdf` | Renamed (school correction) | OCR cover says "Anglo-Chinese School (Junior)" = code 5001. Original filename had 5638 (ACS Primary) which is a different school. |
| `3_5638_4_3_2024.pdf` → `4_5638_4_3_2024.pdf` | Reverted (auto-rename undone) | First-pass auto-rename took P4→P3 because OCR text contains "Primary Three topic" (a reference to a P3 topic recalled in this P4 paper). Cover says "2024 P4 Science", "Class: P4". Confirmed P4. |
| `4_5001_1_2_2018.pdf` → `4_5001_1_2_2019.pdf` | Reverted (auto-rename undone) | OCR-detected year 2018 was a false positive (likely incidental "founded XXXX" or similar date on cover). Filename year 2019 is correct. |
| `5_5026_1_2_2018.pdf` → `5_5026_1_2_2019.pdf` | Reverted (auto-rename undone) | Same as above — OCR false positive on year. |
| `4_1121_3_3_2017.pdf` → `4_1121_3_3_2021.pdf` | Reverted (auto-rename undone) | OCR year 2017 was a false positive (likely picked up from a math problem in the body text). Filename year 2021 is correct. |
| `5_1073_3_1_2027.pdf` → `5_1073_3_1_2021.pdf` | Reverted (auto-rename undone) | OCR year 2027 is impossible (future). Filename year 2021 is correct. |
| `6_1077_4_4_2026.pdf` → `6_1077_4_4_2020.pdf` | Reverted (auto-rename undone) | OCR year 2026 is impossible (future). Filename year 2020 is correct. |
