import React from "react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

const Activities = () => {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-dvh bg-j32-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-script font-bold text-4xl text-j32-heading">You're in! 🎉</h1>
      <p className="text-j32-text">
        Logged in as <span className="text-j32-heading">{user?.email}</span>. The activity
        list is coming soon.
      </p>
      <Button variant="ghost" onClick={logout}>Log out</Button>
    </main>
  );
};

export default Activities;
