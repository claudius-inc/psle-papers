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

## Google Search Console

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

## GA4 Checks

Track whether search users move deeper into the site:

- `paper_view_click`
- `paper_open`
- `paper_download`
- `paper_filter_change`
- `paper_filters_reset`
- `paper_show_more`
- `page_view`
- `page_engaged_time`
- `page_scroll_depth`
- `page_session_summary`

Useful report segments:

- Source / medium contains `google / organic`.
- Landing page is `/`, `/free-exam-papers`, `/past-year-exam-papers`, `/test-papers`, `/top-school-exam-papers`, or starts with `/exam-papers`.
- Event name is `page_view`, `paper_view_click`, `paper_open`, `paper_download`, `page_engaged_time`, `page_scroll_depth`, or `page_session_summary`.
- Custom event parameter `landing_path` shows the first page in the session.
- Custom event parameter `page_path` shows the current page after direct landings and SPA route changes.
- Custom event parameter `referrer_host` shows the external host, with `is_google_referrer` set for Google referrers.
- Custom event parameter `source` identifies CTA placement; compare `collection_hero_cta`, `viewer_mobile_sticky`, `mobile_next_paper`, `index_results`, and `home_results`.

## Mobile CTA Checks

After a mobile CTA deploy, confirm whether organic mobile users are moving from search landing pages to paper actions:

1. Segment traffic by device category `mobile` and source / medium `google / organic`.
2. For landing pages beginning with `/exam-papers`, compare mobile `paper_view_click` and `paper_download` where `source = collection_hero_cta` against desktop `collection_hero_cta`.
3. Compare `paper_download` where `source = collection_hero_cta`, `viewer_mobile_sticky`, `index_results`, and `viewer_panel`.
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
