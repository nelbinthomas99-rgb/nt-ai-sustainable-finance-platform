"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function FinancialPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  const netProfit = Number(revenue) - Number(expenses);

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "300px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "6px",
    marginBottom: "18px",
  };

  if (loading) {
    return (
      <main style={{ fontFamily: "Arial, sans-serif", padding: "40px" }}>
        Checking secure login...
      </main>
    );
  }

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f4f7f6",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#0b5d4b",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ← Back to Dashboard
      </Link>

      <h1 style={{ color: "#0b5d4b", marginTop: "30px" }}>
        Financial Overview
      </h1>

      <p>
        Enter client financial information to calculate the current financial
        position.
      </p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Financial Data Input</h2>

        <div>
          <label>Revenue (£)</label>
          <br />

          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Expenses (£)</label>
          <br />

          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label>Cash Balance (£)</label>
          <br />

          <input
            type="number"
            value={cashBalance}
            onChange={(e) => setCashBalance(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "25px",
        }}
      >
        <h2>Financial Summary</h2>

        <p>
          Revenue: <strong>£{Number(revenue).toLocaleString()}</strong>
        </p>

        <p>
          Expenses: <strong>£{Number(expenses).toLocaleString()}</strong>
        </p>

        <p>
          Net Profit: <strong>£{netProfit.toLocaleString()}</strong>
        </p>

        <p>
          Cash Balance: <strong>£{Number(cashBalance).toLocaleString()}</strong>
        </p>
      </div>
    </main>
  );
}
