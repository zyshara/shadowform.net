import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "@/Layout";
import {
  Home,
  About,
  Discography,
  Roster,
  Artist,
  Shows,
  Merch,
  Contact,
  NotFound,
  Press,
} from "@/pages";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/discography" element={<Discography />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/roster/:artistSlug" element={<Artist />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/merch" element={<Merch />} />
        <Route path="/press" element={<Press />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
