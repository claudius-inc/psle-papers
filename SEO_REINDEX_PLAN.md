# SEO Reindex Plan

Objective: after SEO fixes deploy, get Google to refresh stale snippets so searchers see the current titles, school names, and download-focused copy.

## Current Deployment Evidence

Latest fully passing deployment evidence on 2026-05-10:

- Commit `f57790217ef993a2ae879a4c8c7298258da77c5c` deployed the stricter live asset stale-snippet audit.
- GitHub Actions run `25626609288` completed successfully for build and deploy.
- Build generated `6238` sitemap URLs and passed the generated SEO audit, including the stricter `_nuxt` asset scan for stale homepage count copy.
- Deployed site passed `npm run seo:audit:live`, including live SEO, school-name, snippet-focused UI, funnel, and sitemap priority-school checks.
- Live sitemap audit reported `6238` URLs and `8` distinct `lastmod` dates.
- Live snippet-focused UI audit reported `3` pages and `9` assets checked.
- Fresh live homepage read after deployment showed `2,299 Papers` and `2,299 PDF exam papers indexed`; it no longer showed the stale `2,200+Papers` count copy.

Earlier evidence from run `25626208854` was too weak: a fresh live rendered read still exposed `2,200+Papers` even after that audit passed. Commits `410ed3fbe7c5fb018708162897f9038b534eb726`, `1426108dead1be8858d79d0d2917a610589dd753`, `99fdf9be92193a89b3fe322b8a857d7b1c2e2e29`, `cd1405e351c3c8e945b8e11d4ae729f138d23d2a`, and `f57790217ef993a2ae879a4c8c7298258da77c5c` hardened the normalizer and generated/live snippet audits to forbid `2,200+` and `totalPaperCountRounded` more broadly.

## Current Search Evidence

Checked on 2026-05-10 after the stricter deployment in run `25626609288`.

| Query | Evidence | Follow-up |
| --- | --- | --- |
| `site:sgexamhub.com sg exam papers` | Google results still showed stale homepage result text such as `2,200+Papers`, older title copy, `Anglo chinese School (junior)`, and `Methodist Girls' School (primary)`. The result was crawled before the stricter deployment, while the current live homepage now shows `2,299 Papers`. | Request reindex for `/` and resubmit the sitemap. Recheck until the Google snippet reflects the current live page. |
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
