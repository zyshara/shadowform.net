import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Button from "@/components/Button";
import Brand from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import heroDesktop from "@/assets/hero-goldshire-desktop.jpg";
import heroMobile from "@/assets/hero-goldshire-mobile.jpg";
import heroInsideDesktop from "@/assets/hero-goldshire-inside-desktop.jpg";
import heroInsideMobile from "@/assets/hero-goldshire-inside-mobile.jpg";
import controllerIcon from "@/assets/controller-icon.png";
import photosIcon from "@/assets/photos-icon.png";
import beerIcon from "@/assets/beer-icon.png";

const NAV_LINKS = [
  { to: "/login", label: "Log in" },
];

// Shared fade/slide-up entrance — direction and distance only; durations
// below come from useStagger so reduced-motion users get near-instant
// transitions instead of this being hardcoded everywhere.
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function useStagger(stagger = 0.1, delayChildren = 0) {
  const reduce = useReducedMotion();
  return {
    container: {
      hidden: {},
      visible: {
        transition: reduce ? {} : { staggerChildren: stagger, delayChildren },
      },
    },
    item: reduce
      ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.15 } } }
      : { ...itemVariants, visible: { ...itemVariants.visible, transition: { duration: 0.5, ease: "easeOut" } } },
  };
}

const FEATURES = [
  {
    icon: controllerIcon,
    title: "Games",
    description: "WoW, Jackbox, Diablo, STS2 + more",
  },
  {
    icon: photosIcon,
    title: "Cams on",
    description: "Party with friends from anywhere, 6pm Pacific",
  },
  {
    icon: beerIcon,
    title: "Birthday shot",
    description: "Around midnight (you know the drill)",
  },
];

const GROUP_LABELS = {
  anytime: { title: "Anytime", help: null },
  party: { title: "During the party", help: "These make the most sense once we're all online" },
};

const ActivityRow = ({ activity, done, variants }) => (
  <motion.div
    variants={variants}
    className="flex items-center justify-between gap-4 rounded-xl border border-j32-border bg-j32-card px-5 py-4"
  >
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
  </motion.div>
);

const MarketingContent = () => {
  const { container, item } = useStagger(0.12);
  const features = useStagger(0.08);

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.p variants={item} className="mt-6 max-w-xl text-base sm:text-lg text-j32-text">
        Greetings, traveler! I'm turning 32, so naturally I made a website about it.
        Participation is technically optional. I also technically have your IP address. :)
      </motion.p>

      <motion.div
        variants={features.container}
        className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl"
      >
        {FEATURES.map(({ icon, title, description }) => (
          <motion.div key={title} variants={features.item} className="flex flex-col gap-2 text-j32-text">
            <img src={icon} alt="" className="w-8 h-8" style={{ imageRendering: "pixelated" }} />
            <span className="text-sm font-semibold text-j32-heading">{title}</span>
            <span className="text-xs text-j32-text/80 leading-relaxed">{description}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-10">
        <Button to="/register" variant="primary" className="text-base px-8 py-4">
          Register to Participate →
        </Button>
      </motion.div>

      <motion.p variants={item} className="font-heading text-xl sm:text-2xl text-j32-text/90 mt-10 leading-snug">
        Answer questions. Draw things. Share photos. Record a message.
        <br />
        Do one. Do all. Leave evidence you were here.
      </motion.p>
    </motion.div>
  );
};

const ActivitiesContent = () => {
  const { user } = useAuth();
  const { account, activities, isActivityDone, isProfileComplete, loading, config } = useAppData();
  const { container, item } = useStagger(0.1);
  const rows = useStagger(0.04);

  if (loading) {
    return <p className="mt-10 text-j32-text">Loading…</p>;
  }

  const displayName = account?.nickname || account?.firstName || user?.email;
  const doneCount = activities.filter(isActivityDone).length;
  const grouped = activities.reduce((acc, a) => {
    (acc[a.group] ??= []).push(a);
    return acc;
  }, {});

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="mt-8 flex flex-col gap-8 max-w-2xl"
    >
      <motion.p variants={item} className="text-sm text-j32-text">
        {isProfileComplete ? `Hey there, ${displayName}! 👋` : "Hey there! 👋"} Complete the
        activities below. You can come back anytime to do or redo the ones that make sense
        during the party.
        {config?.discordInvite && (
          <>
            {" "}
            <a href={config.discordInvite} className="text-j32-accent hover:underline">Join the Discord →</a>
          </>
        )}
      </motion.p>

      <motion.div variants={item}>
        <div className="flex justify-between text-xs text-j32-text/60 mb-1.5">
          <span>Progress</span>
          <span>{doneCount} of {activities.length} completed</span>
        </div>
        <div className="h-1.5 rounded-full bg-j32-border overflow-hidden">
          <motion.div
            className="h-full bg-j32-success"
            initial={{ width: 0 }}
            animate={{ width: `${activities.length ? (doneCount / activities.length) * 100 : 0}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </motion.div>

      {!isProfileComplete && (
        <motion.p variants={item} className="text-xs text-j32-text/70 -mt-4">
          Start with "Introduce yourself" — everything else unlocks once that's done.
        </motion.p>
      )}

      {Object.entries(GROUP_LABELS).map(([group, { title, help }]) => (
        grouped[group]?.length ? (
          <motion.section key={group} variants={item} className="flex flex-col gap-3">
            <div>
              <h2 className="text-xs uppercase tracking-wide text-j32-text/60">{title}</h2>
              {help && <p className="text-xs text-j32-text/40">{help}</p>}
            </div>
            <motion.div variants={rows.container} initial="hidden" animate="visible" className="flex flex-col gap-3">
              {grouped[group].map((activity) => (
                <ActivityRow key={activity.slug} activity={activity} done={isActivityDone(activity)} variants={rows.item} />
              ))}
            </motion.div>
          </motion.section>
        ) : null
      ))}
    </motion.div>
  );
};

const Home = () => {
  const { isAuthenticated, logout } = useAuth();
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <picture>
        <source media="(min-width: 768px)" srcSet={isAuthenticated ? heroInsideDesktop : heroDesktop} />
        <img
          src={isAuthenticated ? heroInsideMobile : heroMobile}
          alt=""
          className="fixed inset-0 h-dvh w-screen object-cover"
          aria-hidden="true"
        />
      </picture>
      <div className="fixed inset-0 bg-gradient-to-b from-j32-bg/25 via-j32-bg/55 to-j32-bg/95" />

      <div className="relative flex flex-col min-h-dvh">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10"
        >
          <Brand />

          {isAuthenticated ? (
            <nav className="flex flex-wrap items-center gap-5" aria-label="Primary">
              <Button variant="ghost" onClick={logout} className="text-xs px-4 py-2">Log out</Button>
            </nav>
          ) : (
            <nav className="flex flex-wrap items-center gap-5" aria-label="Primary">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-j32-text hover:text-j32-heading transition-colors"
                >
                  {label}
                </Link>
              ))}
              <Button to="/register" variant="primary">Register</Button>
            </nav>
          )}
        </motion.header>

        <div className={`flex-1 flex flex-col px-6 py-16 md:px-10 max-w-3xl ${isAuthenticated ? "" : "justify-center"}`}>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-script font-bold leading-[0.95] text-5xl sm:text-6xl md:text-7xl"
          >
            <span className="text-j32-heading">Jennifer's</span>
            <br />
            <span className="text-j32-accent">32nd Birthday</span>
          </motion.h1>

          <AnimatePresence mode="wait">
            {isAuthenticated ? (
              <ActivitiesContent key="activities" />
            ) : (
              <MarketingContent key="marketing" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default Home;
