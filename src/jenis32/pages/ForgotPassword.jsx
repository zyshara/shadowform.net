import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      // Always show the same message, regardless of whether the email
      // exists — don't give away which emails are registered.
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <h1 className="font-heading font-bold text-3xl text-j32-heading">Check your email</h1>
        <p className="mt-3 text-sm text-j32-text">
          If an account exists for <span className="text-j32-heading">{email}</span>, we've sent
          a link to reset your password.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm text-j32-accent hover:underline">
          Back to log in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      topRight={
        <p className="text-sm text-j32-text">
          <Link to="/login" className="text-j32-accent hover:underline">Back to log in</Link>
        </p>
      }
    >
      <h1 className="font-heading font-bold text-3xl text-j32-heading">Forgot your password?</h1>
      <p className="mt-1 text-sm text-j32-text">
        We'll email you a link to reset it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
