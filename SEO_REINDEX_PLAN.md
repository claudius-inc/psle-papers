# SEO Reindex Plan

Objective: after SEO fixes deploy, get Google to refresh stale snippets so searchers see the current titles, school names, paper counts, and download-focused copy. Then use Google Search Console and GA4 to confirm that organic users click through, open exam papers, stay engaged, and download PDFs.

## Current Deployment Evidence

Latest fully passing deployment evidence on 2026-05-10:

- Commit `b48bd78583ba88a6c9c31874007c5c7a78821fbd` is deployed.
- GitHub Actions run `25632069702` completed successfully for build and deploy.
- Build generated `6238` sitemap URLs and passed the generated SEO audit gate.
- Deployed site passed `npm run seo:audit:live`, including live SEO, JSON-LD, stale-snippet page, school-name, OG image, snippet-focused UI, conversion analytics, top-school funnel, free-exam funnel, broad-landing funnel, sitemap priority-school, and sitemap lastmod checks.
- Live sitemap audit reported `6238` URLs and `8` distinct `lastmod` dates.
- Live JSON-LD audit reported `11` pages checked.
- Live snippet-focused UI audit reported `10` pages and `15` assets checked, including `data-nosnippet` on repeated homepage, collection, broad landing, 2026 revision, and PSLE revision paper CTA/list blocks.
- Live conversion analytics audit reported `1` page and `7` assets checked.
- Live OG image audit passed. Direct live hash verification showed `https://sgexamhub.com/og-image.png` matches manifest hash `d0b66da84ffab834550742fefdf57765cdbc3f4a306da35ba4096561e0d61bee`; OCR read `2,299 PDF papers`.
- Fresh live homepage read after deployment showed `2,299 PDF exam papers indexed`; it no longer showed stale `2,200+Papers`, `2,200+`, or `2,300+` count copy.
- Indexable pages emit `index, follow, max-snippet:160, max-image-preview:large` robots directives.
- Fresh live page read for `/exam-papers/primary-3-chinese/` showed corrected school casing, including `Anglo-Chinese School (Primary)`, `Methodist Girls' School (Primary)`, and `CHIJ`.

Earlier evidence from runs `25626208854`, `25626609288`, `25627427402`, `25627663313`, `25628581332`, `25628828106`, `25629044793`, `25630256022`, `25630822616`, `25631162771`, `25631382415`, and `25631615882` was useful but no longer the latest proof. The latest commits hardened normalizer coverage, generated/live snippet audits, sitemap freshness inputs, mobile CTA source tracking, robots snippet directives, repeated CTA `data-nosnippet` markers, broad landing and revision page snippet controls, reindex action packs, outcome export templates, and social preview image freshness so future SEO changes remain covered by CI.

## Current Search Evidence

Checked on 2026-05-10 after the passing deployment in run `25632069702`.

| Query | Evidence | Follow-up |
| --- | --- | --- |
| `site:sgexamhub.com sg exam papers` | Search results still showed stale homepage result text such as `2,200+Papers`, older title copy, `Anglo chinese School (junior)`, and `Methodist Girls' School (primary)`. The result crawl label was still older than the latest deployment, while the current live homepage now shows `2,299 PDF exam papers indexed`. | Request reindex for `/` and resubmit the sitemap. Recheck until the search snippet reflects the current live page. |
| `site:sgexamhub.com "2,200+Papers"` | Google still found the stale homepage snippet. Current live HTML does not contain `2,200+`, so this is an index refresh issue rather than a deployed-site issue. | Keep this as the fastest stale-snippet canary. Completion requires this query to stop returning stale SG Exam Hub snippets. |
| `site:sgexamhub.com "Anglo chinese"` | Google still showed stale school-name snippets, including older lowercase/unhyphenated names. Current live pages use official casing and hyphenation. | Request reindex for the affected collection pages and recheck after crawl. |
| `site:sgexamhub.com "primary 3 chinese exam papers"` | Search results still showed `/exam-papers/primary-3-chinese` with stale school-name casing from older crawls. Current live HTML uses `Anglo-Chinese School (Primary)`, `Methodist Girls' School (Primary)`, and `CHIJ`. | Request reindex for `/exam-papers/primary-3-chinese/`, `/exam-papers/primary-3/`, `/exam-papers/chinese/`, and priority school pages. |
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
10. `https://sgexamhub.com/exam-papers/2025/`
11. `https://sgexamhub.com/exam-papers/2024/`
12. `https://sgexamhub.com/exam-papers/chinese/`
13. `https://sgexamhub.com/exam-papers/primary-3/`
14. `https://sgexamhub.com/exam-papers/primary-3-chinese/`
15. `https://sgexamhub.com/exam-papers/primary-3-science/`
16. `https://sgexamhub.com/exam-papers/primary-3-higher-chinese/`
17. `https://sgexamhub.com/exam-papers/2025-primary-6-sa2/`
18. `https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2/`
19. `https://sgexamhub.com/exam-papers/2025-primary-6-science-sa2/`
20. `https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school/`
21. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-primary/`
22. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-junior/`
23. `https://sgexamhub.com/exam-papers/school-methodist-girls-school-primary/`
24. `https://sgexamhub.com/exam-papers/school-raffles-girls-primary-school/`
25. `https://sgexamhub.com/view/6_1073_3_4_2025/`

The same list is generated for handoff by:

```sh
npm run seo:action-pack
```

See `reports/seo/reindex-action-pack.md`.

## GSC Steps

1. Confirm GitHub Pages deployment completed after the latest SEO commits. Current deployment proof is run `25632069702` for commit `b48bd78583ba88a6c9c31874007c5c7a78821fbd`.
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
