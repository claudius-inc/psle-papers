# SEO Completion Audit

Objective: improve SG Exam Hub visibility, keywords, Google search ranking, search-result click-through, on-site engagement, exam-paper opens, and PDF downloads.

This goal is complete only when live search and analytics evidence show improvement. Source changes and passing audits are necessary gates, not final proof.

## Success Criteria

| Requirement | Evidence required | Current artifact or check | Status |
| --- | --- | --- | --- |
| Google can discover canonical pages | Live `https://sgexamhub.com/sitemap.xml` loads, `robots.txt` points to it, sitemap contains homepage, collection pages, school pages, and viewer pages | `public/robots.txt`, `public/sitemap.xml`, `scripts/generate-sitemap.mjs`, `scripts/audit-seo-output.mjs`, `scripts/audit-live-seo.mjs` | Live verified in run `25627427402`; sitemap has `6238` URLs and `8` distinct `lastmod` dates |
| Search snippets use trustworthy titles and descriptions | Generated and live pages have canonical titles, descriptions under audit limits, official school names, no stale casing, no stale `2,200+` homepage count copy, and `data-nosnippet` on high-noise UI | `scripts/audit-seo-output.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-snippet-focused-ui.mjs`, `scripts/audit-live-school-name-quality.mjs`, `scripts/audit-live-snippet-focused-ui.mjs` | Live gate passed in run `25627427402`; fresh live homepage read showed `2,299 Papers`, not `2,200+Papers`; fresh P3 Chinese page read showed official school casing; Google snippets still need refresh |
| Sitemap freshness reflects SEO/UI snippet changes | Sitemap `lastmod` inputs include app pages, paper data, sitemap generator, and SEO normalizer scripts that materially affect rendered snippets | `scripts/generate-sitemap.mjs`, `scripts/audit-sitemap-lastmod-inputs.mjs`, `package.json`, `scripts/audit-pages-workflow.mjs` | Implemented and wired into `npm run seo:audit`; run `25627427402` passed after the gate was added |
| Keyword clusters map to preferred landing pages | GSC query clusters have one intended page and page copy/internal links support the query intent | `SEO_KEYWORD_MAP.md`, homepage directory links, broad landing pages, collection pages | Implemented; must compare against GSC page/query data |
| Search index refreshes stale snippets | Google results stop showing stale copy and school names such as `2,200+ Papers`, `Anglo chinese School (primary)`, or `Methodist Girls' School (primary)` | `SEO_REINDEX_PLAN.md`, GSC URL Inspection, sitemap resubmission, follow-up `site:` checks | Missing GSC action and refreshed Google results; search checked on 2026-05-10 still showed stale snippets from older crawls |
| Search users click through from Google | GSC shows higher organic clicks and/or CTR for target query clusters | GSC Performance export, `SEO_KEYWORD_MAP.md` review workflow | Missing outcome evidence |
| Organic users stay engaged | GA4 shows organic sessions emitting engagement events | `app/composables/useEngagementTracking.ts`, `SEO_RUNBOOK.md` GA4 checks, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs` | Instrumented and audited in source/live deploy; missing outcome evidence |
| Organic users open exam papers | GA4 organic segment shows `paper_view_click` and `paper_open` after landing pages | `app/utils/analytics.ts`, homepage/collection/viewer event sources, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs`, runbook checks | Instrumented and audited in source/live deploy; missing outcome evidence |
| Organic users download PDFs | GA4 organic segment shows `paper_download`, with useful `source` values such as `collection_hero_cta`, `index_results`, `viewer_panel`, and `viewer_mobile_sticky` | `app/utils/analytics.ts`, viewer and landing page CTAs, beacon transport, `is_conversion_event`, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs`, runbook checks | Instrumented and audited in source/live deploy; missing outcome evidence |
| Deploy pipeline protects SEO regressions | GitHub Pages build runs generate, local SEO audit, deploy, then live SEO audit | `.github/workflows/nuxtjs.yml`, `scripts/audit-pages-workflow.mjs`, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs`, `scripts/audit-sitemap-lastmod-inputs.mjs`, `SEO_RUNBOOK.md` | Run `25627427402` passed after sitemap freshness, stale-snippet, school-name, funnel, and conversion analytics gates were wired into local/live audits |
| Live viewer pages remain readable | Viewer pages separate school names and level labels, avoiding concatenated snippets like `Methodist Girls' School (Primary)P6` | `scripts/ensure-viewer-school-seo.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-live-school-name-quality.mjs` | Live verified in run `25627427402`; Google snippets still need refresh |

## Prompt-to-Artifact Checklist

| User requirement | Concrete artifact | Verification command or evidence |
| --- | --- | --- |
| Improve website visibility | Sitemap, robots, canonical metadata, indexable landing and viewer pages | GitHub Actions run `25627427402`; GSC indexed pages and refreshed snippets still pending |
| Improve SEO and keywords | Keyword map and targeted landing pages for broad, year, level, subject, school, PSLE, free, past-year, and test-paper queries | `SEO_KEYWORD_MAP.md`, generated page titles/descriptions, GSC query/page export pending |
| Improve search ranking and click-through | Page titles/descriptions aligned with target query clusters, high-noise UI excluded from snippets, stale count copy guarded, and refreshed in Google index | `SEO_REINDEX_PLAN.md`, snippet audits, GSC comparison pending |
| Keep users engaged inside the website | Engagement tracking and internal paths from landing pages to collections and viewer pages | GA4 `page_engaged_time`, `page_scroll_depth`, `page_session_summary`, collection click events pending outcome evidence; local/live guards added |
| Make users open exam papers | Visible paper cards, hero CTAs, viewer links, and `paper_open`/`paper_view_click` events | GA4 organic segment pending: `paper_view_click`, `paper_open` by landing page and source; local/live guards added |
| Make users click download | Download buttons on home, collections, broad landing pages, and viewer pages with source attribution | GA4 organic segment pending: `paper_download` by source, `is_conversion_event`, and landing page; download events use beacon transport |

## Current Gaps

1. Google search results checked on 2026-05-10 still showed stale snippets for `site:sgexamhub.com sg exam papers`, `site:sgexamhub.com "2,200+Papers"`, and `site:sgexamhub.com "Anglo chinese"`, including old homepage count copy and stale school casing. These snippets were crawled before the latest deployment.
2. The latest relevant code deployment passed: GitHub Actions run `25627427402` deployed commit `6b5a41c15cce506bb149ce0e010883e74897cd55`, and `npm run seo:audit:live` passed.
3. A fresh live homepage read after the latest deployment showed `2,299 Papers` and `2,299 PDF exam papers indexed`, not `2,200+Papers`.
4. A fresh live collection page read after the latest deployment showed official school casing such as `Anglo-Chinese School (Primary)`, `Methodist Girls' School (Primary)`, and `CHIJ Katong Primary`.
5. Conversion analytics have been hardened in source and verified in the live audit: download events use GA beacon transport and carry `is_conversion_event`; `scripts/audit-conversion-analytics.mjs` is wired into `npm run seo:audit`, `scripts/audit-live-conversion-analytics.mjs` is wired into `npm run seo:audit:live`, and both are required by `scripts/audit-pages-workflow.mjs`.
6. Follow `SEO_REINDEX_PLAN.md`: request indexing for priority URLs and resubmit `https://sgexamhub.com/sitemap.xml` in Google Search Console.
7. Local shell execution is currently unavailable in this environment, so verification for these latest documentation changes was done through the GitHub connector and live web reads rather than local commands.
8. The objective remains incomplete until GSC and GA4 show improved organic acquisition and downstream paper-open/download behavior.

## Completion Rule

Do not mark the SEO goal complete until all of these are true:

1. The latest relevant deployment after SEO/conversion commits passed build, deploy, and live SEO audits.
2. A fresh live read of `https://sgexamhub.com/` no longer shows `2,200+Papers` or any `2,200+` paper-count copy.
3. Google has refreshed stale snippets for priority URLs in `SEO_REINDEX_PLAN.md`.
4. GSC shows improved clicks, CTR, or ranking for target query clusters in `SEO_KEYWORD_MAP.md`.
5. GA4 organic traffic shows paper opens and PDF downloads from the relevant landing pages.
