import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import Layout from "@/Layout";
import { PageTransition } from "@/components";
import { Enter } from "@/pages";
import navlinks from "@/data/navlinks";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Enter />} />
        <Route element={<Layout />}>
          {navlinks.map(({ id, url, component: Page }) => (
            <Route
              key={id}
              path={url}
              element={
                <PageTransition>
                  <Page />
                </PageTransition>
              }
            />
          ))}
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
