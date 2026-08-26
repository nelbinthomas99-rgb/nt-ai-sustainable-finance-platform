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

  const cardStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "320px",
    padding: "12px",
    marginTop: "8px",
    border: "1px solid #cccccc",
    borderRadius: "8px",
    fontSize: "16px",
  };

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
        Track green investment, sustainable lending and ESG-linked finance.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h2>Green Investment</h2>
          <p>Value of green or environmentally aligned investment (£)</p>

          <input
            type="number"
            min="0"
            value={greenInvestment}
            onChange={(e) => setGreenInvestment(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Sustainable Loans</h2>
          <p>Value of sustainable or green lending (£)</p>

          <input
            type="number"
            min="0"
            value={sustainableLoans}
            onChange={(e) => setSustainableLoans(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>ESG-Linked Finance</h2>
          <p>Finance linked to sustainability or ESG targets (£)</p>

          <input
            type="number"
            min="0"
            value={esgLinkedFinance}
            onChange={(e) => setEsgLinkedFinance(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Total Finance</h2>
          <p>Total finance or investment portfolio (£)</p>

          <input
            type="number"
            min="0"
            value={totalFinance}
            onChange={(e) => setTotalFinance(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: "25px",
        }}
      >
        <h2>Sustainable Finance Summary</h2>

        <p>
          Green Investment:{" "}
          <strong>£{green.toLocaleString("en-GB")}</strong>
        </p>

        <p>
          Sustainable Loans:{" "}
          <strong>£{loans.toLocaleString("en-GB")}</strong>
        </p>

        <p>
          ESG-Linked Finance:{" "}
          <strong>£{esg.toLocaleString("en-GB")}</strong>
        </p>

        <hr />

        <p>
          Total Sustainable Finance:{" "}
          <strong>
            £{sustainableFinanceTotal.toLocaleString("en-GB")}
          </strong>
        </p>

        <p
          style={{
            fontSize: "22px",
            color: "#0b5d4b",
          }}
        >
          Sustainable Finance Share:{" "}
          <strong>{sustainableShare.toFixed(1)}%</strong>
        </p>
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: "25px",
        }}
      >
        <h2>Prototype Notice</h2>

        <p>
          This module is currently a decision-support prototype.
          Sustainable or green classifications should be validated
          against the relevant framework before professional or
          regulatory reporting.
        </p>
      </div>
    </main>
  );
}}
