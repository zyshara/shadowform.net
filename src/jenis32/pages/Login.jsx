import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, ensureAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not log in");

      login(data.jwt, data.user);
      await ensureAccount(data.jwt);
      navigate(location.state?.from?.pathname || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      topRight={
        <p className="text-sm text-j32-text">
          New here?{" "}
          <Link to="/register" className="text-j32-accent hover:underline">Get started</Link>
        </p>
      }
    >
      <h1 className="font-heading font-bold text-3xl text-j32-heading">Log in</h1>
      <p className="mt-1 text-sm text-j32-text">
        Already have a shadowform account from another project? It works here too.
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

        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? "Logging in…" : "Log in"}
        </Button>

        <Link to="/forgot-password" className="text-center text-xs text-j32-text/70 hover:text-j32-heading">
          Forgot your password?
        </Link>
      </form>
    </AuthLayout>
  );
};

export default Login;
