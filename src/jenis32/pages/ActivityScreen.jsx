import React, { useState } from "react";
import { useParams, useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import ProfileActivity from "@/components/activities/ProfileActivity";
import TextActivity from "@/components/activities/TextActivity";
import LongtextActivity from "@/components/activities/LongtextActivity";
import MediaActivity from "@/components/activities/MediaActivity";
import Button from "@/components/Button";

const RENDERERS = {
  text: TextActivity,
  longtext: LongtextActivity,
  media: MediaActivity,
};

function findNextIncomplete(activities, isActivityDone, fromSlug) {
  const index = activities.findIndex((a) => a.slug === fromSlug);
  const ordered = [...activities.slice(index + 1), ...activities.slice(0, index + 1)];
  return ordered.find((a) => !isActivityDone(a)) ?? null;
}

// Thin wrapper that forces a full remount on slug change — otherwise React
// Router reuses the same instance across /activities/:slug navigations and
// local state (the success screen, in-progress form fields) leaks from one
// activity into the next.
const ActivityScreen = () => {
  const { slug } = useParams();
  return <ActivityScreenInner key={slug} slug={slug} />;
};

const ActivityScreenInner = ({ slug }) => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { activities, account, submissionBySlug, isActivityDone, isProfileComplete, loading, refresh } = useAppData();
  const [success, setSuccess] = useState(false);

  if (loading) return null;

  const activity = activities.find((a) => a.slug === slug);
  if (!activity) return <Navigate to="/activities" replace />;

  // Everything but "introduce yourself" is gated behind a complete profile.
  if (activity.type !== "profile" && !isProfileComplete) {
    return <Navigate to="/activities/introduce-yourself" replace />;
  }

  const stepIndex = activities.findIndex((a) => a.slug === slug) + 1;

  const handleSave = async (payload) => {
    const url = activity.type === "profile"
      ? "/api/jenis32/account"
      : `/api/jenis32/submissions/${activity.slug}`;
    const res = await authFetch(url, { method: "PUT", body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "could not save");
    await refresh();
    setSuccess(true);
  };

  // MediaActivity does its own upload (raw XHR, for progress reporting) —
  // by the time this fires the request has already succeeded, so this
  // just needs to refresh app data and show the success screen.
  const handleMediaSaved = async () => {
    await refresh();
    setSuccess(true);
  };

  const handleContinue = () => {
    const next = findNextIncomplete(activities, isActivityDone, slug);
    navigate(next ? `/activities/${next.slug}` : "/activities");
  };

  if (success) {
    return (
      <main className="min-h-dvh bg-j32-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="w-14 h-14 rounded-full bg-j32-success/20 text-j32-success flex items-center justify-center text-2xl">✓</span>
        <h1 className="font-heading font-bold text-4xl text-j32-heading">Nice!</h1>
        <p className="text-sm text-j32-text">Your submission has been saved.</p>
        <Button variant="primary" onClick={handleContinue}>Continue to next activity →</Button>
        <Link to="/activities" className="text-xs text-j32-text/70 hover:text-j32-heading">Back to list</Link>
      </main>
    );
  }

  const Renderer = activity.type === "profile" ? ProfileActivity : RENDERERS[activity.type];

  return (
    <main className="min-h-dvh bg-j32-bg flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link to="/activities" className="text-sm text-j32-text/70 hover:text-j32-heading">← Back</Link>
          <span className="text-xs text-j32-text/50">{stepIndex} of {activities.length}</span>
        </div>

        <h1 className="font-heading font-bold text-3xl text-j32-heading">{activity.title}</h1>
        {activity.prompt && <p className="mt-1 text-sm text-j32-text">{activity.prompt}</p>}
        {activity.helpText && <p className="mt-1 text-xs text-j32-text/60">{activity.helpText}</p>}

        <div className="mt-6">
          {Renderer ? (
            activity.type === "profile" ? (
              <Renderer account={account} onSave={handleSave} />
            ) : activity.type === "media" ? (
              <Renderer
                activity={activity}
                initialMedia={submissionBySlug[activity.slug]?.media ?? []}
                initialCaption={submissionBySlug[activity.slug]?.caption}
                onSave={handleMediaSaved}
              />
            ) : (
              <Renderer activity={activity} initialValue={submissionBySlug[activity.slug]?.textValue} onSave={handleSave} />
            )
          ) : (
            <p className="text-sm text-j32-text/60">This activity type isn't ready yet — check back soon!</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default ActivityScreen;
