import { useEffect } from "react";

/**
 * Dynamically sets the page favicon.
 * Pass `null` or `undefined` to leave it unchanged.
 *
 * @param {string|null} url - absolute URL or data URI for the icon
 */
export function useFavicon(url) {
  useEffect(() => {
    if (!url) return;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [url]);
}
