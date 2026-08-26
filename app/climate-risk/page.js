"use client";

import Link from "next/link";
import { useState } from "react";

export default function ClimateRiskPage() {
  const [physicalRisk, setPhysicalRisk] = useState(0);
  const [transitionRisk, setTransitionRisk] = useState(0);
  const [financialExposure, setFinancialExposure] = useState(0);

  const totalRisk =
    Number(physicalRisk) +
    Number(transitionRisk) +
    Number(financialExposure);

  let riskLevel = "Low";

  if (totalRisk >= 150) {
    riskLevel = "High";
  } else if (totalRisk >= 75) {
    riskLevel = "Medium";
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
        Climate Risk Assessment
      </h1>

      <p>
        Assess physical, transition and financial climate risks for your
        organisation.
      </p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Climate Risk Data Input</h2>

        <div style={{ marginBottom: "20px" }}>
          <label>
            Physical Risk Score (0–100)
          </label>
          <br />

          <input
            type="number"
            min="0"
            max="100"
            value={physicalRisk}
            onChange={(e) => setPhysicalRisk(e.target.value)}
            style={{
              padding: "12px",
              width: "300px",
              marginTop: "8px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            Transition Risk Score (0–100)
          </label>
          <br />

          <input
            type="number"
            min="0"
            max="100"
            value={transitionRisk}
            onChange={(e) => setTransitionRisk(e.target.value)}
            style={{
              padding: "12px",
              width: "300px",
              marginTop: "8px",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            Financial Exposure Score (0–100)
          </label>
          <br />

          <input
            type="number"
            min="0"
            max="100"
            value={financialExposure}
            onChange={(e) => setFinancialExposure(e.target.value)}
            style={{
              padding: "12px",
              width: "300px",
              marginTop: "8px",
            }}
          />
        </div>

        <hr style={{ margin: "30px 0" }} />

        <h2>Climate Risk Summary</h2>

        <p>
          Physical Risk: <strong>{physicalRisk}</strong>
        </p>

        <p>
          Transition Risk: <strong>{transitionRisk}</strong>
        </p>

        <p>
          Financial Exposure: <strong>{financialExposure}</strong>
        </p>

        <h3 style={{ color: "#0b5d4b" }}>
          Total Risk Score: {totalRisk}
        </h3>

        <h3>
          Risk Level: {riskLevel}
        </h3>
      </div>
    </main>
  );
}
