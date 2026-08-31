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
  const [greenInvestment, setGreenInvestment] = useState(0);
  const [sustainableLoans, setSustainableLoans] = useState(0);
  const [esgLinkedFinance, setEsgLinkedFinance] = useState(0);
  const [totalFinance, setTotalFinance] = useState(0);

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

  const sustainableTotal =
    Number(greenInvestment) +
    Number(sustainableLoans) +
    Number(esgLinkedFinance);

  const sustainableShare =
    Number(totalFinance) > 0
      ? (sustainableTotal / Number(totalFinance)) * 100
      : 0;

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
        Sustainable Finance
      </h1>

      <p>Track sustainable and ESG-linked finance activity.</p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Finance Data Input</h2>

        <label>Green Investment (£)</label>
        <br />
        <input
          type="number"
          value={greenInvestment}
          onChange={(e) => setGreenInvestment(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Sustainable Loans (£)</label>
        <br />
        <input
          type="number"
          value={sustainableLoans}
          onChange={(e) => setSustainableLoans(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>ESG-Linked Finance (£)</label>
        <br />
        <input
          type="number"
          value={esgLinkedFinance}
          onChange={(e) => setEsgLinkedFinance(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Total Finance (£)</label>
        <br />
        <input
          type="number"
          value={totalFinance}
          onChange={(e) => setTotalFinance(e.target.value)}
          style={inputStyle}
        />

        <hr style={{ margin: "10px 0 25px" }} />

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
          ESG-Linked Finance:{" "}
          <strong>£{Number(esgLinkedFinance).toFixed(2)}</strong>
        </p>

        <p>
          Total Sustainable Finance:{" "}
          <strong>£{sustainableTotal.toFixed(2)}</strong>
        </p>

        <p>
          Sustainable Finance Share:{" "}
          <strong>{sustainableShare.toFixed(1)}%</strong>
        </p>
      </div>
    </main>
  );
}
