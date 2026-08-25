"use client";

import Link from "next/link";
import { useState } from "react";

export default function FinancialPage() {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  const netProfit = Number(revenue) - Number(expenses);

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

      <h1 style={{ color: "#0b5d4b" }}>Financial Overview</h1>

      <p>Enter your financial information below.</p>

      <div
        style={{
          background: "white",
          padding: "28px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Financial Data Input</h2>

        <label>
          Revenue (£)
          <br />
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            style={inputStyle}
          />
        </label>

        <br />

        <label>
          Expenses (£)
          <br />
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            style={inputStyle}
          />
        </label>

        <br />

        <label>
          Cash Balance (£)
          <br />
          <input
            type="number"
            value={cashBalance}
            onChange={(e) => setCashBalance(e.target.value)}
            style={inputStyle}
          />
        </label>

        <hr />

        <h2>Financial Summary</h2>

        <p>Revenue: £{Number(revenue).toFixed(2)}</p>
        <p>Expenses: £{Number(expenses).toFixed(2)}</p>

        <p>
          <strong>Net Profit: £{netProfit.toFixed(2)}</strong>
        </p>

        <p>Cash Balance: £{Number(cashBalance).toFixed(2)}</p>
      </div>
    </main>
  );
}
