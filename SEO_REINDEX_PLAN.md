# SEO Reindex Plan

Objective: after SEO fixes deploy, get Google to refresh stale snippets so searchers see the current titles, school names, and download-focused copy.

## Current Deployment Evidence

Latest passing deployment evidence on 2026-05-10:

- Commit `af00c084c3cfc325a7c77e1d4f841586760426ff` fixed paper sitemap `lastmod` dates to use stable filename-year fallback dates.
- GitHub Actions run `25625804377` completed successfully for build and deploy.
- Build generated `6238` sitemap URLs and passed the generated SEO audit.
- Deployed site passed `npm run seo:audit:live`, including live SEO, school-name, snippet-focused UI, funnel, and sitemap priority-school checks.

This confirms the live site is ready for Search Console reindexing. It does not prove Google snippets or organic behavior have improved yet.

## Current Search Evidence

Checked on 2026-05-10.

| Query | Evidence | Follow-up |
| --- | --- | --- |
| `site:sgexamhub.com sg exam papers` | Homepage result was crawled recently but still showed older copy such as `2,200+ Papers` and stale school names like `Anglo chinese School (junior)` and `Methodist Girls' School (primary)` in the result text. | Request reindex for `/` after the latest Pages deployment passes. |
| `site:sgexamhub.com "Free Singapore Primary Exam Papers"` | Homepage result was present, confirming Google can discover the canonical domain. | Use as baseline evidence, not completion proof. |
| `site:sgexamhub.com "Raffles Girls' Primary School" "SG Exam Hub"` | Indexed collection/viewer pages appear, confirming paper pages are discoverable. | Recheck after deployment for current titles and official school names. |

## Priority URLs To Reindex

Submit these in Google Search Console URL Inspection after a passing deployment and live audit:

1. `https://sgexamhub.com/`
2. `https://sgexamhub.com/sitemap.xml`
3. `https://sgexamhub.com/free-exam-papers/`
4. `https://sgexamhub.com/past-year-exam-papers/`
5. `https://sgexamhub.com/test-papers/`
6. `https://sgexamhub.com/top-school-exam-papers/`
7. `https://sgexamhub.com/exam-papers/2026-revision/`
8. `https://sgexamhub.com/exam-papers/psle-revision/`
9. `https://sgexamhub.com/exam-papers/2025-primary-6-mathematics-sa2/`
10. `https://sgexamhub.com/exam-papers/primary-6-mathematics-school-nanyang-primary-school/`
11. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-primary/`
12. `https://sgexamhub.com/exam-papers/school-anglo-chinese-school-junior/`
13. `https://sgexamhub.com/view/6_1073_3_4_2025/`

## GSC Steps

1. Confirm GitHub Pages deployment completed after the latest SEO commits.
2. Run or confirm `npm run seo:audit:live` passes against `https://sgexamhub.com`.
3. In Google Search Console, inspect each priority URL and choose `Request indexing`.
4. Resubmit `https://sgexamhub.com/sitemap.xml` in Sitemaps.
5. In Performance, compare the next 7, 14, and 28 days against the previous matching period for target clusters in `SEO_KEYWORD_MAP.md`.

## Stale Snippet Checks

Re-run these checks after Google refreshes indexed results:

```text
site:sgexamhub.com sg exam papers
site:sgexamhub.com "free exam papers singapore"
site:sgexamhub.com "psle revision papers"
site:sgexamhub.com "Anglo-Chinese School (Primary)"
site:sgexamhub.com "Methodist Girls' School (Primary)" "P6"
site:sgexamhub.com "Raffles Girls' Primary School" "Download PDF"
```

The stale snippets are not fixed until indexed results stop showing lowercase or unhyphenated school names such as `Anglo chinese School (primary)`, `Chij`, or `Methodist Girls' School (primary)`.

## Completion Evidence

Do not count reindexing as complete until both are true:

1. Search results show refreshed SG Exam Hub titles/descriptions for the priority queries.
2. GSC Performance shows improved clicks, CTR, impressions, or average position for target query clusters.
