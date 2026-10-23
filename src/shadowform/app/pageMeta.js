import appsConfig from "../../../config/apps.json";
const { metadata } = appsConfig.shadowform;
export const pageMeta = (label) => ({ data, location }) => {
  const name = data?.pageTitle ?? label;
  const title = name ? `${name} — ${metadata.title}` : metadata.title;
  return [{ title }, { name: "description", content: "Jennifer's personal website, engineering projects, web archive and guestbook." },
    { tagName: "link", rel: "canonical", href: new URL(location.pathname, "https://shadowform.net").href },
    { property: "og:title", content: title }, { property: "og:type", content: "website" }];
};
