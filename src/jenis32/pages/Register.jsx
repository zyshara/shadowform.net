import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, ensureAccount } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not create account");

      login(data.jwt, data.user);
      await ensureAccount(data.jwt);
      navigate("/activities");
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
          Already have an account?{" "}
          <Link to="/login" className="text-j32-accent hover:underline">Log in</Link>
        </p>
      }
    >
      <h1 className="font-script font-bold text-3xl text-j32-heading">Create your account</h1>
      <p className="mt-1 text-sm text-j32-text">
        Join the party and start your activities. It only takes a minute.
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

        <div className="relative">
          <TextField
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[34px] text-xs text-j32-text/70 hover:text-j32-heading"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="primary" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-xs text-j32-text/60">
          By creating an account, you agree to be part of this ridiculous birthday adventure.
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
