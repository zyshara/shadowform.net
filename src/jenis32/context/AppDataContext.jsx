import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { jwt, isAuthenticated, authFetch } = useAuth();
  const [data, setData] = useState({ config: null, activities: [], account: null, submissions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!jwt) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/jenis32/bootstrap");
      if (!res.ok) throw new Error("could not load your data");
      const bootstrap = await res.json();
      setData(bootstrap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jwt, authFetch]);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [isAuthenticated, refresh]);

  // One submission per activity slug, for quick "is this done" lookups.
  const submissionBySlug = Object.fromEntries(
    data.submissions.map((s) => [s.activitySlug, s])
  );

  const isProfileComplete = Boolean(
    data.account?.firstName && data.account?.lastName && data.account?.avatar
  );

  function isActivityDone(activity) {
    if (activity.type === "profile") return isProfileComplete;
    return Boolean(submissionBySlug[activity.slug]);
  }

  return (
    <AppDataContext.Provider
      value={{
        ...data,
        submissionBySlug,
        isProfileComplete,
        isActivityDone,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => useContext(AppDataContext);
