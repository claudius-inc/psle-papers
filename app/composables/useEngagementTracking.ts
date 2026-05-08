import { onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { trackEvent } from "~/utils/analytics";

export const useEngagementTracking = () => {
  if (import.meta.server) return;

  const route = useRoute();
  let timers: number[] = [];
  const sentScrollDepths = new Set<number>();

  const sendEngagedTime = (seconds: number) => {
    trackEvent("page_engaged_time", {
      path: route.fullPath,
      seconds,
    });
  };

  const resetTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [
      window.setTimeout(() => sendEngagedTime(30), 30000),
      window.setTimeout(() => sendEngagedTime(60), 60000),
    ];
  };

  const handleScroll = () => {
    const scrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) return;

    const depth = Math.round((window.scrollY / scrollableHeight) * 100);
    for (const threshold of [50, 90]) {
      if (depth < threshold || sentScrollDepths.has(threshold)) continue;
      sentScrollDepths.add(threshold);
      trackEvent("page_scroll_depth", {
        path: route.fullPath,
        percent: threshold,
      });
    }
  };

  const resetPageEngagement = () => {
    sentScrollDepths.clear();
    resetTimers();
    window.requestAnimationFrame(handleScroll);
  };

  onMounted(() => {
    resetPageEngagement();
    window.addEventListener("scroll", handleScroll, { passive: true });
  });

  watch(() => route.fullPath, resetPageEngagement);

  onBeforeUnmount(() => {
    timers.forEach((timer) => window.clearTimeout(timer));
    window.removeEventListener("scroll", handleScroll);
  });
};
