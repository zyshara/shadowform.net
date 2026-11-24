import { useRef } from "react";

// An exiting route can render once after React Router removes its loader data.
// Keep its last data until AnimatePresence finishes unmounting the route.
export default function useRetainedLoaderData(loaderData) {
  const lastData = useRef(loaderData);
  if (loaderData !== undefined) lastData.current = loaderData;
  return lastData.current;
}
