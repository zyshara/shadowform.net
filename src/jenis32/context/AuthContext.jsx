import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "jenis32_auth";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { jwt: null, user: null, account: null };
  } catch {
    return { jwt: null, user: null, account: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored);

  function login(jwt, user) {
    const next = { jwt, user, account: null };
    setAuth(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function logout() {
    const next = { jwt: null, user: null, account: null };
    setAuth(next);
    localStorage.removeItem(STORAGE_KEY);
  }

  function setAccount(account) {
    setAuth((prev) => {
      const next = { ...prev, account };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function authFetch(url, opts = {}) {
    return fetch(url, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(auth.jwt && { Authorization: `Bearer ${auth.jwt}` }),
        ...opts.headers,
      },
    });
  }

  // Idempotent — safe to call after every login/register. Having a
  // jenis32-account row is itself the "this user is part of the party"
  // flag (gameplan 3.2), so this is how that row gets created on first
  // visit for both brand-new and already-has-a-shadowform-account guests.
  async function ensureAccount(jwt) {
    const res = await fetch("/api/jenis32/account", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) throw new Error("could not set up your jenis32 account");
    const { account } = await res.json();
    setAccount(account);
    return account;
  }

  return (
    <AuthContext.Provider
      value={{
        jwt: auth.jwt,
        user: auth.user,
        account: auth.account,
        isAuthenticated: Boolean(auth.jwt),
        login,
        logout,
        ensureAccount,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
