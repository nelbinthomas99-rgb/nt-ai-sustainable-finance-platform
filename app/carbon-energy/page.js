```jsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function CarbonEnergyPage() {
  const [electricity, setElectricity] = useState("");
  const [gas, setGas] = useState("");
  const [travel, setTravel] = useState("");
  const [renewable, setRenewable] = useState("");

  const electricityFactor = 0.193;
  const gasFactor = 0.184;
  const travelFactor = 0.171;

  const electricityEmissions =
    (Number(electricity) || 0) * electricityFactor;

  const gasEmissions =
    (Number(gas) || 0) * gasFactor;

  const travelEmissions =
    (Number(travel) || 0) * travelFactor;

  const totalEmissions =
    electricityEmissions +
    gasEmissions +
    travelEmissions;

  const renewablePercentage = Math.min(
    Math.max(Number(renewable) || 0, 0),
    100
  );

  const estimatedNetEmissions =
    totalEmissions *
    (1 - renewablePercentage / 100);

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
            "repeat(auto-fit, minmax(260px, 1fr))",
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
            Estimated emissions:{" "}
            <strong>
              {electricityEmissions.toFixed(2)} kg CO₂e
            </strong>
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Gas / Fuel</h2>

          <p>Gas or fuel consumption (kWh)</p>

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
            Estimated emissions:{" "}
            <strong>
              {gasEmissions.toFixed(2)} kg CO₂e
            </strong>
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Business Travel</h2>

          <p>Business travel distance (km)</p>

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
            Estimated emissions:{" "}
            <strong>
              {travelEmissions.toFixed(2)} kg CO₂e
            </strong>
          </p>
        </div>

        <div style={cardStyle}>
          <h2>Renewable Energy</h2>

          <p>Renewable energy share (%)</p>

          <input
            type="number"
            min="0"
            max="100"
            value={renewable}
            onChange={(e) =>
              setRenewable(e.target.value)
            }
            style={inputStyle}
          />

          <p>
            Renewable share:{" "}
            <strong>
              {renewablePercentage.toFixed(1)}%
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
          Gas/Fuel Emissions:{" "}
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

        <p>
          Total Estimated Emissions:{" "}
          <strong>
            {totalEmissions.toFixed(2)} kg CO₂e
          </strong>
        </p>

        <p>
          Renewable Energy Share:{" "}
          <strong>
            {renewablePercentage.toFixed(1)}%
          </strong>
        </p>

        <p
          style={{
            fontSize: "22px",
            color: "#0b5d4b",
          }}
        >
          Estimated Net Emissions:{" "}
          <strong>
            {estimatedNetEmissions.toFixed(2)} kg CO₂e
          </strong>
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
          This calculator currently uses prototype emission
          factors for demonstration. Before professional or
          regulatory use, replace them with verified and
          current UK Government conversion factors.
        </p>
      </div>
    </main>
  );
}
```
