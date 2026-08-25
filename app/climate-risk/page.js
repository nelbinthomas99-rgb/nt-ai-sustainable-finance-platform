import Link from "next/link";

export default function ClimateRiskPage() {
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
        Climate Risk Analysis
      </h1>

      <p>
        Identify and monitor financial risks arising from climate change,
        regulation and the transition to a low-carbon economy.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <RiskCard
          title="Physical Climate Risk"
          value="Low"
          text="Exposure to flooding, heat, storms and other physical climate events."
        />

        <RiskCard
          title="Transition Risk"
          value="Low"
          text="Risk from regulation, carbon pricing, technology and market transition."
        />

        <RiskCard
          title="Financial Exposure"
          value="£0.00"
          text="Estimated financial value exposed to identified climate risks."
        />

        <RiskCard
          title="Climate Risk Score"
          value="0 / 100"
          text="Combined climate-risk assessment for the organisation."
        />

        <RiskCard
          title="Carbon Price Exposure"
          value="£0.00"
          text="Potential financial exposure to future carbon pricing."
        />

        <RiskCard
          title="High-Risk Assets"
          value="0"
          text="Assets or operations requiring additional climate-risk review."
        />
      </div>
    </main>
  );
}

function RiskCard({ title, value, text }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <h2>{title}</h2>

      <p
        style={{
          fontSize: "26px",
          fontWeight: "bold",
          color: "#0b5d4b",
        }}
      >
        {value}
      </p>

      <p>{text}</p>
    </div>
  );
}
