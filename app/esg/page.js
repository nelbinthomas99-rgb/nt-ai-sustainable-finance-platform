"use client";

import Link from "next/link";
import { useState } from "react";

export default function ESGPage() {
  const [environmental, setEnvironmental] = useState(0);
  const [social, setSocial] = useState(0);
  const [governance, setGovernance] = useState(0);

  const overall =
    (Number(environmental) + Number(social) + Number(governance)) / 3;

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "220px",
    border: "1px solid #ccc",
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
        ESG Performance
      </h1>

      <p>Enter ESG scores from 0 to 100.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <ESGCard
          title="Environmental"
          value={environmental}
          onChange={setEnvironmental}
          inputStyle={inputStyle}
        />

        <ESGCard
          title="Social"
          value={social}
          onChange={setSocial}
          inputStyle={inputStyle}
        />

        <ESGCard
          title="Governance"
          value={governance}
          onChange={setGovernance}
          inputStyle={inputStyle}
        />

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Overall ESG Score</h2>

          <p
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              color: "#0b5d4b",
            }}
          >
            {overall.toFixed(1)} / 100
          </p>

          <p>Average of Environmental, Social and Governance scores.</p>
        </div>
      </div>
    </main>
  );
}

function ESGCard({ title, value, onChange, inputStyle }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
      }}
    >
      <h2>{title}</h2>

      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />

      <p>Current score: {Number(value).toFixed(0)} / 100</p>
    </div>
  );
}
