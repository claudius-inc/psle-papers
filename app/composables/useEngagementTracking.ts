import { onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { trackEvent } from "~/utils/analytics";

export const useEngagementTracking = () => {
  if (import.meta.server) return;

  const route = useRoute();
  let timers: number[] = [];
  const sentScrollDepths = new Set<number>();
  let currentPath = route.fullPath;
  let pageStartedAt = Date.now();
  let maxScrollDepth = 0;
  let sentPageSummary = false;

  const sendEngagedTime = (seconds: number) => {
    trackEvent("page_engaged_time", {
      path: currentPath,
      seconds,
    });
  };

  const sendPageSummary = (reason: string) => {
    if (sentPageSummary) return;
    sentPageSummary = true;

    trackEvent("page_session_summary", {
      path: currentPath,
      reason,
      seconds: Math.max(1, Math.round((Date.now() - pageStartedAt) / 1000)),
      max_scroll_percent: maxScrollDepth,
    });
  };

  const resetTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [
      window.setTimeout(() => sendEngagedTime(10), 10000),
      window.setTimeout(() => sendEngagedTime(30), 30000),
      window.setTimeout(() => sendEngagedTime(60), 60000),
      window.setTimeout(() => sendEngagedTime(120), 120000),
    ];
  };

  const handleScroll = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) {
      maxScrollDepth = 100;
      return;
    }

    const depth = Math.round((window.scrollY / scrollableHeight) * 100);
    maxScrollDepth = Math.max(maxScrollDepth, Math.min(100, depth));
    for (const threshold of [25, 50, 75, 90]) {
      if (depth < threshold || sentScrollDepths.has(threshold)) continue;
      sentScrollDepths.add(threshold);
      trackEvent("page_scroll_depth", {
        path: currentPath,
        percent: threshold,
      });
    }
  };

  const resetPageEngagement = () => {
    currentPath = route.fullPath;
    pageStartedAt = Date.now();
    maxScrollDepth = 0;
    sentPageSummary = false;
    sentScrollDepths.clear();
    resetTimers();
    window.requestAnimationFrame(handleScroll);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      sendPageSummary("hidden");
    }
  };

  const handlePageHide = () => {
    sendPageSummary("pagehide");
  };

  onMounted(() => {
    resetPageEngagement();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  watch(() => route.fullPath, () => {
    sendPageSummary("route_change");
    resetPageEngagement();
  });

  onBeforeUnmount(() => {
    sendPageSummary("unmount");
    timers.forEach((timer) => window.clearTimeout(timer));
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("pagehide", handlePageHide);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });
};
