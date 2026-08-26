"use client";

import Link from "next/link";
import { useState } from "react";

export default function CarbonEnergyPage() {
  const [electricity, setElectricity] = useState("");
  const [gas, setGas] = useState("");
  const [travel, setTravel] = useState("");

  const electricityEmissions = (Number(electricity) || 0) * 0.193;
  const gasEmissions = (Number(gas) || 0) * 0.184;
  const travelEmissions = (Number(travel) || 0) * 0.171;

  const totalEmissions =
    electricityEmissions +
    gasEmissions +
    travelEmissions;

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
        Carbon & Energy
      </h1>

      <p>
        Enter energy consumption and business travel data
        to estimate carbon emissions.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h2>Electricity</h2>

          <p>Electricity consumption (kWh)</p>

          <input
            type="number"
            min="0"
            value={electricity}
            onChange={(e) =>
              setElectricity(e.target.value)
            }
            style={inputStyle}
          />

          <p>
            Estimated emissions:
            <br />
            <strong>
              {electricityEmissions.toFixed(2)} kg CO₂e
            </strong>
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Gas / Fuel</h2>

          <p>Gas consumption (kWh)</p>

          <input
            type="number"
            min="0"
            value={gas}
            onChange={(e) =>
              setGas(e.target.value)
            }
            style={inputStyle}
          />

          <p>
            Estimated emissions:
            <br />
            <strong>
              {gasEmissions.toFixed(2)} kg CO₂e
            </strong>
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Business Travel</h2>

          <p>Travel distance (km)</p>

          <input
            type="number"
            min="0"
            value={travel}
            onChange={(e) =>
              setTravel(e.target.value)
            }
            style={inputStyle}
          />

          <p>
            Estimated emissions:
            <br />
            <strong>
              {travelEmissions.toFixed(2)} kg CO₂e
            </strong>
          </p>
        </div>
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: "25px",
        }}
      >
        <h2>Carbon Summary</h2>

        <p>
          Electricity Emissions:{" "}
          <strong>
            {electricityEmissions.toFixed(2)} kg CO₂e
          </strong>
        </p>

        <p>
          Gas Emissions:{" "}
          <strong>
            {gasEmissions.toFixed(2)} kg CO₂e
          </strong>
        </p>

        <p>
          Business Travel Emissions:{" "}
          <strong>
            {travelEmissions.toFixed(2)} kg CO₂e
          </strong>
        </p>

        <hr />

        <h2 style={{ color: "#0b5d4b" }}>
          Total Estimated Emissions
        </h2>

        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
          }}
        >
          {totalEmissions.toFixed(2)} kg CO₂e
        </p>
      </div>

      <div
        style={{
          ...cardStyle,
          marginTop: "25px",
        }}
      >
        <h2>Important</h2>

        <p>
          This calculator is currently a prototype.
          Emission factors should be updated to verified
          UK Government conversion factors before
          production or professional reporting use.
        </p>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const inputStyle = {
  width: "100%",
  maxWidth: "300px",
  padding: "12px",
  border: "1px solid #cccccc",
  borderRadius: "8px",
  fontSize: "16px",
  marginTop: "8px",
  marginBottom: "15px",
};  
