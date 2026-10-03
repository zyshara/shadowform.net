import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "@/Layout";
import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import { About, Activities, ForgotPassword, Home, Login, NotFound, Register } from "@/pages";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/activities"
          element={
            <RequireAuth>
              <Activities />
            </RequireAuth>
          }
        />
        <Route element={<Layout />}>
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
