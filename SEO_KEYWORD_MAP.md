# SG Exam Hub Keyword Map

Use this map with Google Search Console after deployment. The goal is to match each query cluster to one preferred landing page, then improve the title, description, internal links, and visible copy on that page if impressions are high but CTR is weak.

## Primary Keyword Clusters

| Query cluster | Preferred landing page | Search intent | What to monitor |
| --- | --- | --- | --- |
| sgexamhub | `/` | Branded navigation | CTR, sitelinks, paper clicks |
| sg exam hub | `/` | Branded or near-branded discovery | CTR, homepage average position |
| sg exam papers | `/` | Broad Singapore exam paper discovery | CTR, paper opens, downloads |
| singapore primary school exam papers | `/` | Broad discovery | CTR, homepage average position, paper clicks |
| free exam papers singapore | `/` | Broad discovery and download | CTR, paper downloads |
| singapore primary exam papers pdf | `/exam-papers` | Browse all PDFs | CTR, paper opens, downloads |
| primary school test papers | `/exam-papers` | General test paper search | Impressions, top clicked filters |
| 2025 primary exam papers | `/exam-papers/2025` | Latest paper search | CTR, paper opens |
| 2024 primary exam papers | `/exam-papers/2024` | Recent past-year papers | CTR, downloads |
| primary 6 exam papers | `/exam-papers/primary-6` | Level-specific revision | CTR, paper opens |
| primary 5 exam papers | `/exam-papers/primary-5` | Level-specific revision | CTR, paper opens |
| primary 4 exam papers | `/exam-papers/primary-4` | Level-specific revision | CTR, paper opens |
| primary 3 exam papers | `/exam-papers/primary-3` | Level-specific revision | CTR, paper opens |
| primary 2 exam papers | `/exam-papers/primary-2` | Lower-primary papers | CTR, paper opens |

## Subject And Level Pages

| Query cluster | Preferred landing page | Search intent | What to monitor |
| --- | --- | --- | --- |
| primary 6 maths exam papers | `/exam-papers/primary-6-mathematics` | P6 Maths practice | CTR, Maths paper downloads |
| primary 6 science exam papers | `/exam-papers/primary-6-science` | P6 Science practice | CTR, Science paper downloads |
| primary 6 english exam papers | `/exam-papers/primary-6-english` | P6 English practice | CTR, English paper opens |
| primary 5 maths exam papers | `/exam-papers/primary-5-mathematics` | P5 Maths practice | CTR, downloads |
| primary 5 science exam papers | `/exam-papers/primary-5-science` | P5 Science practice | CTR, downloads |
| primary 4 maths exam papers | `/exam-papers/primary-4-mathematics` | P4 Maths practice | CTR, downloads |
| higher chinese exam papers | `/exam-papers/higher-chinese` | Higher Chinese papers | CTR, paper opens |

## Year, Level, And Exam Type Pages

| Query cluster | Preferred landing page | Search intent | What to monitor |
| --- | --- | --- | --- |
| 2025 primary 6 maths exam papers | `/exam-papers/2025-primary-6-mathematics` | Latest P6 Maths papers | CTR, paper downloads |
| 2025 primary 6 science exam papers | `/exam-papers/2025-primary-6-science` | Latest P6 Science papers | CTR, paper downloads |
| 2025 primary 6 SA2 exam papers | `/exam-papers/2025-primary-6-sa2` | Latest P6 SA2 papers | CTR, paper opens |
| 2025 primary 6 maths SA2 exam papers | `/exam-papers/2025-primary-6-mathematics-sa2` | Latest P6 Maths final assessment papers | CTR, paper downloads |
| 2025 primary 6 science SA2 exam papers | `/exam-papers/2025-primary-6-science-sa2` | Latest P6 Science final assessment papers | CTR, paper downloads |
| primary 6 maths SA2 exam papers | `/exam-papers/primary-6-mathematics-sa2` | P6 Maths SA2 practice | CTR, paper downloads |
| primary 6 science SA2 exam papers | `/exam-papers/primary-6-science-sa2` | P6 Science SA2 practice | CTR, paper downloads |
| primary 6 SA2 exam papers | `/exam-papers/primary-6-sa2` | P6 final assessment practice | CTR, downloads |
| primary 6 SA1 exam papers | `/exam-papers/primary-6-sa1` | P6 mid-year practice | CTR, downloads |
| SA2 exam papers | `/exam-papers/sa2` | Broad SA2 practice | CTR, paper opens |
| SA1 exam papers | `/exam-papers/sa1` | Broad SA1 practice | CTR, paper opens |
| WA1 exam papers | `/exam-papers/wa1` | Weighted assessment practice | CTR, paper opens |
| WA2 exam papers | `/exam-papers/wa2` | Weighted assessment practice | CTR, paper opens |
| WA3 exam papers | `/exam-papers/wa3` | Weighted assessment practice | CTR, paper opens |

## School Pages

| Query cluster | Preferred landing page | Search intent | What to monitor |
| --- | --- | --- | --- |
| raffles girls primary school exam papers | `/exam-papers/school-raffles-girls-primary-school` | School-specific papers | CTR, downloads |
| nanyang primary school exam papers | `/exam-papers/school-nanyang-primary-school` | School-specific papers | CTR, downloads |
| nanyang primary p6 maths exam papers | `/exam-papers/primary-6-mathematics-school-nanyang-primary-school` | School and subject-specific practice | CTR, paper downloads |
| nanyang primary p6 science exam papers | `/exam-papers/primary-6-science-school-nanyang-primary-school` | School and subject-specific practice | CTR, paper downloads |
| henry park primary school exam papers | `/exam-papers/school-henry-park-primary-school` | School-specific papers | CTR, downloads |
| henry park primary p6 maths exam papers | `/exam-papers/primary-6-mathematics-school-henry-park-primary-school` | School and subject-specific practice | CTR, paper downloads |
| ai tong school exam papers | `/exam-papers/school-ai-tong-school` | School-specific papers | CTR, downloads |
| nan hua primary school exam papers | `/exam-papers/school-nan-hua-primary-school` | School-specific papers | CTR, downloads |
| nan hua primary p6 science exam papers | `/exam-papers/primary-6-science-school-nan-hua-primary-school` | School and subject-specific practice | CTR, paper downloads |
| rosyth school exam papers | `/exam-papers/school-rosyth-school` | School-specific papers | CTR, downloads |

## GSC Review Workflow

1. Open Google Search Console Performance.
2. Filter Search type to Web and date range to last 28 days.
3. Export queries with impressions, clicks, CTR, average position, and page.
4. Group queries by the clusters above.
5. For each cluster, check whether Google is ranking the preferred landing page.
6. If Google ranks the wrong page, add more internal links to the preferred page and make the preferred page copy more specific.
7. If impressions are high but CTR is below 2%, improve title and description for that page.
8. If CTR is healthy but downloads are weak, improve the above-the-fold paper cards and download CTA.

## Priority Rules

- Improve pages with high impressions and average position 4-20 first.
- Ignore very low-impression queries until they repeat across several weeks.
- Prefer one strong landing page per query cluster instead of splitting similar keywords across many pages.
- Use exact query wording in visible headings only when it reads naturally.
- Keep page titles under 70 characters and descriptions under 170 characters, then run `npm run seo:audit`.
