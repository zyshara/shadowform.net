import { redirectDocument } from "react-router";

// Preserve existing /licensing URLs while opening the PDF as a document.
export function loader() {
  return redirectDocument("/DOMEOFDOOM_LICENSING.pdf");
}
