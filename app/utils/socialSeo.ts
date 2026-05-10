import type { ComputedRef } from "vue";

type MetaContent = string | ComputedRef<string>;

export const siteName = "SG Exam Hub";
export const siteUrl = "https://sgexamhub.com";
export const socialImageUrl = `${siteUrl}/og-image.svg`;
export const socialImageAlt =
  "SG Exam Hub free Singapore primary school exam papers";

export const buildSocialMeta = ({
  title,
  description,
  url,
  type = "website",
}: {
  title: MetaContent;
  description: MetaContent;
  url: string;
  type?: "website" | "article";
}) => [
  { property: "og:title", content: title },
  { property: "og:description", content: description },
  { property: "og:type", content: type },
  { property: "og:url", content: url },
  { property: "og:site_name", content: siteName },
  { property: "og:image", content: socialImageUrl },
  { property: "og:image:alt", content: socialImageAlt },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:image", content: socialImageUrl },
  { name: "twitter:image:alt", content: socialImageAlt },
];
