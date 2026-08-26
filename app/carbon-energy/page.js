    "use client";

import Link from "next/link";
import { useState } from "react";

export default function CarbonEnergyPage() {
  const [electricity, setElectricity] = useState("");
  const [gas, setGas] = useState("");

  const total =
    (Number(electricity) || 0) +
    (Number(gas) || 0);

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
        Carbon & Energy Calculator
      </h1>

      <p>Test version for the N&T client portal.</p>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Electricity</h2>

        <input
          type="number"
          value={electricity}
          onChange={(e) => setElectricity(e.target.value)}
          placeholder="Enter electricity kWh"
          style={{
            padding: "12px",
            width: "300px",
            maxWidth: "100%",
          }}
        />

        <h2 style={{ marginTop: "25px" }}>Gas</h2>

        <input
          type="number"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
          placeholder="Enter gas kWh"
          style={{
            padding: "12px",
            width: "300px",
            maxWidth: "100%",
          }}
        />

        <hr style={{ margin: "30px 0" }} />

        <h2>Test Result</h2>

        <p>
          Combined Energy Input: <strong>{total}</strong>
        </p>
      </div>
    </main>
  );
}
