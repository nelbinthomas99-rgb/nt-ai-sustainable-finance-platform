"use client";

import Link from "next/link";
import { useState } from "react";

export default function ClimateRiskPage() {
  const [physicalRisk, setPhysicalRisk] = useState(0);
  const [transitionRisk, setTransitionRisk] = useState(0);
  const [financialExposure, setFinancialExposure] = useState(0);

  const overallRisk =
    (Number(physicalRisk) + Number(transitionRisk)) / 2;

  let riskLevel = "Low";

  if (overallRisk >= 70) {
    riskLevel = "High";
  } else if (overallRisk >= 40) {
    riskLevel = "Medium";
  }

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "300px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
  };

  const cardStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
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

      <h1 style={{ color: "#0b5d4b", marginTop: "30px" }}>
        Climate Risk Assessment
      </h1>

      <p>
        Assess physical and transition climate risks and their potential
        financial exposure.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h2>Physical Risk</h2>
          <p>Enter a score between 0 and 100.</p>

          <input
            type="number"
            min="0"
            max="100"
            value={physicalRisk}
            onChange={(e) => setPhysicalRisk(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Transition Risk</h2>
          <p>Enter a score between 0 and 100.</p>

          <input
            type="number"
            min="0"
            max="100"
            value={transitionRisk}
            onChange={(e) => setTransitionRisk(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Financial Exposure</h2>
          <p>Estimated amount exposed to climate-related risks.</p>

          <input
            type="number"
            min="0"
            value={financialExposure}
            onChange={(e) => setFinancialExposure(e.target.value)}
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
        <h2>Climate Risk Summary</h2>

        <p>
          Overall Climate Risk Score:{" "}
          <strong>{overallRisk.toFixed(1)} / 100</strong>
        </p>

        <p>
          Risk Level: <strong>{riskLevel}</strong>
        </p>

        <p>
          Financial Exposure:{" "}
          <strong>
            £{Number(financialExposure).toLocaleString()}
          </strong>
        </p>
      </div>
    </main>
  );
}}
