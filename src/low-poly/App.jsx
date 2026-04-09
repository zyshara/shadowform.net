import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import EPK from "@shared/pages/EPK";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/epk" element={<EPK slug="low-poly" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
