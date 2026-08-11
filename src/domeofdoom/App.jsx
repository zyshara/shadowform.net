import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "@/Layout";
import {
  About,
  Artist,
  Catalog,
  CatalogItem,
  Contact,
  Discography,
  Home,
  Merch,
  NotFound,
  Press,
  Roster,
  Shows,
} from "@/pages";

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/catalog" element={<Catalog/>} />
        <Route path="/catalog/:catalogParam" element={<CatalogItem />} />
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
