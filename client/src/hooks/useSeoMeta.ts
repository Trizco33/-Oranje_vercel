import { useEffect } from "react";

type SeoMetaInput = {
  title: string;
  description?: string | null;
  keywords?: string | null;
  canonical?: string | null;
  index?: boolean;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string;
  ogUrl?: string | null;
};

function setMetaTag(
  selector: string,
  attribute: "name" | "property",
  value: string,
  content?: string | null
) {
  let tag = document.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, value);
    document.head.appendChild(tag);
  }

  if (content && content.trim()) {
    tag.setAttribute("content", content);
  } else {
    tag.remove();
  }
}

function setLinkTag(rel: string, href?: string | null) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!href || !href.trim()) {
    link?.remove();
    return;
  }

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

export function useSeoMeta(input: SeoMetaInput | null | undefined) {
  useEffect(() => {
    if (!input) return;

    document.title = input.title;

    setMetaTag('meta[name="description"]', "name", "description", input.description);
    setMetaTag('meta[name="keywords"]', "name", "keywords", input.keywords);
    setMetaTag(
      'meta[name="robots"]',
      "name",
      "robots",
      input.index === false ? "noindex,nofollow" : "index,follow"
    );

    setMetaTag(
      'meta[property="og:title"]',
      "property",
      "og:title",
      input.ogTitle || input.title
    );
    setMetaTag(
      'meta[property="og:description"]',
      "property",
      "og:description",
      input.ogDescription || input.description
    );
    setMetaTag(
      'meta[property="og:image"]',
      "property",
      "og:image",
      input.ogImage
    );
    setMetaTag(
      'meta[property="og:type"]',
      "property",
      "og:type",
      input.ogType || "website"
    );
    setMetaTag(
      'meta[property="og:url"]',
      "property",
      "og:url",
      input.ogUrl
    );

    setLinkTag("canonical", input.canonical);
  }, [input]);
}
