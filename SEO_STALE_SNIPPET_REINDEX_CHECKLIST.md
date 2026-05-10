# Stale Snippet Reindex Checklist

Use this checklist when the live site is clean but Google still shows old SG Exam Hub snippets.

## Current Stale Evidence

Checked on 2026-05-10 after deployment run `25630256022` for commit `8132dc9546e39e2006eaace12a77d4473a5d3b77`:

- `site:sgexamhub.com sg exam papers` still showed old homepage copy such as `2,200+Papers` and stale school casing.
- `site:sgexamhub.com "2,200+Papers"` still returned the stale homepage snippet.
- `site:sgexamhub.com "Anglo chinese"` still returned stale collection snippets.
- `site:sgexamhub.com "primary 3 chinese exam papers"` still showed `/exam-papers/primary-3-chinese` with old casing such as `Anglo chinese School (primary)`.
- `site:sgexamhub.com sg exam papers` still showed the old homepage title and the stale `Latest exam papers` snippet list from before the latest `data-nosnippet` fix.
- Result crawl labels showed old crawls, such as 2-4 days before the latest deployment, so this remains an index refresh issue.

Fresh live reads on 2026-05-10 showed the deployed pages are already corrected:

- `https://sgexamhub.com/` has `2,299 PDF exam papers indexed` and no `2,200+` or `2,300+` paper-count copy.
- `https://sgexamhub.com/` has `data-nosnippet` on the homepage `Latest exam papers` list, so Google should stop using that noisy list after recrawl.
- `https://sgexamhub.com/exam-papers/primary-3-chinese/` has `Primary 3 Chinese Exam Papers Free PDF Download`, `Download PDF`, `Anglo-Chinese School (Primary)`, `Methodist Girls' School (Primary)`, and `CHIJ Katong Primary`.
- `https://sgexamhub.com/exam-papers/primary-3/` has `Primary 3 Exam Papers Free PDF Download`.
- `https://sgexamhub.com/exam-papers/chinese/` has `Chinese Exam Papers Free PDF Download`.
- `https://sgexamhub.com/og-image.png` matches the committed manifest hash and OCR reads `2,299 PDF papers`.

## Preflight Before Requesting Indexing

Before using Google Search Console, confirm the latest deployment has passed these gates:

1. GitHub Pages workflow completed for the latest SEO commit.
2. `npm run seo:audit:live` passed.
3. The live stale-snippet gate is wired into `seo:audit:live`:
   - `node scripts/audit-live-stale-snippet-pages.mjs`
4. The live social preview image freshness gate is wired into `seo:audit:live`:
   - `node scripts/audit-live-og-image.mjs`
5. The live sitemap freshness gate includes the stale-snippet pages:
   - `/exam-papers/chinese`
   - `/exam-papers/primary-3`
   - `/exam-papers/primary-3-chinese`
6. `https://sgexamhub.com/robots.txt` points to `https://sgexamhub.com/sitemap.xml`.

## URL Inspection Priority

In Google Search Console, inspect each URL and click `Request indexing` when the live test shows the current page:

1. `https://sgexamhub.com/`
2. `https://sgexamhub.com/exam-papers/primary-3-chinese/`
3. `https://sgexamhub.com/exam-papers/primary-3/`
4. `https://sgexamhub.com/exam-papers/chinese/`
5. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-primary/`
6. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-junior/`
7. `https://sgexamhub.com/exam-papers/school-methodist-girls-school-primary/`
8. `https://sgexamhub.com/sitemap.xml`

After URL inspection requests, resubmit `https://sgexamhub.com/sitemap.xml` in the GSC Sitemaps report.

## Search Recheck Queries

Recheck these queries 24-72 hours after URL Inspection requests, then again after 7 days:

```text
site:sgexamhub.com sg exam papers
site:sgexamhub.com "2,200+Papers"
site:sgexamhub.com "2,300+"
site:sgexamhub.com "Anglo chinese"
site:sgexamhub.com "primary-3-chinese" "Anglo chinese"
site:sgexamhub.com "primary 3 chinese exam papers"
site:sgexamhub.com "Primary 3 Chinese Exam Papers Free PDF Download"
site:sgexamhub.com "Anglo-Chinese School (Primary)" "Download PDF"
site:sgexamhub.com "Methodist Girls' School (Primary)" "Download PDF"
```

## Freshness Pass Criteria

The stale-snippet issue is not resolved until Google results meet all of these:

- No SG Exam Hub result shows `2,200+Papers`, `2,200+`, or `2,300+` as homepage paper-count copy.
- No priority result shows `Anglo chinese`, `Methodist Girls' School (primary)`, or `Chij (katong) Primary`.
- `/exam-papers/primary-3-chinese/` appears with `Primary 3 Chinese Exam Papers Free PDF Download` or equivalent current title text.
- Search snippets emphasize free PDF viewing/downloads rather than old generic browse copy.

## Outcome Evidence To Capture

After Google refreshes snippets, record these metrics from GSC and GA4.

GSC Performance, compare next 7/14/28 days against the previous matching period:

- Queries: `sg exam papers`, `singapore primary school exam papers`, `primary 3 chinese exam papers`, `chinese exam papers`, `anglo chinese school primary exam papers`, `methodist girls school primary exam papers`.
- Metrics: clicks, impressions, CTR, average position.
- Pages: `/`, `/exam-papers/primary-3-chinese/`, `/exam-papers/primary-3/`, `/exam-papers/chinese/`, and priority school pages.

GA4, segment by Organic Search or `is_google_referrer = true`:

- Landing pages: `/`, `/exam-papers/primary-3-chinese/`, `/exam-papers/primary-3/`, `/exam-papers/chinese/`.
- Engagement events: `page_engaged_time`, `page_scroll_depth`, `page_session_summary`.
- Paper actions: `paper_view_click`, `paper_open`, `paper_download`.
- CTA source values: `collection_hero_cta`, `collection_mobile_sticky`, `index_results`, `viewer_panel`, `viewer_mobile_sticky`.

Run the exported outcome evidence through:

```sh
npm run seo:outcomes -- \
  --gsc-before reports/seo/gsc-before.csv \
  --gsc-after reports/seo/gsc-after.csv \
  --ga4 reports/seo/ga4-organic-events.csv \
  --out reports/seo/outcome-report.md
```

Do not mark the SEO goal complete until GSC shows refreshed snippets and improved organic search performance, and GA4 shows organic users opening papers and downloading PDFs.
