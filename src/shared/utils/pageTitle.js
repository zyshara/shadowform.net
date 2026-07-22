// src/shared/utils/pageTitle.js
//
// Generic "Subpage — Basepage" document.title formatter. Reusable for any
// page in this project that needs a consistent title format.

export function formatPageTitle(subpage, basepage) {
  return subpage ? `${subpage} — ${basepage}` : basepage;
}
