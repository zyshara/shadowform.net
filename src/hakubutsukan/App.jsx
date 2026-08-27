import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "@/Layout";
import { Home, Museums, Museum, Exhibits, Classification, About, NotFound } from "@/pages";

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/"               element={<Home />} />
      <Route path="/museums"        element={<Museums />} />
      <Route path="/museum/:slug"   element={<Museum />} />
      <Route path="/exhibits"       element={<Exhibits />} />
      <Route path="/classification" element={<Classification />} />
      <Route path="/about"          element={<About />} />
      <Route path="*"               element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
