# SEO Reindex Plan

Objective: after SEO fixes deploy, get Google to refresh stale snippets so searchers see the current titles, school names, and download-focused copy.

## Current Deployment Evidence

Latest passing deployment evidence on 2026-05-10:

- Commit `86b2b75a6fb07176b605b30d2469ec95f1a76bdd` deployed the homepage stale-count guard after normalizing the stat copy away from `2,200+`.
- GitHub Actions run `25626208854` completed successfully for build and deploy.
- Build generated `6238` sitemap URLs and passed the generated SEO audit.
- Deployed site passed `npm run seo:audit:live`, including live SEO, school-name, snippet-focused UI, funnel, and sitemap priority-school checks.
- Live sitemap audit reported `6238` URLs and `8` distinct `lastmod` dates.

This confirms the live site is ready for Search Console reindexing. It does not prove Google snippets or organic behavior have improved yet.

## Current Search Evidence

Checked on 2026-05-10 after the passing deployment.

| Query | Evidence | Follow-up |
| --- | --- | --- |
| `site:sgexamhub.com sg exam papers` | Search results still showed stale homepage result text such as `2,200+ Papers`, `Anglo chinese School (junior)`, and `Methodist Girls' School (primary)`. The live site no longer exposes the stale count through the audited homepage output. | Request reindex for `/` and resubmit the sitemap. |
| `site:sgexamhub.com "Free Singapore Primary Exam Papers"` | Homepage result was present, confirming Google can discover the canonical domain. | Use as baseline evidence, not completion proof. |
| `site:sgexamhub.com "Raffles Girls' Primary School" "SG Exam Hub"` | Indexed collection/viewer pages appear, confirming paper pages are discoverable. | Recheck after Google refreshes indexed results for current titles and official school names. |
| `site:sgexamhub.com "Anglo-Chinese School (Primary)"` | Google has discoverable school-specific pages, but stale lowercase/unhyphenated school-name snippets may still appear from older crawls. | Request reindex for the ACS school collection URLs below. |

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

The stale snippets are not fixed until indexed results stop showing old count text such as `2,200+ Papers`, lowercase or unhyphenated school names such as `Anglo chinese School (primary)`, `Chij`, or `Methodist Girls' School (primary)`, and concatenated viewer text such as `Methodist Girls' School (Primary)P6`.

## Completion Evidence

Do not count reindexing as complete until both are true:

1. Search results show refreshed SG Exam Hub titles/descriptions for the priority queries.
2. GSC Performance shows improved clicks, CTR, impressions, or average position for target query clusters.
