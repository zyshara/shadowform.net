import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import Layout from "@/Layout";
import { PageTransition } from "@/components";
import { Enter, NotFound, EngineeringArchive, EngineeringProject, EngineeringProjectRaw } from "@/pages";
import navlinks from "@/data/navlinks";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Enter />} />
        <Route path="/engineering/archive/:slug/raw" element={<EngineeringProjectRaw />} />
        <Route element={<Layout />}>
          <Route path="*" element={<NotFound />} />
          <Route
            path="/engineering/archive"
            element={<PageTransition><EngineeringArchive /></PageTransition>}
          />
          <Route
            path="/engineering/archive/:slug"
            element={<PageTransition><EngineeringProject /></PageTransition>}
          />
          {navlinks.map(({ id, url, component: Page, redirects = [] }) => (
            <React.Fragment key={id}>
              <Route
                path={url}
                element={
                  <PageTransition>
                    <Page />
                  </PageTransition>
                }
              />
              {redirects.map((from) => (
                <Route key={from} path={from} element={<Navigate to={url} replace />} />
              ))}
            </React.Fragment>
          ))}
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
