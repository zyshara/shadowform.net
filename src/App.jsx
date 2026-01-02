import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { AnimatePresence } from "framer-motion";

import Layout from "@/Layout";
import {
  Enter,
  About,
  Resume,
  Development,
  Creative,
  Shop,
  Contact,
  NotFound,
  UnderConstruction,
} from "@/pages";

const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Enter />} />

        <Route element={<Layout />}>
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<UnderConstruction />} />
          <Route path="/development" element={<UnderConstruction />} />
          <Route path="/creative" element={<UnderConstruction />} />
          <Route path="/shop" element={<UnderConstruction />} />
          <Route path="/contact" element={<UnderConstruction />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default App;
