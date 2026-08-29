
"use client";

import Link from "next/link";
import { useState } from "react";

export default function SustainableFinancePage() {
  const [greenInvestment, setGreenInvestment] = useState("");
  const [sustainableLoans, setSustainableLoans] = useState("");
  const [esgLinkedFinance, setEsgLinkedFinance] = useState("");
  const [totalFinance, setTotalFinance] = useState("");

  const green = Number(greenInvestment) || 0;
  const loans = Number(sustainableLoans) || 0;
  const esg = Number(esgLinkedFinance) || 0;
  const total = Number(totalFinance) || 0;

  const sustainableFinanceTotal = green + loans + esg;

  const sustainableShare =
    total > 0 ? (sustainableFinanceTotal / total) * 100 : 0;

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
          marginBottom: "10px",
        }}
      >
        Sustainable Finance
      </h1>

      <p
        style={{
          color: "#555",
          marginBottom: "30px",
        }}
      >
        Track green investment, sustainable lending and ESG-linked finance.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "22px",
            borderRadius: "12px",
          }}
        >
          <h2>Green Investment</h2>

          <input
            type="number"
            value={greenInvestment}
            onChange={(e) => setGreenInvestment(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            background: "white",
            padding: "22px",
            borderRadius: "12px",
          }}
        >
          <h2>Sustainable Loans</h2>

          <input
            type="number"
            value={sustainableLoans}
            onChange={(e) => setSustainableLoans(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            background: "white",
            padding: "22px",
            borderRadius: "12px",
          }}
        >
          <h2>ESG-Linked Finance</h2>

          <input
            type="number"
            value={esgLinkedFinance}
            onChange={(e) => setEsgLinkedFinance(e.target.value)}
            placeholder="Enter amount"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            background: "white",
            padding: "22px",
            borderRadius: "12px",
          }}
        >
          <h2>Total Finance</h2>

          <input
            type="number"
            value={totalFinance}
            onChange={(e) => setTotalFinance(e.target.value)}
            placeholder="Enter total finance"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "10px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Sustainable Finance Summary</h2>

        <p>
          Green Investment: <strong>£{green.toLocaleString()}</strong>
        </p>

        <p>
          Sustainable Loans: <strong>£{loans.toLocaleString()}</strong>
        </p>

        <p>
          ESG-Linked Finance: <strong>£{esg.toLocaleString()}</strong>
        </p>

        <hr
          style={{
            margin: "20px 0",
          }}
        />

        <p>
          Total Sustainable Finance:{" "}
          <strong>£{sustainableFinanceTotal.toLocaleString()}</strong>
        </p>

        <p>
          Sustainable Share:{" "}
          <strong>{sustainableShare.toFixed(1)}%</strong>
        </p>
      </div>
    </main>
  );
}
