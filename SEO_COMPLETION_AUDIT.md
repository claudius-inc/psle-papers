# SEO Completion Audit

Objective: improve SG Exam Hub visibility, keywords, Google search ranking, search-result click-through, on-site engagement, exam-paper opens, and PDF downloads.

This goal is complete only when live search and analytics evidence show improvement. Source changes and passing audits are necessary gates, not final proof.

## Success Criteria

| Requirement | Evidence required | Current artifact or check | Status |
| --- | --- | --- | --- |
| Google can discover canonical pages | Live `https://sgexamhub.com/sitemap.xml` loads, `robots.txt` points to it, sitemap contains homepage, collection pages, school pages, and viewer pages | `public/robots.txt`, `public/sitemap.xml`, `scripts/generate-sitemap.mjs`, `scripts/audit-seo-output.mjs`, `scripts/audit-live-seo.mjs` | Live verified in run `25627663313` (`#240`) for commit `87fe57b01f7b35e3b1cbd3b96f0d4d999487cb9c`; sitemap had `6238` URLs and `8` distinct `lastmod` dates |
| Search snippets use trustworthy titles and descriptions | Generated and live pages have canonical titles, descriptions under audit limits, official school names, no stale casing, no stale `2,200+`/`2,300+` homepage count copy, and `data-nosnippet` on high-noise UI | `scripts/audit-seo-output.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-snippet-focused-ui.mjs`, `scripts/audit-live-school-name-quality.mjs`, `scripts/audit-live-snippet-focused-ui.mjs`, `scripts/audit-live-stale-snippet-pages.mjs` | Source gates now cover the stale homepage and P3 Chinese snippet cluster; latest source head is `37e354854c0c52b41ad5a793ffef45a63a8cfc48`; latest deployment for these newer gates is not verified |
| Sitemap freshness reflects SEO/UI snippet changes | Sitemap `lastmod` inputs include app pages, paper data, sitemap generator, and SEO normalizer scripts that materially affect rendered snippets | `scripts/generate-sitemap.mjs`, `scripts/audit-sitemap-lastmod-inputs.mjs`, `scripts/audit-sitemap-lastmod-output.mjs`, `scripts/audit-live-sitemap-lastmod-output.mjs`, `package.json`, `scripts/audit-pages-workflow.mjs` | Implemented; source gates now include stale-snippet URLs `/exam-papers/chinese`, `/exam-papers/primary-3`, and `/exam-papers/primary-3-chinese`; latest deployment not verified |
| Structured data is valid on live pages | Live JSON-LD parses and includes search, collection, FAQ, how-to, learning resource, and download action signals on representative pages | `scripts/audit-seo-output.mjs`, `scripts/audit-live-jsonld.mjs`, `package.json` | Source gate added and wired into `seo:audit:live`; latest deployment not verified |
| Keyword clusters map to preferred landing pages | GSC query clusters have one intended page and page copy/internal links support the query intent | `SEO_KEYWORD_MAP.md`, homepage directory links, broad landing pages, collection pages, `SEO_RUNBOOK.md`, `SEO_STALE_SNIPPET_REINDEX_CHECKLIST.md` | Implemented; must compare against GSC page/query data |
| Search index refreshes stale snippets | Google results stop showing stale copy and school names such as `2,200+ Papers`, `2,300+`, `Anglo chinese School (primary)`, or `Methodist Girls' School (primary)` | `SEO_REINDEX_PLAN.md`, `SEO_STALE_SNIPPET_REINDEX_CHECKLIST.md`, GSC URL Inspection, sitemap resubmission, follow-up `site:` checks | Missing GSC action and refreshed Google results; search checked on 2026-05-10 still showed stale snippets from older crawls |
| Search users click through from Google | GSC shows higher organic clicks and/or CTR for target query clusters | GSC Performance export, `SEO_KEYWORD_MAP.md` review workflow | Missing outcome evidence |
| Organic users stay engaged | GA4 shows organic sessions emitting engagement events | `app/composables/useEngagementTracking.ts`, `SEO_RUNBOOK.md` GA4 checks, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs` | Instrumented and audited in source/live deploy; missing outcome evidence |
| Organic users open exam papers | GA4 organic segment shows `paper_view_click` and `paper_open` after landing pages | `app/utils/analytics.ts`, homepage/collection/viewer event sources, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs`, runbook checks | Instrumented; missing outcome evidence |
| Organic users download PDFs | GA4 organic segment shows `paper_download`, with useful `source` values such as `collection_hero_cta`, `collection_mobile_sticky`, `index_results`, `viewer_panel`, and `viewer_mobile_sticky` | `app/utils/analytics.ts`, viewer and landing page CTAs, beacon transport, `is_conversion_event`, `scripts/audit-conversion-analytics.mjs`, `scripts/audit-live-conversion-analytics.mjs`, runbook checks | Instrumented; latest mobile source hardening not verified in deployment; missing outcome evidence |
| Deploy pipeline protects SEO regressions | GitHub Pages build runs generate, local SEO audit, deploy, then live SEO audit | `.github/workflows/nuxtjs.yml`, `scripts/audit-pages-workflow.mjs`, `package.json`, live audit scripts, `SEO_RUNBOOK.md` | Run `25627663313` passed for commit `87fe57b`; newer source gates through `37e3548` need deployment verification |
| Live viewer pages remain readable | Viewer pages separate school names and level labels, avoiding concatenated snippets like `Methodist Girls' School (Primary)P6` | `scripts/ensure-viewer-school-seo.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-live-school-name-quality.mjs` | Source and live gates hardened; latest deployment not verified; Google snippets still need refresh |

## Prompt-to-Artifact Checklist

| User requirement | Concrete artifact | Verification command or evidence |
| --- | --- | --- |
| Improve website visibility | Sitemap, robots, canonical metadata, indexable landing and viewer pages | Latest fully verified deployment: run `25627663313` for commit `87fe57b`; latest source head `37e3548` pending deployment verification |
| Improve SEO and keywords | Keyword map and targeted landing pages for broad, year, level, subject, school, PSLE, free, past-year, test-paper, and P3/Chinese stale-snippet queries | `SEO_KEYWORD_MAP.md`, `SEO_RUNBOOK.md`, `SEO_STALE_SNIPPET_REINDEX_CHECKLIST.md`, generated page titles/descriptions, GSC query/page export pending |
| Improve search ranking and click-through | Page titles/descriptions aligned with target query clusters, high-noise UI excluded from snippets, stale count/casing guarded, and refreshed in Google index | `SEO_REINDEX_PLAN.md`, snippet audits, stale-snippet checklist, GSC comparison pending |
| Keep users engaged inside the website | Engagement tracking and internal paths from landing pages to collections and viewer pages | GA4 `page_engaged_time`, `page_scroll_depth`, `page_session_summary`, collection click events pending outcome evidence; local/live guards added |
| Make users open exam papers | Visible paper cards, hero CTAs, viewer links, and `paper_open`/`paper_view_click` events | GA4 organic segment pending: `paper_view_click`, `paper_open` by landing page and source; local/live guards added |
| Make users click download | Download buttons on home, collections, broad landing pages, and viewer pages with source attribution | GA4 organic segment pending: `paper_download` by source, `is_conversion_event`, and landing page; download events use beacon transport |

## Current State

1. Latest source head inspected through GitHub connector: `37e354854c0c52b41ad5a793ffef45a63a8cfc48` (`Link stale snippet reindex checklist`).
2. Latest fully verified deployment evidence remains GitHub Actions run `25627663313` (`#240`) for commit `87fe57b01f7b35e3b1cbd3b96f0d4d999487cb9c`, which passed build, deploy, and live SEO audits.
3. Newer source commits after `87fe57b` add sitemap lastmod output audits, live JSON-LD parsing, stale-snippet page checks, mobile CTA source attribution, and focused GSC checklist documentation. Their deployment is not verified in this environment.
4. Fresh live homepage and P3 Chinese page reads after the earlier deployment showed corrected count and school casing.
5. Google search results checked on 2026-05-10 still showed stale snippets for `site:sgexamhub.com sg exam papers`, `site:sgexamhub.com "2,200+Papers"`, and `site:sgexamhub.com "Anglo chinese"`, including old homepage count copy and stale school casing.
6. Follow `SEO_STALE_SNIPPET_REINDEX_CHECKLIST.md` and `SEO_REINDEX_PLAN.md`: verify latest deploy, request indexing for priority URLs, and resubmit `https://sgexamhub.com/sitemap.xml` in Google Search Console.
7. Local shell execution is currently unavailable in this environment, so verification for latest changes was done through the GitHub connector and live web reads rather than local commands.
8. The objective remains incomplete until GSC and GA4 show improved organic acquisition and downstream paper-open/download behavior.

## Completion Rule

Do not mark the SEO goal complete until all of these are true:

1. The latest relevant deployment after SEO/conversion commits passed build, deploy, and live SEO audits.
2. A fresh live read of `https://sgexamhub.com/` no longer shows `2,200+Papers`, `2,200+`, or `2,300+` paper-count copy.
3. Google has refreshed stale snippets for priority URLs in `SEO_REINDEX_PLAN.md` and `SEO_STALE_SNIPPET_REINDEX_CHECKLIST.md`.
4. GSC shows improved clicks, CTR, or ranking for target query clusters in `SEO_KEYWORD_MAP.md`.
5. GA4 organic traffic shows engagement, paper opens, and PDF downloads from the relevant landing pages.
