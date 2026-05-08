type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

export const trackEvent = (
  name: string,
  params: Record<string, string | number | boolean | undefined> = {},
) => {
  if (import.meta.server) return;

  const gtag = (window as GtagWindow).gtag;
  if (!gtag) return;

  gtag("event", name, {
    event_category: "exam_papers",
    ...params,
  });
};

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

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
