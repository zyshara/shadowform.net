import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "@/components/RequireAuth";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import { ActivityScreen, CharacterCreatorCheck, CharacterCreatorDev, ForgotPassword, Home, Login, NotFound, Register } from "@/pages";
import PoweredByLogo from "@shared/components/PoweredByLogo.jsx";

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
            path="/activities/:slug"
            element={
              <RequireAuth>
                <ActivityScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/character"
            element={
              <RequireAuth>
                <CharacterCreatorDev />
              </RequireAuth>
            }
          />
          <Route
            path="/character/check"
            element={
              <RequireAuth>
                <CharacterCreatorCheck />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <div className="fixed bottom-6 right-6 z-50">
          <PoweredByLogo />
        </div>
      </AppDataProvider>
    </AuthProvider>
  );
};

export default App;
