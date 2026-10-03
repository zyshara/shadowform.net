import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import { Activities, ActivityScreen, ForgotPassword, Home, Login, NotFound, Register } from "@/pages";

const App = () => {
  return (
    <AuthProvider>
      <AppDataProvider>
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
          <Route
            path="/activities/:slug"
            element={
              <RequireAuth>
                <ActivityScreen />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppDataProvider>
    </AuthProvider>
  );
};

export default App;
