type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

const attributionStorageKey = "sg_exam_hub_attribution";

const getReferrerHost = () => {
  if (!document.referrer) return "direct";

  try {
    return new URL(document.referrer).hostname || "unknown";
  } catch {
    return "unknown";
  }
};

const getSessionAttribution = (): AnalyticsParams => {
  if (import.meta.server) return {};

  try {
    const existingAttribution = window.sessionStorage.getItem(attributionStorageKey);
    if (existingAttribution) {
      return JSON.parse(existingAttribution) as AnalyticsParams;
    }
  } catch {
    try {
      window.sessionStorage.removeItem(attributionStorageKey);
    } catch {
      // Ignore blocked storage and send volatile attribution below.
    }
  }

  const referrerHost = getReferrerHost();
  const attribution = {
    landing_path: `${window.location.pathname}${window.location.search}`,
    referrer_host: referrerHost,
    is_google_referrer: /(^|\.)google\./i.test(referrerHost),
  };

  try {
    window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(attribution));
  } catch {
    // Keep analytics working even when storage is blocked.
  }

  return attribution;
};

export const trackEvent = (
  name: string,
  params: AnalyticsParams = {},
) => {
  if (import.meta.server) return;

  const gtag = (window as GtagWindow).gtag;
  if (!gtag) return;

  gtag("event", name, {
    event_category: "exam_papers",
    ...getSessionAttribution(),
    ...params,
  });
};

export const trackPageView = (source: string) => {
  if (import.meta.server) return;

  trackEvent("page_view", {
    source,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: document.title,
  });
};

export const trackPaperViewClick = (
  filename: string,
  source: string,
  params: AnalyticsParams = {},
) => {
  trackEvent("paper_view_click", {
    paper_id: filename,
    source,
    ...params,
  });
};

export const trackPaperOpen = (
  filename: string,
  source: string,
  params: AnalyticsParams = {},
) => {
  trackEvent("paper_open", {
    paper_id: filename,
    source,
    ...params,
  });
};

export const trackPaperDownload = (
  filename: string,
  source: string,
  params: AnalyticsParams = {},
) => {
  trackEvent("paper_download", {
    paper_id: filename,
    source,
    ...params,
  });
};
