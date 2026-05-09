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
   - `https://sgexamhub.com/exam-papers/sa2`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-mathematics`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-science`
   - `https://sgexamhub.com/exam-papers/2025-primary-6-sa2`
   - `https://sgexamhub.com/exam-papers/primary-6-sa1`
   - `https://sgexamhub.com/exam-papers/school-raffles-girls-primary-school`
3. In Performance, track queries containing:
   - `singapore primary school exam papers`
   - `free exam papers`
   - `2025 primary 6 maths exam papers`
   - `2025 primary 6 SA2 exam papers`
   - `primary 6 SA1 exam papers`
   - `primary 6 science exam papers`
   - `raffles girls primary school exam papers`
   - `nanyang primary school exam papers`

## GA4 Checks

Track whether search users move deeper into the site:

- `paper_view_click`
- `paper_open`
- `paper_download`
- `paper_filter_change`
- `paper_filters_reset`
- `paper_show_more`
- `page_engaged_time`
- `page_scroll_depth`
- `page_session_summary`

Useful report segments:

- Source / medium contains `google / organic`.
- Landing page starts with `/exam-papers`.
- Event name is `paper_view_click`, `paper_open`, `paper_download`, `page_engaged_time`, `page_scroll_depth`, or `page_session_summary`.
- Custom event parameter `landing_path` shows the first page in the session.
- Custom event parameter `referrer_host` shows the external host, with `is_google_referrer` set for Google referrers.

## Monthly Improvements

1. Export Google Search Console queries with high impressions and low CTR.
2. Map queries to preferred pages using `SEO_KEYWORD_MAP.md`.
3. Improve matching page titles and descriptions where the page already ranks.
4. Add new collection links for query patterns that appear repeatedly.
5. Keep old paper viewer URLs in the sitemap so long-tail school/year/subject searches can land directly on a paper.
6. Compare organic users, paper opens, and downloads month over month.
