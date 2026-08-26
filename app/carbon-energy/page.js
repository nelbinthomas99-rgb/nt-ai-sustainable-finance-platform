```jsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function CarbonEnergyPage() {
  const [electricity, setElectricity] = useState(0);
  const [gas, setGas] = useState(0);
  const [travel, setTravel] = useState(0);
  const [renewable, setRenewable] = useState(0);

  const electricityFactor = 0.193;
  const gasFactor = 0.184;
  const travelFactor = 0.171;

  const electricityEmissions =
    Number(electricity) * electricityFactor;

  const gasEmissions =
    Number(gas) * gasFactor;

  const travelEmissions =
    Number(travel) * travelFactor;

  const totalEmissions =
    electricityEmissions +
    gasEmissions +
    travelEmissions;

  const renewablePercentage = Math.min(
    Math.max(Number(renewable), 0),
    100
  );

  const estimatedNetEmissions =
    totalEmissions *
    (1 - renewablePercentage / 100);

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "300px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "8px",
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

      <h1
        style={{
          color: "#0b5d4b",
          marginTop: "30px",
        }}
      >
        Carbon & Energy
      </h1>

      <p>
        Enter operational energy and business travel
        information to estimate carbon emissions.
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

        <p>
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
          These calculations are currently for platform
          demonstration purposes. Production calculations
          should use verified and current emissions factors.
        </p>
      </div>
    </main>
  );
}
```

