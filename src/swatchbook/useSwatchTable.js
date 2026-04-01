// src/swatchbook/useSwatchTable.js
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import { swatchColumns } from "@/columns";

export function useSwatchTable(data) {
  return useReactTable({
    data,
    columns: swatchColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
}
