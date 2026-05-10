<script setup lang="ts">
useEngagementTracking();

useHead({
  meta: [
    {
      name: "robots",
      content: "index, follow, max-snippet:160, max-image-preview:large",
    },
  ],
  link: [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    { rel: "preconnect", href: "https://raw.githubusercontent.com" },
    { rel: "dns-prefetch", href: "https://raw.githubusercontent.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
    },
  ],
  script: [
    {
      src: "https://www.googletagmanager.com/gtag/js?id=G-7WKP91PV8C",
      async: true,
    },
    {
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7WKP91PV8C', { send_page_view: false });
      `,
      type: "text/javascript",
    },
  ],
});
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
/* Global Styles */
body {
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}

/* Custom Scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 640px) {
  .index-page:has(.collection-action-strip) {
    padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  }

  .collection-action-strip {
    align-items: center !important;
    background: rgba(255, 255, 255, 0.96) !important;
    border: 0 !important;
    border-top: 1px solid #dbe3ef !important;
    border-radius: 0 !important;
    bottom: 0 !important;
    box-shadow: 0 -14px 28px -24px rgba(15, 23, 42, 0.5) !important;
    display: block !important;
    left: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px)) !important;
    position: fixed !important;
    right: 0 !important;
    z-index: 120 !important;
  }

  .collection-action-strip > div:first-child {
    display: none !important;
  }

  .collection-action-buttons {
    display: grid !important;
    gap: 0.65rem !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
  }

  .collection-action-buttons a {
    border-radius: 8px !important;
    font-size: 0.9rem !important;
    font-weight: 800 !important;
    line-height: 1.2 !important;
    min-height: 44px !important;
    padding: 0.65rem 0.7rem !important;
    width: 100% !important;
  }
}
</style>
