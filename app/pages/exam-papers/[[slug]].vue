<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import dropdownOptions from "../../../public/json/dropdownOptions.json";
import type { DropdownData } from "~/composables/usePapers";
import {
  seoRoutes,
  getSeoRouteBySlug,
  allParsedPapers,
  getPapersForRoute,
} from "~/utils/paperSeo";
import type { PaperSeoRoute } from "~/utils/paperSeo";
import {
  trackEvent,
  trackPaperDownload,
  trackPaperViewClick,
  trackSiteSearch,
} from "~/utils/analytics";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";

const route = useRoute();
const slugParam = route.params.slug;
const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";
const seoRoute = getSeoRouteBySlug(slug);

if (!seoRoute) {
  throw createError({ statusCode: 404, statusMessage: "Exam paper index not found" });
}

const options = dropdownOptions as DropdownData;

// Locked filters come from the URL slug; they can't be edited inline.
const lockedLevel = seoRoute.levelCode || "";
const lockedSubject = seoRoute.subjectCode || "";
const lockedType = seoRoute.typeCode || "";
const lockedYear = seoRoute.year || "";
const lockedSchool = seoRoute.schoolCode || "";

const initialFilters = () => ({
  Level: lockedLevel || "0",
  Subject: lockedSubject || "0",
  Year: lockedYear || "0",
  Type: lockedType || "0",
  School: lockedSchool || "0",
});

const filters = ref(initialFilters());
const paperSearchQuery = ref("");
const visibleLimit = ref(60);
const resetFilters = () => {
  filters.value = initialFilters();
  paperSearchQuery.value = "";
  visibleLimit.value = 60;
  trackEvent("paper_filters_reset", {
    source: "index_filters",
    page_slug: slug,
  });
};

const filteredPapers = computed(() => {
  const searchTerms = paperSearchQuery.value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return allParsedPapers.filter((paper) => {
    const f = filters.value;
    if (f.Level !== "0" && paper.levelCode !== f.Level) return false;
    if (f.School !== "0" && paper.schoolCode !== f.School) return false;
    if (f.Subject !== "0" && paper.subjectCode !== f.Subject) return false;
    if (f.Type !== "0" && paper.typeCode !== f.Type) return false;
    if (f.Year !== "0" && paper.yearCode !== f.Year) return false;

    if (searchTerms.length) {
      const searchableText = [
        paper.filename,
        paper.yearCode,
        paper.levelCode,
        paper.levelName,
        paper.levelName.replace(/^P([1-6])$/, "Primary $1"),
        paper.schoolName,
        paper.subjectName,
        paper.subjectName === "Mathematics" ? "Maths" : "",
        paper.typeName,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchTerms.every((term) => searchableText.includes(term))) return false;
    }

    return true;
  });
});

const routePapers = computed(() => getPapersForRoute(seoRoute));
const starterPapers = computed(() => routePapers.value.slice(0, 3));
const primaryCollectionPaper = computed(() => starterPapers.value[0] || routePapers.value[0]);
const routeLatestYear = computed(() => {
  const years = routePapers.value
    .map((paper) => Number(paper.yearCode))
    .filter((year) => Number.isFinite(year));

  return years.length ? Math.max(...years) : "";
});
const collectionFreshnessLabel = computed(() =>
  routeLatestYear.value
    ? `Latest available in this collection: ${routeLatestYear.value} · ${seoRoute.paperCount.toLocaleString()} PDF papers`
    : `${seoRoute.paperCount.toLocaleString()} PDF papers indexed`,
);
const resultCount = computed(() => filteredPapers.value.length);
const visiblePapers = computed(() => filteredPapers.value.slice(0, visibleLimit.value));
const canShowMore = computed(() => visiblePapers.value.length < resultCount.value);
const showMorePapers = () => {
  visibleLimit.value += 60;
  trackEvent("paper_show_more", {
    source: "index_results",
    page_slug: slug,
    page_path: seoRoute.path,
    visible_count: visiblePapers.value.length,
    result_count: resultCount.value,
  });
};
const trackFilterChange = (
  filterName: keyof typeof filters.value,
  filterValue: string,
) => {
  visibleLimit.value = 60;
  trackEvent("paper_filter_change", {
    source: "index_filters",
    page_slug: slug,
    filter_name: filterName,
    filter_value: filterValue,
    result_count: resultCount.value,
  });
};
const handlePaperSearchInput = () => {
  visibleLimit.value = 60;
};
const trackCollectionPaperSearch = () => {
  visibleLimit.value = 60;
  trackSiteSearch(paperSearchQuery.value, "index_search", {
    page_slug: slug,
    page_path: seoRoute.path,
    result_count: resultCount.value,
  });
};
const emptyFallbackLinks = computed(() => [
  {
    label: pageTitle.value,
    to: seoRoute.path,
  },
  {
    label: "Primary 6 SA2 papers",
    to: "/exam-papers/primary-6-sa2",
  },
  {
    label: "2026 revision papers",
    to: "/exam-papers/2026-revision",
  },
  {
    label: "Top school papers",
    to: "/top-school-exam-papers",
  },
]);
const trackEmptyFallbackClick = (link: { label: string; to: string }) => {
  trackEvent("empty_search_recovery_click", {
    source: "index_empty_state",
    page_slug: slug,
    page_path: seoRoute.path,
    target_label: link.label,
    target_path: link.to,
    result_count: resultCount.value,
    search_query: paperSearchQuery.value.trim() || undefined,
  });
};

// View mode (grid vs list) — shared with homepage via localStorage.
const viewMode = ref<"grid" | "list">("grid");
onMounted(() => {
  const initialSearchQuery = route.query.q;
  if (typeof initialSearchQuery === "string") {
    paperSearchQuery.value = initialSearchQuery.slice(0, 120);
  }

  const saved = localStorage.getItem("paperViewMode");
  if (saved === "grid" || saved === "list") viewMode.value = saved;
});
const setViewMode = (mode: "grid" | "list") => {
  viewMode.value = mode;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("paperViewMode", mode);
  }
  trackEvent("paper_view_mode_change", {
    source: "index_results",
    page_slug: slug,
    mode,
  });
};

type RelatedCollectionLink = {
  path: string;
  title: string;
  paperCount: number;
};

const routeDimensionKeys = [
  "year",
  "levelCode",
  "subjectCode",
  "typeCode",
  "schoolCode",
] as const;

const cleanRouteTitle = (item: PaperSeoRoute) =>
  item.title.replace(" | SG Exam Hub", "");

const routeDimensionCount = (item: PaperSeoRoute) =>
  routeDimensionKeys.filter((key) => Boolean(item[key])).length;

const currentDimensions = computed(() =>
  routeDimensionKeys.filter((key) => Boolean(seoRoute[key])),
);

const routeMatchesAllCurrentDimensions = (item: PaperSeoRoute) =>
  currentDimensions.value.every((key) => item[key] === seoRoute[key]);

const routeIsBroaderThanCurrent = (item: PaperSeoRoute) =>
  routeDimensionCount(item) < currentDimensions.value.length &&
  routeDimensionKeys.every((key) => !item[key] || item[key] === seoRoute[key]);

const routeOverlapScore = (item: PaperSeoRoute) =>
  routeDimensionKeys.reduce(
    (score, key) => score + (seoRoute[key] && item[key] === seoRoute[key] ? 1 : 0),
    0,
  );

const relatedRouteSort = (a: PaperSeoRoute, b: PaperSeoRoute) => {
  const aSchoolPenalty = a.schoolCode ? 1 : 0;
  const bSchoolPenalty = b.schoolCode ? 1 : 0;
  if (aSchoolPenalty !== bSchoolPenalty) return aSchoolPenalty - bSchoolPenalty;
  const aDimensions = routeDimensionCount(a);
  const bDimensions = routeDimensionCount(b);
  if (aDimensions !== bDimensions) return bDimensions - aDimensions;
  if (a.paperCount !== b.paperCount) return b.paperCount - a.paperCount;
  return cleanRouteTitle(a).localeCompare(cleanRouteTitle(b));
};

const toRelatedCollectionLink = (item: PaperSeoRoute): RelatedCollectionLink => ({
  path: item.path,
  title: cleanRouteTitle(item),
  paperCount: item.paperCount,
});

const relatedCollectionGroups = computed(() => {
  const usedPaths = new Set<string>([seoRoute.path]);
  const takeRoutes = (
    routes: PaperSeoRoute[],
    limit: number,
    sortBy: (a: PaperSeoRoute, b: PaperSeoRoute) => number = relatedRouteSort,
  ) => {
    const selected = routes
      .filter((item) => item.paperCount > 0 && !usedPaths.has(item.path))
      .sort(sortBy)
      .slice(0, limit);

    selected.forEach((item) => usedPaths.add(item.path));
    return selected.map(toRelatedCollectionLink);
  };

  const addFilterLinks = takeRoutes(
    seoRoutes.filter(
      (item) =>
        routeMatchesAllCurrentDimensions(item) &&
        routeDimensionCount(item) > currentDimensions.value.length,
    ),
    8,
  );

  const nearbyMinimumOverlap = Math.max(1, Math.min(2, currentDimensions.value.length));
  const nearbyLinks = takeRoutes(
    seoRoutes.filter(
      (item) =>
        routeOverlapScore(item) >= nearbyMinimumOverlap &&
        !routeMatchesAllCurrentDimensions(item) &&
        !routeIsBroaderThanCurrent(item),
    ),
    8,
    (a, b) => {
      const overlapDifference = routeOverlapScore(b) - routeOverlapScore(a);
      return overlapDifference || relatedRouteSort(a, b);
    },
  );

  const broaderLinks = takeRoutes(
    seoRoutes.filter((item) => routeIsBroaderThanCurrent(item)),
    6,
    (a, b) => routeDimensionCount(b) - routeDimensionCount(a) || relatedRouteSort(a, b),
  );

  return [
    {
      title: "Add a filter",
      description: "Narrow this collection by exam type, school, year, level or subject.",
      items: addFilterLinks,
    },
    {
      title: "Nearby collections",
      description: "Move sideways to similar exam paper searches with overlapping filters.",
      items: nearbyLinks,
    },
    {
      title: "Broader searches",
      description: "Step back to larger collections when you want more papers to compare.",
      items: broaderLinks,
    },
  ].filter((group) => group.items.length);
});

const trackRelatedCollectionClick = (
  item: RelatedCollectionLink,
  groupTitle: string,
) => {
  trackEvent("related_collection_click", {
    source: "collection_related_collections",
    page_slug: slug || "exam-papers",
    page_path: seoRoute.path,
    related_group: groupTitle,
    related_path: item.path,
    related_title: item.title,
    related_paper_count: item.paperCount,
  });
};

const pageUrl = `https://sgexamhub.com${seoRoute.path}`;
const pageTitle = seoRoute.title.replace(" | SG Exam Hub", "");
const breadcrumbItems = computed(() => [
  { name: "Home", item: "https://sgexamhub.com/" },
  { name: "Exam Papers", item: "https://sgexamhub.com/exam-papers" },
  { name: pageTitle, item: pageUrl },
]);
const readableLevel = computed(() =>
  seoRoute.levelCode
    ? (options.Level.find((item) => item.code === seoRoute.levelCode)?.name || "").replace(
        /^P([1-6])$/,
        "Primary $1",
      )
    : "",
);
const readableSubject = computed(() =>
  seoRoute.subjectCode
    ? options.Subject.find((item) => item.code === seoRoute.subjectCode)?.name || ""
    : "",
);
const assessmentPracticeHeading = computed(() => {
  const level = readableLevel.value.replace(/^Primary ([1-6])$/, "P$1");
  const subject =
    readableSubject.value === "Mathematics" ? "Maths" : readableSubject.value;
  const focus = [level, subject].filter(Boolean).join(" ");
  return focus
    ? `Compare ${focus} assessment papers`
    : "Compare primary assessment papers";
});
const subjectPracticeHeading = computed(() => {
  const level = readableLevel.value.replace(/^Primary ([1-6])$/, "P$1");
  const subject =
    readableSubject.value === "Mathematics" ? "Maths" : readableSubject.value;
  const focus = [level, subject].filter(Boolean).join(" ");
  return focus ? `Continue ${focus} revision` : "Continue subject revision";
});
const yearPracticeHeading = computed(() =>
  seoRoute.year
    ? `Start with ${seoRoute.year} primary exam papers`
    : "Start with recent primary exam papers",
);
const readableType = computed(() =>
  seoRoute.typeCode
    ? (options.Type.find((item) => item.code === seoRoute.typeCode)?.name || "").replace(
        /^Practice Paper$/,
        "Practice Papers",
      )
    : "",
);
const readableSchool = computed(() =>
  seoRoute.schoolCode
    ? options.School.find((item) => item.code === seoRoute.schoolCode)?.name || ""
    : "",
);
const collectionAnalyticsContext = computed(() => ({
  page_slug: slug || "exam-papers",
  page_path: seoRoute.path,
  page_title: pageTitle,
  paper_count: seoRoute.paperCount,
  year: seoRoute.year || undefined,
  level: readableLevel.value || undefined,
  subject: readableSubject.value || undefined,
  exam_type: readableType.value || undefined,
  school: readableSchool.value || undefined,
  search_query: paperSearchQuery.value.trim() || undefined,
}));
const trackCollectionPaperView = (filename: string) => {
  trackPaperViewClick(filename, "index_results", collectionAnalyticsContext.value);
};
const trackCollectionPaperDownload = (filename: string) => {
  trackPaperDownload(filename, "index_results", collectionAnalyticsContext.value);
};
const trackStarterPaperView = (filename: string) => {
  trackPaperViewClick(filename, "collection_starter_papers", collectionAnalyticsContext.value);
};
const trackStarterPaperDownload = (filename: string) => {
  trackPaperDownload(filename, "collection_starter_papers", collectionAnalyticsContext.value);
};
const trackCollectionHeroPaperView = (filename: string) => {
  trackPaperViewClick(filename, "collection_hero_cta", collectionAnalyticsContext.value);
};
const trackCollectionHeroPaperDownload = (filename: string) => {
  trackPaperDownload(filename, "collection_hero_cta", collectionAnalyticsContext.value);
};
const trackCollectionMobilePaperView = (filename: string) => {
  trackPaperViewClick(filename, "collection_mobile_sticky", collectionAnalyticsContext.value);
};
const trackCollectionMobilePaperDownload = (filename: string) => {
  trackPaperDownload(filename, "collection_mobile_sticky", collectionAnalyticsContext.value);
};
const buildPaperDownloadName = (paper: {
  yearCode: string;
  levelName: string;
  subjectName: string;
  typeName: string;
  schoolName: string;
}) =>
  `${[
    paper.yearCode,
    paper.levelName,
    paper.subjectName,
    paper.typeName,
    paper.schoolName,
  ]
    .join("-")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")}.pdf`;
const landingIntro = computed(() => {
  const focus = [
    seoRoute.year,
    readableLevel.value,
    readableSubject.value,
    readableType.value,
    readableSchool.value,
  ]
    .filter(Boolean)
    .join(" ");

  const focusPaperLabel = focus.endsWith("Papers") ? focus : `${focus} exam papers`;

  return focus
    ? `This collection gathers ${seoRoute.paperCount.toLocaleString()} ${focusPaperLabel} in one place so parents and students can quickly compare papers, open a PDF viewer, and download useful practice papers for revision.`
    : `This exam paper index gathers ${seoRoute.paperCount.toLocaleString()} Singapore primary school test papers in one place so parents and students can browse by level, subject, year, school and exam type.`;
});
const focusLabel = computed(() =>
  [
    seoRoute.year,
    readableLevel.value,
    readableSubject.value === "Mathematics" ? "Maths" : readableSubject.value,
    readableType.value,
    readableSchool.value,
  ]
    .filter(Boolean)
    .join(" "),
);
const keywordPhrases = computed(() => {
  const focus = focusLabel.value || "Singapore primary school";
  const focusExamPaperLabel = focus.endsWith("Papers") ? focus : `${focus} exam papers`;
  const focusTestPaperLabel = focus.endsWith("Papers") ? focus : `${focus} test papers`;
  const phrases = [
    `free ${focusExamPaperLabel}`,
    `${focusTestPaperLabel} PDF download`,
    `${focus} practice papers for revision`,
  ];

  if (readableSubject.value === "Mathematics") {
    phrases.push(`${focus.replace("Maths", "Mathematics")} exam papers`);
  }

  if (seoRoute.levelCode === "6") {
    phrases.push(`${focus} PSLE practice papers`);
  }

  return [...new Set(phrases)];
});
const subjectRevisionAdvice = computed(() => {
  const subject = readableSubject.value;

  if (subject === "Mathematics") {
    return "For Maths practice, use each paper to check problem-solving speed, careless mistakes, word problems and multi-step questions before moving to another school paper.";
  }
  if (subject === "Science") {
    return "For Science revision, compare your answers with the question requirements and note repeated topics, keywords and explanation gaps after every attempt.";
  }
  if (subject === "English") {
    return "For English practice, focus on comprehension evidence, grammar accuracy, vocabulary use and time control across different school papers.";
  }
  if (subject === "Chinese" || subject === "Higher Chinese") {
    return "For Chinese practice, use the papers to revise comprehension, vocabulary, sentence structure and exam timing across different question types.";
  }

  return "Use this page to choose a focused set of papers, attempt one under timed conditions, then download related papers for follow-up practice.";
});
const studySteps = computed(() => [
  `Start with recent ${
    focusLabel.value.endsWith("Papers")
      ? focusLabel.value
      : `${focusLabel.value || "Singapore primary school"} papers`
  }, then use older papers to revise weak topics after each attempt.`,
  subjectRevisionAdvice.value,
  `Download selected PDFs for timed practice, marking, corrections and repeated revision before school assessments.`,
]);
const isPrimarySixCollection = computed(() => seoRoute.levelCode === "6");
const pslePracticeLinks = computed(() => {
  if (!isPrimarySixCollection.value) return [];

  const preferredRoutes = [
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === "6" &&
        route.subjectCode === seoRoute.subjectCode &&
        route.typeCode === "4",
    ),
    seoRoutes.find(
      (route) =>
        !route.year &&
        route.levelCode === "6" &&
        route.subjectCode === seoRoute.subjectCode &&
        route.typeCode === "4",
    ),
    seoRoutes.find(
      (route) => route.year === "2025" && route.levelCode === "6" && route.typeCode === "4",
    ),
    seoRoutes.find((route) => !route.year && route.levelCode === "6" && route.typeCode === "4"),
  ];

  return preferredRoutes
    .filter((route): route is PaperSeoRoute => Boolean(route))
    .filter((route) => route.path !== seoRoute.path)
    .filter(
      (route, index, routes) =>
        routes.findIndex((candidate) => candidate.path === route.path) === index,
    )
    .slice(0, 3)
    .map((route) => ({
      label: route.title.replace(" | SG Exam Hub", ""),
      path: route.path,
      count: route.paperCount,
    }));
});
const examTypeHighlights = computed(() => {
  const counts = new Map<string, number>();
  routePapers.value.forEach((paper) => {
    counts.set(paper.typeName, (counts.get(paper.typeName) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([name, count]) => ({
      name: name === "Practice Paper" ? "Practice Papers" : name,
      count,
    }));
});
const schoolDiscoveryLinks = computed(() => {
  if (seoRoute.schoolCode) return [];

  const counts = new Map<string, { code: string; name: string; count: number }>();
  routePapers.value.forEach((paper) => {
    const existing = counts.get(paper.schoolCode);
    if (existing) {
      existing.count += 1;
      return;
    }
    counts.set(paper.schoolCode, {
      code: paper.schoolCode,
      name: paper.schoolName,
      count: 1,
    });
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((school) => {
      const matchingRoutes = seoRoutes.filter((item) => {
        if (item.schoolCode !== school.code) return false;
        return true;
      });
      const route =
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            item.levelCode === seoRoute.levelCode &&
            item.subjectCode === seoRoute.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            item.levelCode === seoRoute.levelCode &&
            !item.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            item.subjectCode === seoRoute.subjectCode &&
            !item.levelCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            !item.levelCode &&
            !item.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            !item.year &&
            item.levelCode === seoRoute.levelCode &&
            item.subjectCode === seoRoute.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            !item.year &&
            !item.levelCode &&
            !item.subjectCode,
        );

      return route
        ? {
            name: school.name,
            count: school.count,
            path: route.path,
          }
        : null;
    })
    .filter((item): item is { name: string; count: number; path: string } => item !== null);
});
const schoolPracticeLinks = computed(() => {
  if (!seoRoute.schoolCode) return [];

  const preferredRoutes = [
    seoRoutes.find(
      (route) =>
        route.levelCode === "6" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.year &&
        !route.subjectCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === "2025" &&
        route.levelCode === "6" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.subjectCode,
    ),
    seoRoutes.find(
      (route) =>
        route.levelCode === "6" &&
        route.subjectCode === "3" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.year,
    ),
    seoRoutes.find(
      (route) =>
        route.subjectCode === "3" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.year &&
        !route.levelCode,
    ),
    seoRoutes.find(
      (route) =>
        route.levelCode === "6" &&
        route.subjectCode === "4" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.year,
    ),
    seoRoutes.find(
      (route) =>
        route.subjectCode === "4" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.year &&
        !route.levelCode,
    ),
    seoRoutes.find(
      (route) =>
        route.typeCode === "4" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.year &&
        !route.levelCode &&
        !route.subjectCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === "2025" &&
        route.typeCode === "4" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.levelCode &&
        !route.subjectCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === "2025" &&
        route.schoolCode === seoRoute.schoolCode &&
        !route.levelCode &&
        !route.subjectCode,
    ),
    seoRoutes.find(
      (route) =>
        route.schoolCode === seoRoute.schoolCode &&
        !route.year &&
        !route.levelCode &&
        !route.subjectCode,
    ),
  ];

  return preferredRoutes
    .filter((route): route is PaperSeoRoute => Boolean(route))
    .filter((route) => route.path !== seoRoute.path)
    .filter(
      (route, index, routes) =>
        routes.findIndex((candidate) => candidate.path === route.path) === index,
    )
    .slice(0, 4)
    .map((route) => ({
      label: route.title.replace(" | SG Exam Hub", ""),
      path: route.path,
      count: route.paperCount,
    }));
});
const subjectPracticeLinks = computed(() => {
  if (!seoRoute.levelCode || !seoRoute.subjectCode || seoRoute.typeCode || seoRoute.schoolCode) {
    return [];
  }

  const preferredRoutes = [
    seoRoutes.find(
      (route) =>
        route.year === "2025" &&
        route.levelCode === seoRoute.levelCode &&
        route.subjectCode === seoRoute.subjectCode &&
        !route.typeCode &&
        !route.schoolCode,
    ),
    seoRoutes.find(
      (route) =>
        route.levelCode === seoRoute.levelCode &&
        route.subjectCode === seoRoute.subjectCode &&
        route.typeCode === "4" &&
        !route.year &&
        !route.schoolCode,
    ),
    ...["3", "4", "1", "2", "5"]
      .filter((subjectCode) => subjectCode !== seoRoute.subjectCode)
      .map((subjectCode) =>
        seoRoutes.find(
          (route) =>
            route.levelCode === seoRoute.levelCode &&
            route.subjectCode === subjectCode &&
            !route.year &&
            !route.typeCode &&
            !route.schoolCode,
        ),
      ),
  ];

  return preferredRoutes
    .filter((route): route is PaperSeoRoute => Boolean(route))
    .filter((route) => route.path !== seoRoute.path)
    .filter(
      (route, index, routes) =>
        routes.findIndex((candidate) => candidate.path === route.path) === index,
    )
    .slice(0, 5)
    .map((route) => ({
      label: route.title.replace(" | SG Exam Hub", ""),
      path: route.path,
      count: route.paperCount,
    }));
});
const yearPracticeLinks = computed(() => {
  if (
    !seoRoute.year ||
    seoRoute.levelCode ||
    seoRoute.subjectCode ||
    seoRoute.typeCode ||
    seoRoute.schoolCode
  ) {
    return [];
  }

  const preferredRoutes = [
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === "6" &&
        !route.subjectCode &&
        !route.typeCode &&
        !route.schoolCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === "6" &&
        route.subjectCode === "3" &&
        !route.typeCode &&
        !route.schoolCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === "6" &&
        route.subjectCode === "4" &&
        !route.typeCode &&
        !route.schoolCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === "6" &&
        route.typeCode === "4" &&
        !route.subjectCode &&
        !route.schoolCode,
    ),
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.schoolCode === "5258" &&
        !route.levelCode &&
        !route.subjectCode &&
        !route.typeCode,
    ),
  ];

  return preferredRoutes
    .filter((route): route is PaperSeoRoute => Boolean(route))
    .filter((route) => route.path !== seoRoute.path)
    .filter(
      (route, index, routes) =>
        routes.findIndex((candidate) => candidate.path === route.path) === index,
    )
    .slice(0, 5)
    .map((route) => ({
      label: route.title.replace(" | SG Exam Hub", ""),
      path: route.path,
      count: route.paperCount,
    }));
});
const assessmentPracticeLinks = computed(() => {
  if (!seoRoute.typeCode || seoRoute.schoolCode) return [];

  const typeCodes = ["1", "2", "3", "4", "5", "6"];
  const currentIndex = typeCodes.indexOf(seoRoute.typeCode);
  const orderedTypeCodes = typeCodes
    .map((typeCode, index) => ({
      typeCode,
      distance: currentIndex === -1 ? index : Math.abs(index - currentIndex),
    }))
    .filter((item) => item.typeCode !== seoRoute.typeCode)
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        typeCodes.indexOf(a.typeCode) - typeCodes.indexOf(b.typeCode),
    )
    .map((item) => item.typeCode);

  const findRouteWithType = (typeCode: string) =>
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === seoRoute.levelCode &&
        route.subjectCode === seoRoute.subjectCode &&
        route.typeCode === typeCode &&
        !route.schoolCode,
    ) ||
    seoRoutes.find(
      (route) =>
        !route.year &&
        route.levelCode === seoRoute.levelCode &&
        route.subjectCode === seoRoute.subjectCode &&
        route.typeCode === typeCode &&
        !route.schoolCode,
    ) ||
    seoRoutes.find(
      (route) =>
        route.year === seoRoute.year &&
        route.levelCode === seoRoute.levelCode &&
        !route.subjectCode &&
        route.typeCode === typeCode &&
        !route.schoolCode,
    ) ||
    seoRoutes.find(
      (route) =>
        !route.year &&
        !route.levelCode &&
        !route.subjectCode &&
        route.typeCode === typeCode &&
        !route.schoolCode,
    );

  return orderedTypeCodes
    .map((typeCode) => findRouteWithType(typeCode))
    .filter((route): route is PaperSeoRoute => Boolean(route))
    .filter((route) => route.path !== seoRoute.path)
    .filter(
      (route, index, routes) =>
        routes.findIndex((candidate) => candidate.path === route.path) === index,
    )
    .slice(0, 5)
    .map((route) => ({
      label: route.title.replace(" | SG Exam Hub", ""),
      path: route.path,
      count: route.paperCount,
    }));
});
const faqItems = computed(() => {
  const items = [
    {
      question: `What is included in ${pageTitle}?`,
      answer: `${pageTitle} includes free Singapore primary school test papers that can be viewed online or downloaded as PDF files for revision practice.`,
    },
    {
      question: "How should students use these exam papers?",
      answer:
        "Students should try each paper under timed conditions, mark mistakes carefully, revise weak topics, and then attempt another related paper to check improvement.",
    },
    {
      question: "Can I download the papers for offline practice?",
      answer:
        "Yes. Open any paper from the list, then use the Download PDF button on the viewer page to save the paper for offline practice.",
    },
  ];

  if (isPrimarySixCollection.value) {
    items.splice(1, 0, {
      question: `Are these ${pageTitle} useful for PSLE revision?`,
      answer:
        "Yes. Primary 6 exam papers are useful for PSLE revision because students can practise timing, compare question styles across schools, and build a correction list before attempting another related paper.",
    });
  }

  return items;
});
const itemListElements = computed(() =>
  filteredPapers.value.slice(0, 30).map((paper, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://sgexamhub.com/view/${paper.filename}`,
    item: {
      "@type": "LearningResource",
      name: `${paper.yearCode} ${paper.levelName} ${paper.schoolName} ${paper.subjectName} ${paper.typeName}`,
      learningResourceType: "Exam paper",
      isAccessibleForFree: true,
      inLanguage: "en-SG",
      educationalLevel: paper.levelName,
      about: paper.subjectName,
      url: `https://sgexamhub.com/view/${paper.filename}`,
      encoding: {
        "@type": "MediaObject",
        contentUrl: buildPdfFileUrl(paper.filename),
        encodingFormat: "application/pdf",
        name: `${paper.yearCode} ${paper.levelName} ${paper.schoolName} ${paper.subjectName} ${paper.typeName} PDF`,
      },
      potentialAction: [
        {
          "@type": "ViewAction",
          target: `https://sgexamhub.com/view/${paper.filename}`,
        },
        {
          "@type": "DownloadAction",
          target: buildPdfFileUrl(paper.filename),
        },
      ],
    },
  })),
);

useHead({
  title: seoRoute.title,
  meta: [
    { name: "description", content: seoRoute.description },
    ...buildSocialMeta({
      title: seoRoute.title,
      description: seoRoute.description,
      url: pageUrl,
    }),
  ],
  link: [{ rel: "canonical", href: pageUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pageTitle,
          description: seoRoute.description,
          url: pageUrl,
          inLanguage: "en-SG",
          isPartOf: {
            "@type": "WebSite",
            name: "SG Exam Hub",
            url: "https://sgexamhub.com/",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems.value.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.item,
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.value.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to use ${pageTitle} for revision`,
          description: landingIntro.value,
          step: studySteps.value.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: `Step ${index + 1}`,
            text: step,
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${pageTitle} paper list`,
          numberOfItems: filteredPapers.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <div class="index-page">
    <header class="index-hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to SG Exam Hub
        </NuxtLink>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span aria-hidden="true">/</span>
          <NuxtLink to="/exam-papers">Exam Papers</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>{{ pageTitle }}</span>
        </nav>
        <h1>{{ pageTitle }}</h1>
        <p>{{ seoRoute.description }}</p>
        <p class="collection-freshness">{{ collectionFreshnessLabel }}</p>
        <div v-if="primaryCollectionPaper" class="collection-action-strip" data-nosnippet>
          <div>
            <span class="action-eyebrow">Best first step</span>
            <strong>Open the newest paper, then download PDFs for timed revision.</strong>
            <small>
              {{ primaryCollectionPaper.yearCode }} {{ primaryCollectionPaper.levelName }}
              {{ primaryCollectionPaper.subjectName }} {{ primaryCollectionPaper.typeName }}
              · {{ primaryCollectionPaper.schoolName }}
            </small>
          </div>
          <div class="collection-action-buttons">
            <NuxtLink
              :to="`/view/${primaryCollectionPaper.filename}`"
              @click="trackCollectionHeroPaperView(primaryCollectionPaper.filename)"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(primaryCollectionPaper.filename)"
              :download="buildPaperDownloadName(primaryCollectionPaper)"
              @click="trackCollectionHeroPaperDownload(primaryCollectionPaper.filename)"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Filter bar (locked fields hidden) -->
    <div class="filter-container" data-nosnippet>
      <div class="content-wrapper filter-grid">
        <div class="filter-group search-filter">
          <label for="collection-paper-search">Search papers</label>
          <input
            id="collection-paper-search"
            v-model="paperSearchQuery"
            type="search"
            inputmode="search"
            autocomplete="off"
            placeholder="Nanyang P6 Maths 2025"
            @input="handlePaperSearchInput"
            @change="trackCollectionPaperSearch"
          />
        </div>
        <div v-if="!lockedLevel" class="filter-group">
          <label>Level</label>
          <select
            v-model="filters.Level"
            @change="trackFilterChange('Level', filters.Level)"
          >
            <option v-for="opt in options.Level" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedSubject" class="filter-group">
          <label>Subject</label>
          <select
            v-model="filters.Subject"
            @change="trackFilterChange('Subject', filters.Subject)"
          >
            <option v-for="opt in options.Subject" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedYear" class="filter-group">
          <label>Year</label>
          <select
            v-model="filters.Year"
            @change="trackFilterChange('Year', filters.Year)"
          >
            <option v-for="opt in options.Year" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedType" class="filter-group">
          <label>Exam Type</label>
          <select
            v-model="filters.Type"
            @change="trackFilterChange('Type', filters.Type)"
          >
            <option v-for="opt in options.Type" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedSchool" class="filter-group school-select">
          <label>School</label>
          <select
            v-model="filters.School"
            @change="trackFilterChange('School', filters.School)"
          >
            <option v-for="opt in options.School" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <button class="reset-btn" @click="resetFilters">Reset Filters</button>
      </div>
    </div>

    <main class="content-wrapper main-content">
      <section class="landing-support" aria-labelledby="revision-guide">
        <div>
          <h2 id="revision-guide">Use these papers for focused revision</h2>
          <p>{{ landingIntro }}</p>
        </div>
        <ol>
          <li v-for="step in studySteps" :key="step">{{ step }}</li>
        </ol>
      </section>

      <section
        v-if="isPrimarySixCollection"
        class="psle-practice-panel"
        aria-labelledby="psle-practice-heading"
      >
        <div>
          <span>PSLE practice focus</span>
          <h2 id="psle-practice-heading">Use these Primary 6 papers before PSLE revision</h2>
          <p>
            Start with one recent paper, mark mistakes by topic, then open a related
            SA2 paper to check whether timing, accuracy and exam confidence improve.
          </p>
        </div>
        <div v-if="pslePracticeLinks.length" class="psle-practice-links">
          <NuxtLink
            v-for="link in pslePracticeLinks"
            :key="link.path"
            :to="link.path"
          >
            <strong>{{ link.label }}</strong>
            <small>{{ link.count }} PDF papers</small>
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="seoRoute.schoolCode && schoolPracticeLinks.length"
        class="school-practice-panel"
        aria-labelledby="school-practice-heading"
      >
        <div>
          <span>School paper paths</span>
          <h2 id="school-practice-heading">More {{ readableSchool }} exam papers</h2>
          <p>
            Continue with the same school, then compare P6 Maths, P6 Science and
            latest-year papers before choosing PDFs to download for revision.
          </p>
        </div>
        <div class="school-practice-links">
          <NuxtLink
            v-for="link in schoolPracticeLinks"
            :key="link.path"
            :to="link.path"
          >
            <strong>{{ link.label }}</strong>
            <small>{{ link.count }} PDF papers</small>
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="yearPracticeLinks.length"
        class="year-practice-panel"
        aria-labelledby="year-practice-heading"
      >
        <div>
          <span>Year paper paths</span>
          <h2 id="year-practice-heading">{{ yearPracticeHeading }}</h2>
          <p>
            Start broad with the full year index, then narrow to Primary 6,
            Maths, Science, SA2 or a top-school set before opening PDFs.
          </p>
        </div>
        <div class="year-practice-links">
          <NuxtLink
            v-for="link in yearPracticeLinks"
            :key="link.path"
            :to="link.path"
          >
            <strong>{{ link.label }}</strong>
            <small>{{ link.count }} PDF papers</small>
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="subjectPracticeLinks.length"
        class="subject-practice-panel"
        aria-labelledby="subject-practice-heading"
      >
        <div>
          <span>Subject revision path</span>
          <h2 id="subject-practice-heading">{{ subjectPracticeHeading }}</h2>
          <p>
            Open the latest papers for this subject first, then compare SA2 and
            nearby subject collections before downloading PDFs for timed practice.
          </p>
        </div>
        <div class="subject-practice-links">
          <NuxtLink
            v-for="link in subjectPracticeLinks"
            :key="link.path"
            :to="link.path"
          >
            <strong>{{ link.label }}</strong>
            <small>{{ link.count }} PDF papers</small>
          </NuxtLink>
        </div>
      </section>

      <section
        v-if="seoRoute.typeCode && assessmentPracticeLinks.length"
        class="assessment-practice-panel"
        aria-labelledby="assessment-practice-heading"
      >
        <div>
          <span>Assessment practice path</span>
          <h2 id="assessment-practice-heading">{{ assessmentPracticeHeading }}</h2>
          <p>
            Move between WA and SA papers with the same revision focus, then
            download the PDFs that best match the student's next practice session.
          </p>
        </div>
        <div class="assessment-practice-links">
          <NuxtLink
            v-for="link in assessmentPracticeLinks"
            :key="link.path"
            :to="link.path"
          >
            <strong>{{ link.label }}</strong>
            <small>{{ link.count }} PDF papers</small>
          </NuxtLink>
        </div>
      </section>

      <section class="search-support" aria-labelledby="search-support-heading">
        <div>
          <h2 id="search-support-heading">Find the right paper faster</h2>
          <p>
            This page is organized around searches parents and students commonly make
            before downloading Singapore primary school exam papers.
          </p>
        </div>
        <div class="search-support-grid">
          <div class="support-panel">
            <h3>Matching searches</h3>
            <ul>
              <li v-for="phrase in keywordPhrases" :key="phrase">{{ phrase }}</li>
            </ul>
          </div>
          <div v-if="examTypeHighlights.length" class="support-panel">
            <h3>Available exam types</h3>
            <ul>
              <li v-for="examType in examTypeHighlights" :key="examType.name">
                {{ examType.name }}: {{ examType.count }} PDFs
              </li>
            </ul>
          </div>
          <div v-if="schoolDiscoveryLinks.length" class="support-panel">
            <h3>Schools in this collection</h3>
            <div class="school-link-list">
              <NuxtLink
                v-for="school in schoolDiscoveryLinks"
                :key="school.path"
                :to="school.path"
              >
                {{ school.name }} ({{ school.count }})
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="collection-faq" aria-labelledby="collection-faq-heading">
        <div class="collection-faq-header">
          <h2 id="collection-faq-heading">Questions about this collection</h2>
          <p>
            Check what is included before opening a paper online or downloading
            a PDF for revision practice.
          </p>
        </div>
        <div class="collection-faq-grid">
          <article
            v-for="item in faqItems"
            :key="item.question"
            class="faq-card"
          >
            <h3>{{ item.question }}</h3>
            <p>{{ item.answer }}</p>
          </article>
        </div>
      </section>

      <section
        v-if="starterPapers.length"
        class="starter-section"
        data-nosnippet
        aria-labelledby="starter-papers-heading"
      >
        <div class="starter-section-header">
          <h2 id="starter-papers-heading">Start with recent papers</h2>
          <p>
            Open one paper from this collection first, then download useful PDFs
            for timed revision.
          </p>
        </div>
        <div class="starter-paper-grid">
          <article
            v-for="paper in starterPapers"
            :key="paper.filename"
            class="starter-paper"
          >
            <div class="starter-paper-meta">
              <span>{{ paper.yearCode }}</span>
              <span>{{ paper.levelName }}</span>
              <span>{{ paper.typeName }}</span>
            </div>
            <h3>
              {{ paper.schoolName }} {{ paper.subjectName }} paper
            </h3>
            <div class="starter-paper-actions">
              <NuxtLink
                :to="`/view/${paper.filename}`"
                @click="trackStarterPaperView(paper.filename)"
              >
                View Paper
              </NuxtLink>
              <a
                :href="buildPdfFileUrl(paper.filename)"
                :download="buildPaperDownloadName(paper)"
                @click="trackStarterPaperDownload(paper.filename)"
              >
                Download PDF
              </a>
            </div>
          </article>
        </div>
      </section>

      <section
        v-if="relatedCollectionGroups.length"
        class="related-section"
        aria-labelledby="related-collections-heading"
      >
        <div class="related-section-header">
          <h2 id="related-collections-heading">Related exam paper collections</h2>
          <p>
            Continue browsing with more focused, similar or broader Singapore
            primary exam paper pages.
          </p>
        </div>
        <div class="related-group-grid">
          <article
            v-for="group in relatedCollectionGroups"
            :key="group.title"
            class="related-group"
          >
            <h3>{{ group.title }}</h3>
            <p>{{ group.description }}</p>
            <div class="related-links">
              <NuxtLink
                v-for="item in group.items"
                :key="item.path"
                :to="item.path"
                @click="trackRelatedCollectionClick(item, group.title)"
              >
                <span>{{ item.title }}</span>
                <small>{{ item.paperCount.toLocaleString() }} PDFs</small>
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>

      <div class="results-header">
        <div class="results-meta">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h2>
            Showing <strong>{{ visiblePapers.length }}</strong> of
            <strong>{{ resultCount }}</strong> available papers
          </h2>
        </div>
        <div class="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'grid' }"
            :aria-pressed="viewMode === 'grid'"
            aria-label="Grid view"
            @click="setViewMode('grid')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'list' }"
            :aria-pressed="viewMode === 'list'"
            aria-label="List view"
            @click="setViewMode('list')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="resultCount === 0" class="empty-state">
        <span class="emoji">🔍</span>
        <h3>No papers found</h3>
        <p>Try adjusting your filters to find what you're looking for.</p>
        <div class="empty-fallback-links" aria-label="Popular exam paper paths">
          <NuxtLink
            v-for="link in emptyFallbackLinks"
            :key="link.to"
            :to="link.to"
            @click="trackEmptyFallbackClick(link)"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
        <button class="primary-btn" @click="resetFilters">Clear Filters</button>
      </div>

      <div v-else :class="['papers-container', `papers-${viewMode}`]" data-nosnippet>
        <div
          v-for="paper in visiblePapers"
          :key="paper.filename"
          class="paper-card"
        >
          <div class="card-header">
            <span class="badge year-badge">{{ paper.yearCode }}</span>
            <span class="badge level-badge">{{ paper.levelName }}</span>
          </div>
          <h3 class="school-name">{{ paper.schoolName }}</h3>
          <div class="card-details">
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">{{ paper.subjectName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Exam:</span>
              <span class="value">{{ paper.typeName }}</span>
            </div>
          </div>
          <div class="card-actions">
            <NuxtLink
              class="view-btn"
              :to="`/view/${paper.filename}`"
              @click="trackCollectionPaperView(paper.filename)"
            >
              View Paper
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </NuxtLink>
            <a
              class="download-btn"
              :href="buildPdfFileUrl(paper.filename)"
              :download="buildPaperDownloadName(paper)"
              @click="trackCollectionPaperDownload(paper.filename)"
            >
              Download PDF
            </a>
          </div>
        </div>
        <div v-if="canShowMore" class="load-more-wrap">
          <button class="load-more-btn" type="button" @click="showMorePapers">
            Show more papers
          </button>
        </div>
      </div>
    </main>
    <div v-if="primaryCollectionPaper" class="mobile-collection-action-bar" data-nosnippet>
      <NuxtLink
        class="mobile-collection-open"
        :to="`/view/${primaryCollectionPaper.filename}`"
        @click="trackCollectionMobilePaperView(primaryCollectionPaper.filename)"
      >
        Open Newest
      </NuxtLink>
      <a
        class="mobile-collection-download"
        :href="buildPdfFileUrl(primaryCollectionPaper.filename)"
        :download="buildPaperDownloadName(primaryCollectionPaper)"
        @click="trackCollectionMobilePaperDownload(primaryCollectionPaper.filename)"
      >
        Download PDF
      </a>
    </div>
    <footer class="index-footer">
      <div class="footer-inner">
        <NuxtLink to="/">SG Exam Hub</NuxtLink>
        <span class="footer-sep" aria-hidden="true">|</span>
        <NuxtLink to="/exam-papers">All exam papers</NuxtLink>
        <span class="footer-sep" aria-hidden="true">|</span>
        <NuxtLink to="/sitemap">Sitemap</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.index-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e293b;
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}

.content-wrapper {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.index-hero {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 2.5rem 0 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 1rem;
}

.back-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.breadcrumb a {
  color: #4f46e5;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #4338ca;
  text-decoration: underline;
}

.index-hero h1 {
  color: #0f172a;
  font-size: 2.25rem;
  line-height: 1.15;
  margin: 0.5rem 0 0.75rem;
}

.index-hero p {
  color: #475569;
  line-height: 1.6;
  max-width: 680px;
  margin: 0;
}

.index-hero .collection-freshness {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 800;
  margin-top: 0.75rem;
}

.collection-action-strip {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 1.25rem;
  max-width: 880px;
  padding: 1rem;
}

.collection-action-strip div:first-child {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.action-eyebrow {
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.collection-action-strip strong {
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.35;
}

.collection-action-strip small {
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.4;
}

.collection-action-buttons {
  display: flex;
  flex: 0 0 auto;
  gap: 0.5rem;
}

.collection-action-buttons a {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font-size: 0.84rem;
  font-weight: 900;
  justify-content: center;
  line-height: 1.2;
  min-height: 40px;
  padding: 0.65rem 0.85rem;
  text-align: center;
  text-decoration: none;
}

.collection-action-buttons a:first-child {
  background: #4f46e5;
  color: #ffffff;
}

.collection-action-buttons a:first-child:hover {
  background: #4338ca;
}

.collection-action-buttons a:last-child {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.collection-action-buttons a:last-child:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.main-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.landing-support {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 1.5rem;
  align-items: start;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.landing-support h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.landing-support p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.landing-support ol {
  color: #334155;
  display: grid;
  gap: 0.65rem;
  line-height: 1.5;
  margin: 0;
  padding-left: 1.25rem;
}

.landing-support li::marker {
  color: #4f46e5;
  font-weight: 800;
}

.psle-practice-panel {
  align-items: start;
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  margin-bottom: 2rem;
  padding: 1.25rem;
}

.psle-practice-panel span {
  color: #4f46e5;
  display: block;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.psle-practice-panel h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.psle-practice-panel p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.psle-practice-links {
  display: grid;
  gap: 0.65rem;
}

.psle-practice-links a {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem;
  text-decoration: none;
}

.psle-practice-links strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.psle-practice-links small {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.35;
}

.psle-practice-links a:hover {
  border-color: #93c5fd;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.1);
}

.psle-practice-links a:hover strong {
  color: #2563eb;
}

.school-practice-panel {
  align-items: start;
  background: #ffffff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  margin-bottom: 2rem;
  padding: 1.25rem;
}

.school-practice-panel span {
  color: #0369a1;
  display: block;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.school-practice-panel h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.school-practice-panel p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.school-practice-links {
  display: grid;
  gap: 0.65rem;
}

.school-practice-links a {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem;
  text-decoration: none;
}

.school-practice-links strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.school-practice-links small {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.35;
}

.school-practice-links a:hover {
  border-color: #7dd3fc;
  box-shadow: 0 14px 28px rgba(14, 165, 233, 0.1);
}

.school-practice-links a:hover strong {
  color: #0369a1;
}

.year-practice-panel {
  align-items: start;
  background: #ffffff;
  border: 1px solid #e9d5ff;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  margin-bottom: 2rem;
  padding: 1.25rem;
}

.year-practice-panel span {
  color: #7e22ce;
  display: block;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.year-practice-panel h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.year-practice-panel p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.year-practice-links {
  display: grid;
  gap: 0.65rem;
}

.year-practice-links a {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem;
  text-decoration: none;
}

.year-practice-links strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.year-practice-links small {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.35;
}

.year-practice-links a:hover {
  border-color: #c084fc;
  box-shadow: 0 14px 28px rgba(126, 34, 206, 0.1);
}

.year-practice-links a:hover strong {
  color: #7e22ce;
}

.subject-practice-panel {
  align-items: start;
  background: #ffffff;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  margin-bottom: 2rem;
  padding: 1.25rem;
}

.subject-practice-panel span {
  color: #c2410c;
  display: block;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.subject-practice-panel h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.subject-practice-panel p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.subject-practice-links {
  display: grid;
  gap: 0.65rem;
}

.subject-practice-links a {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem;
  text-decoration: none;
}

.subject-practice-links strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.subject-practice-links small {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.35;
}

.subject-practice-links a:hover {
  border-color: #fdba74;
  box-shadow: 0 14px 28px rgba(234, 88, 12, 0.1);
}

.subject-practice-links a:hover strong {
  color: #c2410c;
}

.assessment-practice-panel {
  align-items: start;
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  margin-bottom: 2rem;
  padding: 1.25rem;
}

.assessment-practice-panel span {
  color: #047857;
  display: block;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.assessment-practice-panel h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.assessment-practice-panel p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.assessment-practice-links {
  display: grid;
  gap: 0.65rem;
}

.assessment-practice-links a {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.85rem;
  text-decoration: none;
}

.assessment-practice-links strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.assessment-practice-links small {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 750;
  line-height: 1.35;
}

.assessment-practice-links a:hover {
  border-color: #86efac;
  box-shadow: 0 14px 28px rgba(22, 163, 74, 0.1);
}

.assessment-practice-links a:hover strong {
  color: #047857;
}

.search-support {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.search-support h2 {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.search-support p {
  color: #475569;
  line-height: 1.65;
  max-width: 760px;
  margin: 0 0 1.25rem;
}

.search-support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.support-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1rem;
}

.support-panel h3 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  margin: 0 0 0.75rem;
}

.support-panel ul {
  color: #334155;
  display: grid;
  gap: 0.5rem;
  line-height: 1.45;
  margin: 0;
  padding-left: 1.1rem;
}

.school-link-list {
  display: grid;
  gap: 0.55rem;
}

.school-link-list a {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.35;
  text-decoration: none;
}

.school-link-list a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.collection-faq {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.collection-faq-header {
  margin-bottom: 1rem;
}

.collection-faq h2 {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.collection-faq-header p {
  color: #475569;
  line-height: 1.65;
  max-width: 760px;
  margin: 0;
}

.collection-faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.faq-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1rem;
}

.faq-card h3 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0 0 0.55rem;
}

.faq-card p {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

/* Filter bar (mirrors homepage) */
.filter-container {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.25rem 0;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.filter-group.school-select {
  flex: 1 1 220px;
}

.filter-group.search-filter {
  flex: 1 1 260px;
  min-width: min(100%, 240px);
}

.filter-group label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-group select,
.filter-group input[type="search"] {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font-size: 0.9rem;
  font-family: inherit;
}

.filter-group input[type="search"]::placeholder {
  color: #94a3b8;
}

.filter-group select:focus,
.filter-group input[type="search"]:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.reset-btn {
  margin-left: auto;
  padding: 0.55rem 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.reset-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Results header */
.results-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #475569;
}

.search-icon {
  color: #2563eb;
}

.results-header h2 {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.results-header h2 strong {
  color: #0f172a;
  font-weight: 700;
}

.view-toggle {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  gap: 2px;
}

.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 34px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.view-toggle-btn:hover {
  color: #1e293b;
}

.view-toggle-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* Cards (mirrors homepage) */
.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.paper-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.paper-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  border-color: #2563eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.year-badge {
  background-color: #e0e7ff;
  color: #4338ca;
}

.level-badge {
  background-color: #f1f5f9;
  color: #475569;
}

.school-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
  line-height: 1.4;
  flex-grow: 1;
}

.card-details {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.detail-row .value {
  font-weight: 500;
  color: #334155;
}

.card-actions {
  display: grid;
  gap: 0.55rem;
}

.view-btn,
.download-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  text-decoration: none;
}

.view-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
}

.view-btn:hover {
  background-color: #4338ca;
}

.download-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.download-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.load-more-wrap {
  display: flex;
  grid-column: 1 / -1;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  min-height: 44px;
  padding: 0.75rem 1.4rem;
}

.load-more-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

/* List view overrides */
.papers-list .paper-card {
  flex-direction: row;
  align-items: center;
  padding: 1rem 1.25rem;
  gap: 1.5rem;
}

.papers-list .card-header {
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0;
  gap: 0.35rem;
  flex-shrink: 0;
  min-width: 70px;
}

.papers-list .school-name {
  flex: 1 1 auto;
  margin: 0;
  font-size: 1rem;
}

.papers-list .card-details {
  flex: 0 0 auto;
  margin-bottom: 0;
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
}

.papers-list .detail-row {
  flex-direction: column;
  margin: 0;
  min-width: 70px;
}

.papers-list .detail-row .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.papers-list .card-actions {
  flex: 0 0 150px;
}

.papers-list .view-btn,
.papers-list .download-btn {
  width: auto;
  padding: 0.6rem 1.25rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-state .emoji {
  font-size: 3rem;
}

.empty-state h3 {
  margin: 0.75rem 0 0.5rem;
  color: #0f172a;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 1.25rem;
}

.empty-fallback-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.empty-fallback-links a {
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 999px;
  color: #3730a3;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.55rem 0.85rem;
  text-decoration: none;
}

.empty-fallback-links a:hover {
  background: #e0e7ff;
  border-color: #818cf8;
}

.primary-btn {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.mobile-collection-action-bar {
  display: none;
}

/* Starter papers */
.starter-section {
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
}

.starter-section-header {
  margin-bottom: 1rem;
  max-width: 740px;
}

.starter-section h2,
.starter-section h3,
.starter-section p {
  margin: 0;
}

.starter-section h2 {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.35;
}

.starter-section-header p {
  color: #475569;
  line-height: 1.65;
  margin-top: 0.45rem;
}

.starter-paper-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.starter-paper {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
}

.starter-paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.starter-paper-meta span {
  background: #f1f5f9;
  border-radius: 999px;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.55rem;
}

.starter-paper h3 {
  color: #0f172a;
  flex: 1 1 auto;
  font-size: 1rem;
  line-height: 1.4;
}

.starter-paper-actions {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;
}

.starter-paper-actions a {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 800;
  justify-content: center;
  line-height: 1.25;
  min-height: 40px;
  padding: 0.55rem 0.75rem;
  text-align: center;
  text-decoration: none;
}

.starter-paper-actions a:first-child {
  background: #4f46e5;
  color: #ffffff;
}

.starter-paper-actions a:first-child:hover {
  background: #4338ca;
}

.starter-paper-actions a:last-child {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.starter-paper-actions a:last-child:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

/* Related indexes */
.related-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin: 2rem 0;
  padding: 1.5rem;
}

.related-section-header {
  max-width: 720px;
  margin-bottom: 1.25rem;
}

.related-section h2,
.related-section h3,
.related-section p {
  margin: 0;
}

.related-section h2 {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.25;
}

.related-section-header p,
.related-group p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 0.45rem;
}

.related-group-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.related-group {
  min-width: 0;
}

.related-group h3 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
}

.related-links {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.85rem;
}

.related-links a {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  color: #334155;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  padding: 0.7rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.related-links span {
  min-width: 0;
}

.related-links small {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.related-links a:hover {
  color: #2563eb;
  border-color: #c7d2fe;
}

.index-footer {
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  padding: 1.5rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  justify-content: center;
  margin: 0 auto;
  max-width: 1100px;
}

.footer-inner a {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.footer-inner a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.footer-sep {
  color: #cbd5e1;
  user-select: none;
}

@media (max-width: 640px) {
  .index-page {
    padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  }
  .index-hero h1 {
    font-size: 1.875rem;
  }
  .collection-action-strip,
  .collection-action-buttons {
    align-items: stretch;
    flex-direction: column;
  }
  .landing-support {
    grid-template-columns: 1fr;
  }
  .psle-practice-panel {
    grid-template-columns: 1fr;
  }
  .school-practice-panel {
    grid-template-columns: 1fr;
  }
  .year-practice-panel {
    grid-template-columns: 1fr;
  }
  .subject-practice-panel {
    grid-template-columns: 1fr;
  }
  .assessment-practice-panel {
    grid-template-columns: 1fr;
  }
  .filter-grid {
    flex-direction: column;
    align-items: stretch;
  }
  .related-section {
    padding: 1rem;
  }
  .starter-paper-grid {
    grid-template-columns: 1fr;
  }
  .starter-paper-actions {
    grid-template-columns: 1fr;
  }
  .related-group-grid {
    grid-template-columns: 1fr;
  }
  .reset-btn {
    margin-left: 0;
  }
  .papers-list .paper-card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .papers-list .card-header {
    flex-direction: row;
    justify-content: space-between;
    min-width: 0;
  }
  .papers-list .card-details {
    justify-content: space-between;
  }
  .papers-list .card-actions {
    flex: 0 0 auto;
  }
  .papers-list .view-btn,
  .papers-list .download-btn {
    width: 100%;
  }
  .mobile-collection-action-bar {
    align-items: center;
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid #dbe3ef;
    bottom: 0;
    box-shadow: 0 -14px 28px -24px rgba(15, 23, 42, 0.5);
    display: grid;
    gap: 0.65rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    left: 0;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    position: fixed;
    right: 0;
    z-index: 120;
  }
  .mobile-collection-action-bar a {
    align-items: center;
    border-radius: 8px;
    display: inline-flex;
    font-size: 0.9rem;
    font-weight: 800;
    justify-content: center;
    line-height: 1.2;
    min-height: 44px;
    padding: 0.65rem 0.7rem;
    text-align: center;
    text-decoration: none;
  }
  .mobile-collection-open {
    background: #4f46e5;
    color: #ffffff;
  }
  .mobile-collection-download {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #1e293b;
  }
}
</style>
