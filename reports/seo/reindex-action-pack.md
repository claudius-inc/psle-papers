# SEO Reindex And Outcome Action Pack

Generated from source. Use this after the latest GitHub Pages deployment has passed `npm run seo:audit:live`.

Use this file as the operational handoff after the live site passes SEO audits. It does not replace Google Search Console or GA4; it lists the exact external actions and evidence needed before the SEO goal can be considered complete.

## Preconditions

- Latest relevant GitHub Pages run passed build and deploy.
- Latest relevant deployed SEO commit is the commit being submitted for URL Inspection.
- Live audit gate: `npm run seo:audit:live` passed for the latest deployment.
- Public Google results were still stale after deployment, so URL Inspection and sitemap resubmission remain required.

## Google Search Console URL Inspection

Inspect each URL below in Google Search Console. When the live test shows the current page, click `Request indexing`.

Track completion in `reports/seo/gsc-url-inspection-tracker.csv` so the remaining manual indexing work has dated evidence.

1. https://sgexamhub.com/
2. https://sgexamhub.com/sitemap.xml
3. https://sgexamhub.com/exam-papers/
4. https://sgexamhub.com/free-exam-papers/
5. https://sgexamhub.com/past-year-exam-papers/
6. https://sgexamhub.com/test-papers/
7. https://sgexamhub.com/top-school-exam-papers/
8. https://sgexamhub.com/exam-papers/2026-revision/
9. https://sgexamhub.com/exam-papers/psle-revision/
10. https://sgexamhub.com/exam-papers/2025/
11. https://sgexamhub.com/exam-papers/2024/
12. https://sgexamhub.com/exam-papers/chinese/
13. https://sgexamhub.com/exam-papers/primary-3/
14. https://sgexamhub.com/exam-papers/primary-3-chinese/
15. https://sgexamhub.com/exam-papers/primary-3-science/
16. https://sgexamhub.com/exam-papers/primary-3-higher-chinese/
17. https://sgexamhub.com/exam-papers/2025-primary-6-sa2/
18. https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2/
19. https://sgexamhub.com/exam-papers/2025-primary-6-science-sa2/
20. https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school/
21. https://sgexamhub.com/exam-papers/school-anglo-chinese-school-primary/
22. https://sgexamhub.com/exam-papers/school-anglo-chinese-school-junior/
23. https://sgexamhub.com/exam-papers/school-methodist-girls-school-primary/
24. https://sgexamhub.com/exam-papers/school-raffles-girls-primary-school/
25. https://sgexamhub.com/view/6_1073_3_4_2025/

After URL Inspection requests, resubmit this sitemap in the GSC Sitemaps report:

https://sgexamhub.com/sitemap.xml

## Public Google Recheck Queries

Run these checks 24-72 hours after URL Inspection requests, then again after 7 days.

Track freshness in `reports/seo/google-snippet-recheck-tracker.csv` so stale public search results do not get mistaken for completion.

- site:sgexamhub.com sg exam papers
  https://www.google.com/search?q=site%3Asgexamhub.com%20sg%20exam%20papers
- site:sgexamhub.com "2,200+Papers"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%222%2C200%2BPapers%22
- site:sgexamhub.com "2,300+"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%222%2C300%2B%22
- site:sgexamhub.com "free exam papers singapore"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22free%20exam%20papers%20singapore%22
- site:sgexamhub.com "psle revision papers"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22psle%20revision%20papers%22
- site:sgexamhub.com "Anglo chinese"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22Anglo%20chinese%22
- site:sgexamhub.com "primary 3 chinese exam papers"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22primary%203%20chinese%20exam%20papers%22
- site:sgexamhub.com "Primary 3 Chinese Exam Papers Free PDF Download"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22Primary%203%20Chinese%20Exam%20Papers%20Free%20PDF%20Download%22
- site:sgexamhub.com "Anglo-Chinese School (Primary)" "Download PDF"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22Anglo-Chinese%20School%20(Primary)%22%20%22Download%20PDF%22
- site:sgexamhub.com "Methodist Girls' School (Primary)" "Download PDF"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22Methodist%20Girls'%20School%20(Primary)%22%20%22Download%20PDF%22
- site:sgexamhub.com "Raffles Girls' Primary School" "Download PDF"
  https://www.google.com/search?q=site%3Asgexamhub.com%20%22Raffles%20Girls'%20Primary%20School%22%20%22Download%20PDF%22

Freshness pass criteria:

- No SG Exam Hub result shows stale `2,200+Papers`, `2,200+`, or `2,300+` count copy.
- No priority result shows stale school casing such as `Anglo chinese`, `Methodist Girls' School (primary)`, or `Chij (katong) Primary`.
- Priority snippets emphasize free PDF viewing/downloads rather than old paper-list UI text.

## GSC Outcome Export

Export GSC Performance data for a baseline period and a matching comparison period after Google has recrawled.

Track these query clusters:

- sg exam papers
- singapore primary school exam papers
- free exam papers singapore
- past year exam papers singapore
- primary 3 chinese exam papers
- chinese exam papers
- psle revision papers
- 2025 primary 6 maths sa2 exam papers
- anglo chinese school primary exam papers
- methodist girls school primary exam papers
- nanyang primary p6 maths exam papers
- raffles girls primary school exam papers

Required GSC columns:

- Query
- Page
- Clicks
- Impressions
- CTR
- Position

## GA4 Organic Outcome Export

Export organic search events filtered to Organic Search traffic or `is_google_referrer = true`.

Required event groups:

- page_engaged_time
- page_scroll_depth
- page_session_summary
- paper_view_click
- paper_open
- paper_download
- file_download

Priority landing pages:

- https://sgexamhub.com/
- https://sgexamhub.com/free-exam-papers
- https://sgexamhub.com/past-year-exam-papers
- https://sgexamhub.com/test-papers
- https://sgexamhub.com/top-school-exam-papers
- https://sgexamhub.com/exam-papers/2026-revision
- https://sgexamhub.com/exam-papers/psle-revision
- https://sgexamhub.com/exam-papers/primary-3-chinese
- https://sgexamhub.com/exam-papers/chinese

## Outcome Analyzer Command

If the export CSVs do not exist yet, generate templates first:

```sh
npm run seo:export-templates
```

Run this after the GSC and GA4 exports are available:

```sh
npm run seo:outcomes -- \
  --gsc-before reports/seo/gsc-before.csv \
  --gsc-after reports/seo/gsc-after.csv \
  --ga4 reports/seo/ga4-organic-events.csv \
  --out reports/seo/outcome-report.md
```

## Completion Rule

Do not mark the SEO objective complete until public Google snippets are refreshed and the outcome analyzer passes on real GSC/GA4 exports.

