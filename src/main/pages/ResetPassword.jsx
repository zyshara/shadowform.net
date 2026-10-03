import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

// Canonical password-reset landing page for every shadowform.net app that
// uses the shared Strapi user pool — Strapi's own "reset password page"
// setting is a single global URL for the whole instance, so this page has
// to live somewhere host-agnostic rather than under any one app's
// subdomain. See the jenis32 gameplan's auth design notes for why.
//
// Which app a guest came from isn't knowable here (Strapi's reset email
// only carries the code, nothing app-specific), so the post-reset message
// is hardcoded to jenis32 for now — the only consumer today. Trivial to
// parameterize if a second app ever needs this.
const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password, passwordConfirmation: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not reset password");
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!code) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-sf-void px-6 text-center">
        <p className="text-sf-mist">This reset link is missing its code. Please request a new one.</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center gap-3 bg-sf-void px-6 text-center">
        <h1 className="text-2xl font-bold text-sf-bone">Password reset!</h1>
        <p className="text-sf-mist">
          You can now log back in at{" "}
          <a href="https://jenis32.shadowform.net" className="text-sf-pink-text hover:underline">
            jenis32.shadowform.net
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-sf-void px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-sf-bone">Reset your password</h1>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs uppercase tracking-wide text-sf-dim">
            New password
          </label>
          <input
            id="password"
            type="password"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg bg-sf-ink border border-sf-stone px-4 py-3 text-sm text-sf-bone outline-none focus:border-sf-pink-border transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-xs uppercase tracking-wide text-sf-dim">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            minLength={6}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg bg-sf-ink border border-sf-stone px-4 py-3 text-sm text-sf-bone outline-none focus:border-sf-pink-border transition-colors"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-sf-pink-text text-sf-void font-semibold px-6 py-3 text-sm hover:brightness-110 transition-all"
        >
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </main>
  );
};

export default ResetPassword;
