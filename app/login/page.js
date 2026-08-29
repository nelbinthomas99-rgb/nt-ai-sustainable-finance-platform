"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Login successful.");
    window.location.href = "/";
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          width: "420px",
          maxWidth: "90%",
          padding: "40px",
          borderRadius: "14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#0b5d4b", marginBottom: "10px" }}>
          N&T Client Portal
        </h1>

        <p style={{ marginBottom: "30px", color: "#555" }}>
          Secure Client Login
        </p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              border: "1px solid #ccc",
              borderRadius: "7px",
              boxSizing: "border-box",
            }}
          />

          <label>Password</label>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "25px",
              border: "1px solid #ccc",
              borderRadius: "7px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "#0b5d4b",
              color: "white",
              border: "none",
              borderRadius: "7px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
