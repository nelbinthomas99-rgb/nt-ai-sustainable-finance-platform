"use client";
import Link from "next/link";
import { useState } from "react";

export default function AIInsightsPage() {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [esgScore, setEsgScore] = useState(0);
  const [carbonEmissions, setCarbonEmissions] = useState(0);
  const [climateRisk, setClimateRisk] = useState(0);

  const netProfit = Number(revenue) - Number(expenses);

  let financialInsight = "Enter financial data to generate an insight.";
  if (Number(revenue) > 0) {
    if (netProfit > 0) {
      financialInsight =
        "The business is currently profitable. Review margins and cash generation for further improvement.";
    } else if (netProfit === 0) {
      financialInsight =
        "The business is at break-even. Review operating costs and pricing opportunities.";
    } else {
      financialInsight =
        "Expenses are higher than revenue. Cost control and revenue improvement should be prioritised.";
    }
  }

  let esgInsight = "Enter an ESG score to generate an insight.";
  if (Number(esgScore) >= 75) {
    esgInsight =
      "ESG performance is strong. Focus on maintaining evidence, reporting quality and continuous improvement.";
  } else if (Number(esgScore) >= 50) {
    esgInsight =
      "ESG performance is moderate. Identify weaker environmental, social or governance areas for improvement.";
  } else if (Number(esgScore) > 0) {
    esgInsight =
      "ESG performance is currently low. A structured ESG improvement plan may be required.";
  }

  let carbonInsight = "Enter carbon emissions to generate an insight.";
  if (Number(carbonEmissions) > 10000) {
    carbonInsight =
      "Carbon emissions appear relatively high. Review energy efficiency, renewable energy and travel reduction opportunities.";
  } else if (Number(carbonEmissions) > 0) {
    carbonInsight =
      "Carbon emissions are recorded. Continue monitoring trends and identify practical reduction opportunities.";
  }

  let climateInsight = "Enter a climate risk score to generate an insight.";
  if (Number(climateRisk) >= 70) {
    climateInsight =
      "Climate risk is high. Physical and transition risk mitigation should be prioritised.";
  } else if (Number(climateRisk) >= 40) {
    climateInsight =
      "Climate risk is moderate. Consider scenario analysis and risk-reduction measures.";
  } else if (Number(climateRisk) > 0) {
    climateInsight =
      "Climate risk is currently low, but ongoing monitoring is recommended.";
  }

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "300px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "6px",
  };

  const cardStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
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
        AI Insights
      </h1>

      <p>
        Generate financial, ESG, carbon and climate-risk insights from business data.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h2>Revenue</h2>
          <p>Annual or reporting-period revenue (£)</p>
          <input
            type="number"
            min="0"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Expenses</h2>
          <p>Annual or reporting-period expenses (£)</p>
          <input
            type="number"
            min="0"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>ESG Score</h2>
          <p>Enter score from 0 to 100</p>
          <input
            type="number"
            min="0"
            max="100"
            value={esgScore}
            onChange={(e) => setEsgScore(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Carbon Emissions</h2>
          <p>Total estimated emissions (kg CO₂e)</p>
          <input
            type="number"
            min="0"
            value={carbonEmissions}
            onChange={(e) => setCarbonEmissions(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2>Climate Risk Score</h2>
          <p>Enter score from 0 to 100</p>
          <input
            type="number"
            min="0"
            max="100"
            value={climateRisk}
            onChange={(e) => setClimateRisk(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h2>Financial Health Insight</h2>
          <p>
            Net Profit: <strong>£{netProfit.toLocaleString()}</strong>
          </p>
          <p>{financialInsight}</p>
        </div>

        <div style={cardStyle}>
          <h2>ESG Insight</h2>
          <p>{esgInsight}</p>
        </div>

        <div style={cardStyle}>
          <h2>Carbon Insight</h2>
          <p>{carbonInsight}</p>
        </div>

        <div style={cardStyle}>
          <h2>Climate Risk Insight</h2>
          <p>{climateInsight}</p>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: "25px",
          borderLeft: "5px solid #0b5d4b",
        }}
      >
        <h2>AI Decision Support</h2>
        <p>
          This prototype combines financial and sustainability indicators to
          provide automated decision-support insights.
        </p>
      </div>
    </main>
  );
}
