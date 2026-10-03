import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import Button from "@/components/Button";

const GROUP_LABELS = {
  anytime: { title: "Anytime", help: null },
  party: { title: "During the party", help: "These make the most sense once we're all online" },
};

const ActivityRow = ({ activity, done }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-j32-border bg-j32-card px-5 py-4">
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs ${
        done ? "bg-j32-success/20 border-j32-success text-j32-success" : "border-j32-border"
      }`}>
        {done ? "✓" : ""}
      </span>
      <div>
        <p className="text-sm font-semibold text-j32-heading">{activity.title}</p>
        {activity.prompt && <p className="text-xs text-j32-text/70 mt-0.5">{activity.prompt}</p>}
      </div>
    </div>
    <Button to={`/activities/${activity.slug}`} variant={done ? "ghost" : "primary"} className="shrink-0 text-xs px-4 py-2">
      {done ? "View / Edit" : "Start"}
    </Button>
  </div>
);

const Activities = () => {
  const { user, logout } = useAuth();
  const { account, activities, isActivityDone, isProfileComplete, loading, config } = useAppData();

  if (loading) {
    return <main className="min-h-dvh bg-j32-bg flex items-center justify-center text-j32-text">Loading…</main>;
  }

  const displayName = account?.nickname || account?.firstName || user?.email;
  const doneCount = activities.filter(isActivityDone).length;
  const grouped = activities.reduce((acc, a) => {
    (acc[a.group] ??= []).push(a);
    return acc;
  }, {});

  return (
    <main className="min-h-dvh bg-j32-bg px-6 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-script font-bold text-4xl text-j32-heading">
              {isProfileComplete ? `Hey there, ${displayName}! 👋` : "Hey there! 👋"}
            </h1>
            <p className="mt-1 text-sm text-j32-text">
              Thanks for being part of Jennifer's 32nd. Complete the activities below. You can
              come back anytime to do or redo the ones that make sense during the party.
            </p>
            {config?.discordInvite && (
              <a href={config.discordInvite} className="mt-2 inline-block text-sm text-j32-accent hover:underline">
                Join the Discord →
              </a>
            )}
          </div>
          <Button variant="ghost" onClick={logout} className="shrink-0 text-xs px-4 py-2">Log out</Button>
        </header>

        <div>
          <div className="flex justify-between text-xs text-j32-text/60 mb-1.5">
            <span>Progress</span>
            <span>{doneCount} of {activities.length} completed</span>
          </div>
          <div className="h-1.5 rounded-full bg-j32-border overflow-hidden">
            <div
              className="h-full bg-j32-success transition-all"
              style={{ width: `${activities.length ? (doneCount / activities.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {!isProfileComplete && (
          <p className="text-xs text-j32-text/70">
            Start with "Introduce yourself" — everything else unlocks once that's done.
          </p>
        )}

        {Object.entries(GROUP_LABELS).map(([group, { title, help }]) => (
          grouped[group]?.length ? (
            <section key={group} className="flex flex-col gap-3">
              <div>
                <h2 className="text-xs uppercase tracking-wide text-j32-text/60">{title}</h2>
                {help && <p className="text-xs text-j32-text/40">{help}</p>}
              </div>
              {grouped[group].map((activity) => (
                <ActivityRow key={activity.slug} activity={activity} done={isActivityDone(activity)} />
              ))}
            </section>
          ) : null
        ))}
      </div>
    </main>
  );
};

export default Activities;
