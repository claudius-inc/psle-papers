# SEO Reindex Plan

Objective: after SEO fixes deploy, get Google to refresh stale snippets so searchers see the current titles, school names, paper counts, and download-focused copy. Then use Google Search Console and GA4 to confirm that organic users click through, open exam papers, stay engaged, and download PDFs.

## Current Deployment Evidence

Latest fully passing deployment evidence on 2026-05-10:

- Commit `6b5a41c15cce506bb149ce0e010883e74897cd55` deployed the sitemap freshness audit coverage after the homepage/snippet and school-name fixes.
- GitHub Actions run `25627427402` (`#236`) completed successfully for build and deploy.
- Build generated `6238` sitemap URLs and passed the generated SEO audit gate. The local audit now includes `node scripts/audit-sitemap-lastmod-inputs.mjs`, which verifies that sitemap `lastmod` freshness includes the snippet and viewer SEO normalizer scripts.
- Deployed site passed `npm run seo:audit:live`, including live SEO, school-name, snippet-focused UI, conversion analytics, top-school funnel, free-exam funnel, broad-landing funnel, and sitemap priority-school checks.
- Live sitemap audit reported `6238` URLs and `8` distinct `lastmod` dates.
- Live snippet-focused UI audit reported `3` pages and `9` assets checked.
- Live conversion analytics audit reported `1` page and `7` assets checked.
- Fresh live homepage read after deployment showed `2,299 Papers` and `2,299 PDF exam papers indexed`; it no longer showed the stale `2,200+Papers` count copy.
- Fresh live page read for `/exam-papers/primary-3-chinese/` showed corrected school casing, including `Anglo-Chinese School (Primary)`, `Methodist Girls' School (Primary)`, and `CHIJ Katong Primary`.

Earlier evidence from runs `25626208854` and `25626609288` was useful but no longer the latest proof. The later commits hardened normalizer coverage, generated/live snippet audits, and sitemap freshness inputs so future snippet/UI SEO changes update sitemap freshness and remain covered by CI.

## Current Search Evidence

Checked on 2026-05-10 after the passing deployment in run `25627427402`.

| Query | Evidence | Follow-up |
| --- | --- | --- |
| `site:sgexamhub.com sg exam papers` | Google results still showed stale homepage result text such as `2,200+Papers`, older title copy, `Anglo chinese School (junior)`, and `Methodist Girls' School (primary)`. The Google result was crawled before the latest deployment, while the current live homepage now shows `2,299 Papers`. | Request reindex for `/` and resubmit the sitemap. Recheck until the Google snippet reflects the current live page. |
| `site:sgexamhub.com "2,200+Papers"` | Google still found the stale homepage snippet. Current live HTML does not contain `2,200+`, so this is an index refresh issue rather than a deployed-site issue. | Keep this as the fastest stale-snippet canary. Completion requires this query to stop returning stale SG Exam Hub snippets. |
| `site:sgexamhub.com "Anglo chinese"` | Google still showed stale school-name snippets, including older lowercase/unhyphenated names. Current live pages use official casing and hyphenation. | Request reindex for the affected collection pages and recheck after crawl. |
| `site:sgexamhub.com "Free Singapore Primary Exam Papers"` | Homepage result is present, confirming Google can discover the canonical domain. | Use as baseline evidence, not completion proof. |
| `site:sgexamhub.com "Raffles Girls' Primary School" "SG Exam Hub"` | Indexed collection/viewer pages appear, confirming paper pages are discoverable. | Recheck after Google refreshes indexed results for current titles and official school names. |

## Priority URLs To Reindex

Submit these in Google Search Console URL Inspection after a passing deployment and live audit:

1. `https://sgexamhub.com/`
2. `https://sgexamhub.com/sitemap.xml`
3. `https://sgexamhub.com/exam-papers/`
4. `https://sgexamhub.com/free-exam-papers/`
5. `https://sgexamhub.com/past-year-exam-papers/`
6. `https://sgexamhub.com/test-papers/`
7. `https://sgexamhub.com/top-school-exam-papers/`
8. `https://sgexamhub.com/exam-papers/2026-revision/`
9. `https://sgexamhub.com/exam-papers/psle-revision/`
10. `https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2/`
11. `https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school/`
12. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-primary/`
13. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-junior/`
14. `https://sgexamhub.com/exam-papers/primary-3-chinese/`
15. `https://sgexamhub.com/view/6_1073_3_4_2025/`

## GSC Steps

1. Confirm GitHub Pages deployment completed after the latest SEO commits. Current deployment proof is run `25627427402` for commit `6b5a41c15cce506bb149ce0e010883e74897cd55`.
2. Confirm `npm run seo:audit:live` passes against `https://sgexamhub.com`. Current deployment logs show the live audit passed.
3. In Google Search Console, inspect each priority URL and choose `Request indexing`.
4. Resubmit `https://sgexamhub.com/sitemap.xml` in Sitemaps.
5. In Performance, compare the next 7, 14, and 28 days against the previous matching period for target clusters in `SEO_KEYWORD_MAP.md`.
6. For each high-impression query, confirm Google ranks the preferred landing page from `SEO_KEYWORD_MAP.md`; if not, update internal links and page copy for the preferred page.

## GA4 Organic Funnel Checks

The deployed audits verify that GA4 and conversion events exist, including page engagement, scroll depth, paper view/open, and `paper_download`. They do not prove search performance by themselves. Use GA4 after Google recrawls:

1. Segment traffic where `session_default_channel_group` is Organic Search, or where the stored attribution has `is_google_referrer`.
2. Track landing pages for `/`, `/free-exam-papers`, `/test-papers`, `/past-year-exam-papers`, `/top-school-exam-papers`, `/exam-papers/2026-revision`, and `/exam-papers/psle-revision`.
3. Confirm organic sessions trigger `page_engaged_time`, `page_scroll_depth`, `paper_view_click`, `paper_open`, and `paper_download`.
4. Compare organic engagement rate, average engagement time, paper opens per session, and downloads per session over 7, 14, and 28 day windows.
5. If organic clicks improve but downloads lag, prioritize above-the-fold paper cards, viewer download CTAs, and related-paper continuation links before adding new keyword pages.

## Stale Snippet Checks

Re-run these checks after Google refreshes indexed results:

```text
site:sgexamhub.com sg exam papers
site:sgexamhub.com "2,200+Papers"
site:sgexamhub.com "free exam papers singapore"
site:sgexamhub.com "psle revision papers"
site:sgexamhub.com "Anglo chinese"
site:sgexamhub.com "Anglo-Chinese School (Primary)"
site:sgexamhub.com "Methodist Girls' School (Primary)" "P6"
site:sgexamhub.com "Raffles Girls' Primary School" "Download PDF"
```

The stale snippets are not fixed until indexed results stop showing old count text such as `2,200+ Papers`, lowercase or unhyphenated school names such as `Anglo chinese School (primary)`, `Chij`, or `Methodist Girls' School (primary)`, and concatenated viewer text such as `Methodist Girls' School (Primary)P6`.

## Completion Evidence

Do not count this SEO reindexing work as complete until all are true:

1. The latest relevant deployment after SEO/conversion commits passed build, deploy, and live SEO audits.
2. A fresh live homepage/rendered read is clean with no stale `2,200+Papers` or `2,200+` copy.
3. Google snippets have refreshed with no stale `2,200+Papers` or stale school casing for the priority queries above.
4. GSC Performance shows improved organic clicks, CTR, impressions, or average position for target query clusters in `SEO_KEYWORD_MAP.md`.
5. GA4 organic traffic shows engagement, paper opens, and PDF downloads from search users.
