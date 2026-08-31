"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AIInsightsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [esgScore, setEsgScore] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function checkLogin() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setLoading(false);
      }
    }

    checkLogin();

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

  const profit = Number(revenue) - Number(expenses);

  let insight = "Enter your business data to generate an insight.";

  if (Number(revenue) > 0 || Number(expenses) > 0 || Number(esgScore) > 0) {
    if (profit < 0) {
      insight =
        "Your expenses are currently higher than your revenue. Review operating costs and cash flow.";
    } else if (Number(esgScore) < 50) {
      insight =
        "Your financial position is positive, but your ESG score may need improvement. Consider setting measurable sustainability targets.";
    } else if (Number(esgScore) >= 75) {
      insight =
        "Your current figures indicate positive profitability and strong ESG performance. Continue monitoring both financial and sustainability indicators.";
    } else {
      insight =
        "Your business shows positive financial performance with moderate ESG results. Focus on improving sustainability performance while maintaining profitability.";
    }
  }

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
      <main
        style={{
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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

      <h1
        style={{
          color: "#0b5d4b",
          marginTop: "30px",
        }}
      >
        AI Insights
      </h1>

      <p>Generate simple business insights from your financial and ESG data.</p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Business Data</h2>

        <label>Revenue (£)</label>
        <br />
        <input
          type="number"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Expenses (£)</label>
        <br />
        <input
          type="number"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>ESG Score (0-100)</label>
        <br />
        <input
          type="number"
          min="0"
          max="100"
          value={esgScore}
          onChange={(e) => setEsgScore(e.target.value)}
          style={inputStyle}
        />

        <hr style={{ margin: "10px 0 25px" }} />

        <h2>AI-Style Insight</h2>

        <p
          style={{
            background: "#f0f7f5",
            padding: "20px",
            borderRadius: "8px",
            lineHeight: "1.6",
          }}
        >
          {insight}
        </p>

        <p style={{ color: "#666", marginTop: "20px", fontSize: "14px" }}>
          This is currently a rule-based prototype and does not yet use a
          generative AI model.
        </p>
      </div>
    </main>
  );
}
