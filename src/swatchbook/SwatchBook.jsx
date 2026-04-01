// src/swatchbook/SwatchBook.jsx
import { swatches } from "./data";
import { useSwatchTable } from "./useSwatchTable";
import SwatchGrid from "./SwatchGrid";

import HeaderFilter from "@/components/HeaderFilter";
import HrDivider from "@/components/HrDivider";

export default function SwatchBook() {
  const table = useSwatchTable(swatches);

  return (
    <div>
      <HeaderFilter table={table} />
      <HrDivider />
      <SwatchGrid table={table} />
    </div>
  );
}
