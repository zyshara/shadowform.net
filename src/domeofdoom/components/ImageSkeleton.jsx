import React from "react";

// Full press-card skeleton shown while the card's image is loading.
// Two columns: thumbnail block left, content lines right — mirrors the real card layout.
const PressCardSkeleton = () => (
  <div className="flex flex-row h-[220px] overflow-hidden" aria-hidden="true">
    {/* Thumbnail */}
    <div className="w-2/5 flex-shrink-0 p-3">
      <div className="h-full rounded-sm bg-dod-lilac/10 animate-pulse" />
    </div>
    {/* Content */}
    <div className="flex flex-col gap-3 p-4 flex-1 justify-center">
      <div className="h-3 w-16 rounded-sm bg-dod-lilac/10 animate-pulse" />
      <div className="h-3 w-full rounded-sm bg-dod-lilac/10 animate-pulse" />
      <div className="h-3 w-4/5 rounded-sm bg-dod-lilac/10 animate-pulse" />
      <div className="h-2 w-2/3 rounded-sm bg-dod-lilac/[0.07] animate-pulse mt-1" />
      <div className="h-2 w-1/2 rounded-sm bg-dod-lilac/[0.07] animate-pulse" />
    </div>
  </div>
);

export { PressCardSkeleton };
export default PressCardSkeleton;
