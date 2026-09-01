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
  const [userId, setUserId] = useState("");
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadFinancialData() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("financial_data")
        .select("revenue, expenses, cash_balance, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!mounted) return;

      if (!error && data && data.length > 0) {
        setRevenue(Number(data[0].revenue) || 0);
        setExpenses(Number(data[0].expenses) || 0);
        setCashBalance(Number(data[0].cash_balance) || 0);
      }

      setLoading(false);
    }

    loadFinancialData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function saveFinancialData() {
    if (!userId) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("financial_data").insert([
      {
        id: Date.now(),
        user_id: userId,
        revenue: Number(revenue) || 0,
        expenses: Number(expenses) || 0,
        cash_balance: Number(cashBalance) || 0,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("Unable to save financial data.");
    } else {
      setMessage("Financial data saved successfully.");
    }

    setSaving(false);
  }

  const netProfit = Number(revenue) - Number(expenses);

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "320px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "6px",
    marginBottom: "18px",
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading secure financial data...
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

      <h1
        style={{
          color: "#0b5d4b",
          marginTop: "30px",
        }}
      >
        Financial Overview
      </h1>

      <p>
        Enter and securely save your financial information.
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

        <label>Revenue (£)</label>
        <br />

        <input
          type="number"
          min="0"
          step="0.01"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Expenses (£)</label>
        <br />

        <input
          type="number"
          min="0"
          step="0.01"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Cash Balance (£)</label>
        <br />

        <input
          type="number"
          step="0.01"
          value={cashBalance}
          onChange={(e) => setCashBalance(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={saveFinancialData}
          disabled={saving}
          style={{
            background: "#0b5d4b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: saving ? "not-allowed" : "pointer",
            marginBottom: "20px",
          }}
        >
          {saving ? "Saving..." : "Save Financial Data"}
        </button>

        {message && (
          <p
            style={{
              fontWeight: "bold",
              color:
                message === "Financial data saved successfully."
                  ? "#0b5d4b"
                  : "#b42318",
            }}
          >
            {message}
          </p>
        )}

        <hr style={{ margin: "20px 0 25px" }} />

        <h2>Financial Summary</h2>

        <p>
          Revenue: <strong>£{Number(revenue).toFixed(2)}</strong>
        </p>

        <p>
          Expenses: <strong>£{Number(expenses).toFixed(2)}</strong>
        </p>

        <p>
          Net Profit: <strong>£{netProfit.toFixed(2)}</strong>
        </p>

        <p>
          Cash Balance:{" "}
          <strong>£{Number(cashBalance).toFixed(2)}</strong>
        </p>
      </div>
    </main>
  );
}
