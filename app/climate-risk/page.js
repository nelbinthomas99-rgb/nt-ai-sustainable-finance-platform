```jsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function ClimateRiskPage() {
  const [physicalRisk, setPhysicalRisk] = useState(0);
  const [transitionRisk, setTransitionRisk] = useState(0);
  const [financialExposure, setFinancialExposure] = useState(0);

  const physical = Number(physicalRisk) || 0;
  const transition = Number(transitionRisk) || 0;
  const exposure = Number(financialExposure) || 0;

  const overallRisk = useMemo(() => {
    return (physical + transition) / 2;
  }, [physical, transition]);

  const riskLevel = useMemo(() => {
    if (overallRisk >= 70) return "High";
    if (overallRisk >= 40) return "Medium";
    return "Low";
  }, [overallRisk]);

  const cardStyle = {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "320px",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "8px",
  };

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f4f7f6",
        minHeight: "100vh",
        padding: "40px",
        color: "#1f2937",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#0b5d4b",
          textDecoration: "none",
          fontWeight: "700",
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
        Climate Risk Assessment
      </h1>

      <p>
        Assess physical and transition climate risks and review potential
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
          <p>
            Score exposure to flooding, heat, storms and other physical climate
            events.
          </p>

          <input
            type="number"
            min="0"
            max="100"
            value={physicalRisk}
            onChange={(e) => setPhysicalRisk(e.target.value)}
            style={inputStyle}
          />

          <p>
            Current score: <strong>{physical}</strong> / 100
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Transition Risk</h2>
          <p>
            Score exposure to regulation, technology, carbon pricing and market
            transition.
          </p>

          <input
            type="number"
            min="0"
            max="100"
            value={transitionRisk}
            onChange={(e) => setTransitionRisk(e.target.value)}
            style={inputStyle}
          />

          <p>
            Current score: <strong>{transition}</strong> / 100
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Financial Exposure</h2>
          <p>
            Enter the estimated financial value exposed to identified climate
            risks.
          </p>

          <input
            type="number"
            min="0"
            value={financialExposure}
            onChange={(e) => setFinancialExposure(e.target.value)}
            style={inputStyle}
          />

          <p>
            Exposure:{" "}
            <strong>
              £
              {exposure.toLocaleString("en-GB", {
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: "24px",
          borderLeft: "5px solid #0b5d4b",
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
          Estimated Financial Exposure:{" "}
          <strong>
            £
            {exposure.toLocaleString("en-GB", {
              maximumFractionDigits: 2,
            })}
          </strong>
        </p>

        <p>
          This is a prototype decision-support assessment and should not be
          treated as a regulatory climate-risk opinion or assurance conclusion.
        </p>
      </div>
    </main>
  );
}
```

