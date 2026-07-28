import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "@/Layout";
import { Enter, NotFound, EngineeringWebArchiveProjectRaw } from "@/pages";
import routes from "@/data/routes";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Enter />} />
      <Route path="/engineering/archive/:slug/raw" element={<EngineeringWebArchiveProjectRaw />} />
      <Route element={<Layout />}>
        <Route path="*" element={<NotFound />} />
        {routes.map(({ id, path, component: Page, props = {}, redirects = [] }) => (
          <React.Fragment key={id}>
            <Route path={path} element={<Page {...props} />} />
            {redirects.map((from) => (
              <Route key={from} path={from} element={<Navigate to={path} replace />} />
            ))}
          </React.Fragment>
        ))}
      </Route>
    </Routes>
  );
};

export default App;
