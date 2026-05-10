# SG Exam Hub SEO Runbook

Use this checklist after each content or SEO deploy.

## Deploy Checks

1. Run `npm run generate`.
2. Confirm the command prints a `Generated ... sitemap URLs` line.
3. Run `npm run seo:audit`.
4. Deploy `.output/public` through the GitHub Pages workflow.
5. Run `npm run seo:audit:live`.
6. Open `https://sgexamhub.com/sitemap.xml` and confirm it loads.
7. Open `https://sgexamhub.com/robots.txt` and confirm it points to the sitemap.
8. If a commit lands on `main` but no GitHub Actions run appears, open Actions, choose `Deploy Nuxt site to Pages`, and run the `workflow_dispatch` workflow manually on `main`.
9. After deployment, open a representative viewer page such as `https://sgexamhub.com/view/6_1073_3_4_2025` and confirm related-paper text separates school names from level labels, for example `Methodist Girls' School (Primary)` and `Level P6` should not render as one combined token.

## Google Search Console

Use `SEO_REINDEX_PLAN.md` after each passing deployment when Google results still show stale titles, old homepage copy, or stale school-name casing. Use `SEO_STALE_SNIPPET_REINDEX_CHECKLIST.md` for the current stale homepage and Primary 3 Chinese snippet cluster. Run `npm run seo:action-pack` to generate `reports/seo/reindex-action-pack.md` and `reports/seo/gsc-url-inspection-tracker.csv`, the operational URL Inspection, query recheck, GSC export, and GA4 export checklist.

Run `npm run seo:reindex-status` after updating `reports/seo/gsc-url-inspection-tracker.csv` to write `reports/seo/gsc-url-inspection-status.md`. For final completion checks, use `npm run seo:reindex-status -- --fail-on-pending`; it should fail until every priority URL is marked `Complete`.

Run `npm run seo:snippet-status` after updating `reports/seo/google-snippet-recheck-tracker.csv` to write `reports/seo/google-snippet-recheck-status.md`. For final completion checks, use `npm run seo:snippet-status -- --fail-on-stale`; it should fail until every public Google recheck query is marked `Fresh`.

Run `npm run seo:completion-check` as the final objective gate after GSC URL Inspection, public Google rechecks, and GSC/GA4 exports are available. It writes `reports/seo/seo-completion-check.md` and should fail until the whole SEO objective has real external evidence.

Run `npm run seo:keyword-coverage` after `npm run generate` when changing the keyword map, sitemap, or landing-page links. It writes `reports/seo/keyword-landing-page-audit.csv` and `reports/seo/keyword-landing-page-audit.md`, checking that every mapped query cluster has a generated preferred page, sitemap URL, internal link, canonical URL, and matching page copy.

1. Submit `https://sgexamhub.com/sitemap.xml`.
2. Request indexing for:
   - `https://sgexamhub.com/`
   - `https://sgexamhub.com/exam-papers`
   - `https://sgexamhub.com/free-exam-papers`
   - `https://sgexamhub.com/past-year-exam-papers`
   - `https://sgexamhub.com/test-papers`
   - `https://sgexamhub.com/top-school-exam-papers`
   - `https://sgexamhub.com/exam-papers/2026-revision`
   - `https://sgexamhub.com/exam-papers/psle-revision`
   - `https://sgexamhub.com/exam-papers/2025`
   - `https://sgexamhub.com/exam-papers/2024`
   - `https://sgexamhub.com/exam-papers/sa2`
   - `https://sgexamhub.com/exam-papers/chinese`
   - `https://sgexamhub.com/exam-papers/primary-3`
   - `https://sgexamhub.com/exam-papers/primary-3-chinese`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-mathematics`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-science`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-sa2`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-science-sa2`
   - `https://sgexamhub.com/exam-papers/primary-6`
   - `https://sgexamhub.com/exam-papers/primary-6-sa1`
   - `https://sgexamhub.com/exam-papers/primary-6-sa2`
   - `https://sgexamhub.com/exam-papers/primary-6-mathematics`
   - `https://sgexamhub.com/exam-papers/primary-6-science`
   - `https://sgexamhub.com/exam-papers/school-raffles-girls-primary-school`
   - `https://sgexamhub.com/exam-papers/school-nanyang-primary-school`
   - `https://sgexamhub.com/exam-papers/school-henry-park-primary-school`
   - `https://sgexamhub.com/exam-papers/school-methodist-girls-school-primary`
   - `https://sgexamhub.com/exam-papers/school-singapore-chinese-girls-primary-school`
   - `https://sgexamhub.com/exam-papers/school-chij-st-nicholas-girls-school`
   - `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-primary`
   - `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-junior`
   - `https://sgexamhub.com/exam-papers/school-pei-hwa-presbyterian-primary-school`
   - `https://sgexamhub.com/exam-papers/school-red-swastika-school`
   - `https://sgexamhub.com/exam-papers/school-tao-nan-school`
3. In Performance, track queries containing:
   - `sg exam papers`
   - `singapore exam papers`
   - `singapore primary school exam papers`
   - `singapore primary exam papers pdf`
   - `free exam papers`
   - `free exam papers singapore`
   - `past year exam papers singapore`
   - `singapore primary past year exam papers`
   - `primary school test papers`
   - `free test papers singapore`
   - `top school exam papers singapore`
   - `2026 primary exam papers`
   - `psle revision papers`
   - `psle practice papers`
   - `2025 primary exam papers`
   - `2024 primary exam papers`
   - `primary 3 exam papers`
   - `primary 3 chinese exam papers`
   - `chinese exam papers`
   - `2025 primary 6 maths exam papers`
   - `2025 primary 6 SA2 exam papers`
   - `2025 primary 6 maths SA2 exam papers`
   - `2025 primary 6 science SA2 exam papers`
   - `primary 6 SA1 exam papers`
   - `primary 6 SA2 exam papers`
   - `primary 6 maths exam papers`
   - `primary 6 science exam papers`
   - `raffles girls primary school exam papers`
   - `nanyang primary school exam papers`
   - `henry park primary school exam papers`
   - `methodist girls school primary exam papers`
   - `singapore chinese girls primary school exam papers`
   - `chij st nicholas girls school exam papers`
   - `anglo chinese school primary exam papers`
   - `anglo chinese school junior exam papers`
   - `pei hwa presbyterian primary school exam papers`
   - `red swastika school exam papers`
   - `tao nan school exam papers`

## School Name Quality Checks

Official school names affect search snippet trust and school-specific query matching. After deployment, `npm run seo:audit:live` checks representative live pages for stale casing such as `Anglo chinese School`, `Methodist Girls' School (primary)`, and `Chij`. It also checks viewer pages for stale concatenated text such as `Methodist Girls' School (Primary)P6`. If this check fails, wait for the GitHub Pages deploy to finish, rerun `npm run seo:audit:live`, and only request indexing after the live pages show official names such as `Anglo-Chinese School (Primary)`, `Methodist Girls' School (Primary)`, and `CHIJ St. Nicholas Girls' School` with readable level labels.

## GA4 Checks

Track whether search users move deeper into the site:

- `paper_view_click`
- `paper_open`
- `paper_pdf_load`
- `paper_pdf_error`
- `paper_download`
- `file_download`
- `free_exam_collection_click`
- `past_year_collection_click`
- `test_paper_collection_click`
- `top_school_collection_click`
- `paper_filter_change`
- `paper_filters_reset`
- `paper_search`
- `search`
- `empty_search_recovery_click`
- `paper_show_more`
- `page_view`
- `page_engaged_time`
- `page_scroll_depth`
- `page_session_summary`

Useful report segments:

- Source / medium contains `google / organic`.
- Landing page is `/`, `/free-exam-papers`, `/past-year-exam-papers`, `/test-papers`, `/top-school-exam-papers`, or starts with `/exam-papers`.
- Event name is `page_view`, `paper_search`, `search`, `paper_view_click`, `paper_open`, `paper_pdf_load`, `paper_pdf_error`, `paper_download`, `file_download`, `empty_search_recovery_click`, `page_engaged_time`, `page_scroll_depth`, or `page_session_summary`.
- Event name `free_exam_collection_click` isolates free-papers collection clicks before users enter year, level, subject, top-school, or PSLE pages.
- Event name `past_year_collection_click` isolates past-year collection clicks before users enter year, level, subject, assessment, or school pages.
- Event name `test_paper_collection_click` isolates test-paper collection clicks before users enter year, level, subject, assessment, or PSLE pages.
- Event name `top_school_collection_click` isolates top-school card clicks before users enter a school collection page.
- Event name `empty_search_recovery_click` shows whether users who hit zero search/filter results continue into a suggested collection instead of leaving.
- Standard `search` events include `search_term` so GA4 can report on-site paper searches alongside the custom `paper_search` funnel event.
- Custom event parameter `page_path` shows the current page after direct landings and SPA route changes.
- Custom event parameter `landing_path` shows the first page in the session.
- Custom event parameter `referrer_host` shows the external host, with `is_google_referrer` set for Google referrers.
- Custom event parameter `source` identifies CTA placement; compare `top_school_collection_grid`, `collection_hero_cta`, `collection_mobile_sticky`, `viewer_mobile_sticky`, `mobile_next_paper`, `index_results`, and `home_results`.
- Custom event parameter `pdf_load_ms` on `paper_pdf_load` and `paper_pdf_error` shows whether opened viewer pages actually loaded the PDF preview quickly enough to keep users engaged.
- Custom event parameter `is_conversion_event` is set on `paper_download` and the paired GA4 standard `file_download`; use it to isolate download conversions from exploratory paper views.
- Standard `file_download` events include `file_name`, `file_extension`, and `link_url` for PDF download reporting.
- Download events use GA beacon transport so raw PDF navigations are less likely to drop the event before it is sent.
- Source value `free_exam_collection_grid` identifies collection clicks from `/free-exam-papers`.
- Source value `past_year_collection_grid` identifies collection clicks from `/past-year-exam-papers`.
- Source value `test_paper_collection_grid` identifies collection clicks from `/test-papers`.
- Custom event parameter `school_name` shows which top-school collection users clicked from `/top-school-exam-papers`.
- Custom event parameter `collection_title` shows which broad landing-page collection users clicked.

## Outcome Evidence Report

After Google has had time to recrawl and GA4 has collected organic sessions, export:

1. GSC Performance for the baseline period before the SEO deploy.
2. GSC Performance for the matching period after the SEO deploy.
3. GA4 events filtered to Organic Search, or exported with source / medium columns.

Then run:

```sh
npm run seo:export-templates

npm run seo:outcomes -- \
  --gsc-before reports/seo/gsc-before.csv \
  --gsc-after reports/seo/gsc-after.csv \
  --ga4 reports/seo/ga4-organic-events.csv \
  --out reports/seo/outcome-report.md
```

The report maps GSC rows to `SEO_KEYWORD_MAP.md` and checks whether the supplied exports prove improved clicks, CTR, or average position plus organic GA4 engagement, paper-open, and PDF-download events. Treat an `INCOMPLETE` report as a sign that the SEO goal remains open.

## Broad Landing Funnel Checks

After free, past-year, or test-paper landing page changes deploy, confirm whether organic visitors choose a collection and continue to paper actions:

1. Segment source / medium `google / organic` with landing page `/free-exam-papers`, `/past-year-exam-papers`, or `/test-papers`.
2. Compare `free_exam_collection_click`, `past_year_collection_click`, and `test_paper_collection_click` by custom parameter `collection_title`.
3. For sessions with a collection click, confirm follow-on `paper_view_click`, `paper_open`, and `paper_download` events.
4. Compare collection click share against GSC impressions for matching query groups such as `free exam papers`, `past year exam papers singapore`, and `free test papers singapore`.
5. If collection clicks rise but paper opens do not, move the highest-intent collection earlier or change the collection card copy.

## Free Exam Funnel Checks

After free-papers content changes deploy, confirm whether organic visitors choose a collection and continue to paper actions:

1. Segment source / medium `google / organic` with landing page `/free-exam-papers`.
2. Compare `free_exam_collection_click` by custom parameter `collection_title` to see which free-papers paths pull clicks.
3. For sessions with `free_exam_collection_click`, confirm follow-on `paper_view_click`, `paper_open`, and `paper_download` events.
4. Compare `collection_title` click share against GSC impressions for `free exam papers`, `free exam papers singapore`, and related query variants.
5. If free-papers collection clicks rise but paper opens do not, move the highest-intent collection earlier or change the collection card copy.

## Top School Funnel Checks

After top-school content changes deploy, confirm whether organic visitors choose a school collection and continue to paper actions:

1. Segment source / medium `google / organic` with landing page `/top-school-exam-papers`.
2. Compare `top_school_collection_click` by custom parameter `school_name` to see which school cards pull clicks.
3. For sessions with `top_school_collection_click`, confirm follow-on `paper_view_click`, `paper_open`, and `paper_download` events.
4. Compare `school_name` click share against GSC query impressions for matching school-name queries.
5. Move higher-intent schools earlier on `/top-school-exam-papers` only when GSC impressions and GA4 downstream actions both support it.

## Mobile CTA Checks

After a mobile CTA deploy, confirm whether organic mobile users are moving from search landing pages to paper actions:

1. Segment traffic by device category `mobile` and source / medium `google / organic`.
2. For landing pages beginning with `/exam-papers`, compare mobile `paper_view_click` and `paper_download` where `source = collection_mobile_sticky` against desktop `collection_hero_cta`.
3. Compare `paper_download` where `source = collection_mobile_sticky`, `collection_hero_cta`, `viewer_mobile_sticky`, `index_results`, and `viewer_panel`.
4. Check whether mobile collection CTA sessions also emit `paper_open`, `page_engaged_time`, or `page_session_summary`.
5. If mobile sticky downloads rise while `paper_open` falls, test changing the primary mobile action order or label.

## Monthly Improvements

1. Export Google Search Console queries with high impressions and low CTR.
2. Map queries to preferred pages using `SEO_KEYWORD_MAP.md`.
3. Improve matching page titles and descriptions where the page already ranks.
4. Add new collection links for query patterns that appear repeatedly.
5. Keep old paper viewer URLs in the sitemap so long-tail school/year/subject searches can land directly on a paper.
6. Compare organic users, paper opens, and downloads month over month.
7. Compare mobile CTA sources against desktop and non-sticky sources before deciding the next layout change.
