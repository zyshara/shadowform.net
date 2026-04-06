import React from "react";
import { Routes, Route } from "react-router-dom";

import { EPK, Linktree, NotFound } from "@/pages";

const App = () => {
  return (
    <Routes>
      <Route path=":slug/epk" element={<EPK />} />
      <Route path=":slug/linktree" element={<Linktree />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
