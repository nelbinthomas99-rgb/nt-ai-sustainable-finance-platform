"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function SustainableFinancePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const [greenInvestment, setGreenInvestment] = useState(0);
  const [sustainableLoans, setSustainableLoans] = useState(0);
  const [esgFunds, setEsgFunds] = useState(0);
  const [totalFinance, setTotalFinance] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
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
        .from("sustainable_finance_data")
        .select(
          "green_investment, sustainable_loans, esg_funds, total_finance, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!mounted) return;

      if (!error && data && data.length > 0) {
        setGreenInvestment(Number(data[0].green_investment) || 0);
        setSustainableLoans(Number(data[0].sustainable_loans) || 0);
        setEsgFunds(Number(data[0].esg_funds) || 0);
        setTotalFinance(Number(data[0].total_finance) || 0);
      }

      setLoading(false);
    }

    loadData();

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

  const sustainableAmount =
    Number(greenInvestment) +
    Number(sustainableLoans) +
    Number(esgFunds);

  const sustainablePercentage =
    Number(totalFinance) > 0
      ? (sustainableAmount / Number(totalFinance)) * 100
      : 0;

  async function saveData() {
    if (!userId) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("sustainable_finance_data")
      .insert([
        {
          id: Date.now(),
          user_id: userId,
          green_investment: Number(greenInvestment) || 0,
          sustainable_loans: Number(sustainableLoans) || 0,
          esg_funds: Number(esgFunds) || 0,
          total_finance: Number(totalFinance) || 0,
        },
      ]);

    if (error) {
      console.error(error);
      setMessage("Unable to save Sustainable Finance data.");
    } else {
      setMessage("Sustainable Finance data saved successfully.");
    }

    setSaving(false);
  }

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
        Loading secure Sustainable Finance data...
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
        Sustainable Finance
      </h1>

      <p>
        Track sustainable investments, loans and ESG-focused finance.
      </p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Sustainable Finance Input</h2>

        <label>Green Investment (£)</label>
        <br />
        <input
          type="number"
          min="0"
          value={greenInvestment}
          onChange={(e) => setGreenInvestment(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Sustainable Loans (£)</label>
        <br />
        <input
          type="number"
          min="0"
          value={sustainableLoans}
          onChange={(e) => setSustainableLoans(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>ESG Funds (£)</label>
        <br />
        <input
          type="number"
          min="0"
          value={esgFunds}
          onChange={(e) => setEsgFunds(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Total Finance (£)</label>
        <br />
        <input
          type="number"
          min="0"
          value={totalFinance}
          onChange={(e) => setTotalFinance(e.target.value)}
          style={inputStyle}
        />

        <br />

        <button
          onClick={saveData}
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
          }}
        >
          {saving ? "Saving..." : "Save Sustainable Finance Data"}
        </button>

        {message && (
          <p
            style={{
              fontWeight: "bold",
              marginTop: "20px",
              color: message.includes("successfully")
                ? "#0b5d4b"
                : "#b42318",
            }}
          >
            {message}
          </p>
        )}

        <hr style={{ margin: "25px 0" }} />

        <h2>Sustainable Finance Summary</h2>

        <p>
          Green Investment:{" "}
          <strong>£{Number(greenInvestment).toFixed(2)}</strong>
        </p>

        <p>
          Sustainable Loans:{" "}
          <strong>£{Number(sustainableLoans).toFixed(2)}</strong>
        </p>

        <p>
          ESG Funds: <strong>£{Number(esgFunds).toFixed(2)}</strong>
        </p>

        <p>
          Sustainable Finance Total:{" "}
          <strong>£{sustainableAmount.toFixed(2)}</strong>
        </p>

        <p>
          Sustainable Finance Percentage:{" "}
          <strong>{sustainablePercentage.toFixed(1)}%</strong>
        </p>
      </div>
    </main>
  );
}
