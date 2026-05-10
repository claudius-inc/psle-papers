# SEO Completion Audit

Objective: improve SG Exam Hub visibility, keywords, Google search ranking, search-result click-through, on-site engagement, exam-paper opens, and PDF downloads.

This goal is complete only when live search and analytics evidence show improvement. Source changes and passing audits are necessary gates, not final proof.

## Success Criteria

| Requirement | Evidence required | Current artifact or check | Status |
| --- | --- | --- | --- |
| Google can discover canonical pages | Live `https://sgexamhub.com/sitemap.xml` loads, `robots.txt` points to it, sitemap contains homepage, collection pages, school pages, and viewer pages | `public/robots.txt`, `public/sitemap.xml`, `scripts/generate-sitemap.mjs`, `scripts/audit-seo-output.mjs`, `scripts/audit-live-seo.mjs` | Live verified in run `25626208854`; sitemap has `6238` URLs and `8` distinct `lastmod` dates |
| Search snippets use trustworthy titles and descriptions | Generated and live pages have canonical titles, descriptions under audit limits, official school names, no stale casing, no stale `2,200+` homepage count copy, and `data-nosnippet` on high-noise UI | `scripts/audit-seo-output.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-snippet-focused-ui.mjs`, `scripts/audit-live-school-name-quality.mjs`, `scripts/audit-live-snippet-focused-ui.mjs` | Incomplete: a 2026-05-10 live read still found rendered `2,200+Papers`; stricter guards are committed in `410ed3f`, `1426108`, and `99fdf9b`, pending a passing deploy/live audit |
| Keyword clusters map to preferred landing pages | GSC query clusters have one intended page and page copy/internal links support the query intent | `SEO_KEYWORD_MAP.md`, homepage directory links, broad landing pages, collection pages | Implemented; must compare against GSC page/query data |
| Search index refreshes stale snippets | Google results stop showing stale copy and school names such as `2,200+ Papers`, `Anglo chinese School (primary)`, or `Methodist Girls' School (primary)` | `SEO_REINDEX_PLAN.md`, GSC URL Inspection, sitemap resubmission, follow-up `site:` checks | Missing post-fix deployment, GSC action, and refreshed results |
| Search users click through from Google | GSC shows higher organic clicks and/or CTR for target query clusters | GSC Performance export, `SEO_KEYWORD_MAP.md` review workflow | Missing outcome evidence |
| Organic users stay engaged | GA4 shows organic sessions emitting engagement events | `app/composables/useEngagementTracking.ts`, `SEO_RUNBOOK.md` GA4 checks | Instrumented; missing outcome evidence |
| Organic users open exam papers | GA4 organic segment shows `paper_view_click` and `paper_open` after landing pages | `app/utils/analytics.ts`, homepage/collection/viewer event sources, runbook checks | Instrumented; missing outcome evidence |
| Organic users download PDFs | GA4 organic segment shows `paper_download`, with useful `source` values such as `collection_hero_cta`, `index_results`, `viewer_panel`, and `viewer_mobile_sticky` | `app/utils/analytics.ts`, viewer and landing page CTAs, runbook checks | Instrumented; missing outcome evidence |
| Deploy pipeline protects SEO regressions | GitHub Pages build runs generate, local SEO audit, deploy, then live SEO audit | `.github/workflows/nuxtjs.yml`, `scripts/audit-pages-workflow.mjs`, `SEO_RUNBOOK.md` | Prior run `25626208854` passed, but audit coverage was weak for rendered stale count; stricter audit deploy is pending |
| Live viewer pages remain readable | Viewer pages separate school names and level labels, avoiding concatenated snippets like `Methodist Girls' School (Primary)P6` | `scripts/ensure-viewer-school-seo.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-live-school-name-quality.mjs` | Live verified in run `25626208854`; Google snippets still need refresh |

## Prompt-to-Artifact Checklist

| User requirement | Concrete artifact | Verification command or evidence |
| --- | --- | --- |
| Improve website visibility | Sitemap, robots, canonical metadata, indexable landing and viewer pages | GitHub Actions run `25626208854`; stricter post-`99fdf9b` deploy/live audit pending; GSC indexed pages still pending |
| Improve SEO and keywords | Keyword map and targeted landing pages for broad, year, level, subject, school, PSLE, free, past-year, and test-paper queries | `SEO_KEYWORD_MAP.md`, generated page titles/descriptions, GSC query/page export pending |
| Improve search ranking and click-through | Page titles/descriptions aligned with target query clusters, high-noise UI excluded from snippets, stale count copy guarded, and refreshed in Google index | `SEO_REINDEX_PLAN.md`, snippet audits, GSC comparison pending |
| Keep users engaged inside the website | Engagement tracking and internal paths from landing pages to collections and viewer pages | GA4 `page_engaged_time`, `page_scroll_depth`, `page_session_summary`, collection click events pending outcome evidence |
| Make users open exam papers | Visible paper cards, hero CTAs, viewer links, and `paper_open`/`paper_view_click` events | GA4 organic segment pending: `paper_view_click`, `paper_open` by landing page and source |
| Make users click download | Download buttons on home, collections, broad landing pages, and viewer pages with source attribution | GA4 organic segment pending: `paper_download` by source and landing page |

## Current Gaps

1. Search results checked on 2026-05-10 still showed stale snippets for `site:sgexamhub.com sg exam papers`, including old homepage count copy and stale school casing.
2. A fresh live read on 2026-05-10 still found rendered homepage text `2,200+Papers`; stricter normalizer and audit commits are in `main`, but the post-fix deployment/live audit has not yet been proven here.
3. Follow `SEO_REINDEX_PLAN.md` only after the stricter deployment passes: request indexing for priority URLs and resubmit `https://sgexamhub.com/sitemap.xml` in Google Search Console.
4. Local shell execution is currently unavailable in this environment, so verification for the latest changes was done through GitHub connector and live web reads rather than local commands.
5. The objective remains incomplete until GSC and GA4 show improved organic acquisition and downstream paper-open/download behavior.

## Completion Rule

Do not mark the SEO goal complete until all of these are true:

1. GitHub Pages deployment has completed after the latest SEO commits.
2. `npm run seo:audit:live` passes against `https://sgexamhub.com`.
3. A fresh live read of `https://sgexamhub.com/` no longer shows `2,200+Papers` or any `2,200+` paper-count copy.
4. Google has refreshed stale snippets for priority URLs in `SEO_REINDEX_PLAN.md`.
5. GSC shows improved clicks, CTR, or ranking for target query clusters in `SEO_KEYWORD_MAP.md`.
6. GA4 organic traffic shows paper opens and PDF downloads from the relevant landing pages.
