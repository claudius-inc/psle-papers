# SEO Completion Audit

Objective: improve SG Exam Hub visibility, keywords, Google search ranking, search-result click-through, on-site engagement, exam-paper opens, and PDF downloads.

This goal is complete only when live search and analytics evidence show improvement. Source changes and passing audits are necessary gates, not final proof.

## Success Criteria

| Requirement | Evidence required | Current artifact or check | Status |
| --- | --- | --- | --- |
| Google can discover canonical pages | Live `https://sgexamhub.com/sitemap.xml` loads, `robots.txt` points to it, sitemap contains homepage, collection pages, school pages, and viewer pages | `public/robots.txt`, `public/sitemap.xml`, `scripts/generate-sitemap.mjs`, `scripts/audit-seo-output.mjs`, `scripts/audit-live-seo.mjs` | Source guarded; live verification required after deploy |
| Search snippets use trustworthy titles and descriptions | Generated and live pages have canonical titles, descriptions under audit limits, official school names, and no stale casing | `scripts/audit-seo-output.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-live-school-name-quality.mjs` | Source guarded; live verification required after deploy |
| Keyword clusters map to preferred landing pages | GSC query clusters have one intended page and page copy/internal links support the query intent | `SEO_KEYWORD_MAP.md`, homepage directory links, broad landing pages, collection pages | Implemented; must compare against GSC page/query data |
| Search users click through from Google | GSC shows higher organic clicks and/or CTR for target query clusters | GSC Performance export, `SEO_KEYWORD_MAP.md` review workflow | Missing outcome evidence |
| Organic users stay engaged | GA4 shows organic sessions emitting engagement events | `app/composables/useEngagementTracking.ts`, `SEO_RUNBOOK.md` GA4 checks | Instrumented; missing outcome evidence |
| Organic users open exam papers | GA4 organic segment shows `paper_view_click` and `paper_open` after landing pages | `app/utils/analytics.ts`, homepage/collection/viewer event sources, runbook checks | Instrumented; missing outcome evidence |
| Organic users download PDFs | GA4 organic segment shows `paper_download`, with useful `source` values such as `collection_hero_cta`, `index_results`, `viewer_panel`, and `viewer_mobile_sticky` | `app/utils/analytics.ts`, viewer and landing page CTAs, runbook checks | Instrumented; missing outcome evidence |
| Deploy pipeline protects SEO regressions | GitHub Pages build runs generate, local SEO audit, deploy, then live SEO audit | `.github/workflows/nuxtjs.yml`, `scripts/audit-pages-workflow.mjs`, `SEO_RUNBOOK.md` | Guarded; current connector commits still need a Pages run |
| Live viewer pages remain readable | Viewer pages separate school names and level labels, avoiding concatenated snippets like `Methodist Girls' School (Primary)P6` | `scripts/ensure-viewer-school-seo.mjs`, `scripts/audit-school-name-quality.mjs`, `scripts/audit-live-school-name-quality.mjs` | Source/live audit guarded; live deployment still required |

## Prompt-to-Artifact Checklist

| User requirement | Concrete artifact | Verification command or evidence |
| --- | --- | --- |
| Improve website visibility | Sitemap, robots, canonical metadata, indexable landing and viewer pages | `npm run generate`, `npm run seo:audit`, `npm run seo:audit:live`, GSC indexed pages |
| Improve SEO and keywords | Keyword map and targeted landing pages for broad, year, level, subject, school, PSLE, free, past-year, and test-paper queries | `SEO_KEYWORD_MAP.md`, generated page titles/descriptions, GSC query/page export |
| Improve search ranking and click-through | Page titles/descriptions aligned with target query clusters | GSC comparison of clicks, CTR, impressions, and average position before/after deploy |
| Keep users engaged inside the website | Engagement tracking and internal paths from landing pages to collections and viewer pages | GA4 `page_engaged_time`, `page_scroll_depth`, `page_session_summary`, collection click events |
| Make users open exam papers | Visible paper cards, hero CTAs, viewer links, and `paper_open`/`paper_view_click` events | GA4 organic segment: `paper_view_click`, `paper_open` by landing page and source |
| Make users click download | Download buttons on home, collections, broad landing pages, and viewer pages with source attribution | GA4 organic segment: `paper_download` by source and landing page |

## Current Gaps

1. Latest GitHub connector commits show no attached GitHub Actions workflow run. Run `Deploy Nuxt site to Pages` manually from Actions on `main` if no run appears.
2. Local shell execution is currently unavailable, so local `npm run generate`, `npm run seo:audit`, and git verification have not run in this environment.
3. Live pages must be rechecked after deployment, especially `/view/6_1073_3_4_2025` for official school names and `Level P6` readability.
4. The objective remains incomplete until GSC and GA4 show improved organic acquisition and downstream paper/download behavior.

## Completion Rule

Do not mark the SEO goal complete until all of these are true:

1. GitHub Pages deployment has completed after the latest SEO commits.
2. `npm run seo:audit:live` passes against `https://sgexamhub.com`.
3. GSC shows improved clicks, CTR, or ranking for target query clusters in `SEO_KEYWORD_MAP.md`.
4. GA4 organic traffic shows paper opens and PDF downloads from the relevant landing pages.
