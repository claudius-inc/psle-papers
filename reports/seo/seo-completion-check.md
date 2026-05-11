# SEO Completion Check

Status: INCOMPLETE

## Objective

Improve website visibility, SEO, keywords, search ranking, Google click-through, on-site engagement, exam-paper opens, and PDF downloads.

## Required Evidence

- GSC URL Inspection requests are complete for priority pages.
- Public Google snippets are fresh and no longer show stale counts, casing, or noisy paper-list snippets.
- GSC exports show improved organic clicks or CTR for target keyword clusters.
- GA4 organic exports show landing-page engagement, collection-path clicks with target_path values, paper opens, PDF previews, and PDF downloads.

## Checks

| Check | Command | Status | Exit code |
| --- | --- | --- | ---: |
| GSC URL Inspection requests | `npm run seo:reindex-status -- --fail-on-pending` | INCOMPLETE | 1 |
| Public Google snippet freshness | `npm run seo:snippet-status -- --fail-on-stale` | INCOMPLETE | 1 |
| GSC and GA4 organic outcome evidence | `npm run seo:outcomes -- --gsc-before reports/seo/gsc-before.csv --gsc-after reports/seo/gsc-after.csv --ga4 reports/seo/ga4-organic-events.csv --out reports/seo/outcome-report.md` | INCOMPLETE | 1 |

## Details

### GSC URL Inspection requests

Command: `npm run seo:reindex-status -- --fail-on-pending`

Stdout:

```text
> seo:reindex-status
> node scripts/analyze-gsc-reindex-tracker.mjs --fail-on-pending

Wrote reports/seo/gsc-url-inspection-status.md
GSC URL Inspection status: 0/29 complete, 29 incomplete.
```

Stderr: _(none)_

### Public Google snippet freshness

Command: `npm run seo:snippet-status -- --fail-on-stale`

Stdout:

```text
> seo:snippet-status
> node scripts/analyze-google-snippet-tracker.mjs --fail-on-stale

Wrote reports/seo/google-snippet-recheck-status.md
Google snippet recheck status: 0/18 fresh, 18 incomplete.
```

Stderr: _(none)_

### GSC and GA4 organic outcome evidence

Command: `npm run seo:outcomes -- --gsc-before reports/seo/gsc-before.csv --gsc-after reports/seo/gsc-after.csv --ga4 reports/seo/ga4-organic-events.csv --out reports/seo/outcome-report.md`

Stdout:

```text
> seo:outcomes
> node scripts/analyze-seo-outcomes.mjs --gsc-before reports/seo/gsc-before.csv --gsc-after reports/seo/gsc-after.csv --ga4 reports/seo/ga4-organic-events.csv --out reports/seo/outcome-report.md
```

Stderr:

```text
Missing --gsc-before file: reports/seo/gsc-before.csv

Usage:
  node scripts/analyze-seo-outcomes.mjs --gsc-before <csv> --gsc-after <csv> --ga4 <csv> [--out <md>]

Inputs:
  --gsc-before  Google Search Console Performance export for the baseline period.
  --gsc-after   Google Search Console Performance export for the comparison period.
  --ga4         GA4 event export filtered to Organic Search, or with source/medium columns.
  --out         Optional markdown report path. Defaults to stdout only.

Expected GSC columns include query, page, clicks, impressions, CTR, and average position.
Expected GA4 columns include event name, landing page, and event count, with optional source/medium, source, collection_title, school_name, and target_path.

Every GA4 outcome row must include landing page values so the report proves organic users arrived through relevant site entry pages.
Collection-path click evidence must include target_path values so the report proves organic users continued into specific paper collections.
```

## Completion Rule

Do not mark the SEO objective complete until this command reports PASS.

