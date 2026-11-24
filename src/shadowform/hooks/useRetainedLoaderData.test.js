import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useRetainedLoaderData from "./useRetainedLoaderData";

describe("useRetainedLoaderData", () => {
  it("keeps the latest route data when an exiting route loses its loader data", () => {
    const first = { initialData: { entries: [] } };
    const updated = { initialData: { entries: [{ id: 1 }] } };
    const { result, rerender } = renderHook(({ data }) => useRetainedLoaderData(data), {
      initialProps: { data: first },
    });

    rerender({ data: updated });
    expect(result.current).toBe(updated);
    rerender({ data: undefined });
    expect(result.current).toBe(updated);
  });
});
