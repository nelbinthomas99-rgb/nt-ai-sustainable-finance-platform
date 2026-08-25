import Link from "next/link";

export default function CarbonEnergyPage() {
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
        Carbon & Energy
      </h1>

      <p>
        Monitor carbon emissions, renewable energy and energy efficiency.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <MetricCard
          title="Scope 1 Emissions"
          value="0 tCO2e"
          text="Direct greenhouse gas emissions."
        />

        <MetricCard
          title="Scope 2 Emissions"
          value="0 tCO2e"
          text="Indirect emissions from purchased energy."
        />

        <MetricCard
          title="Renewable Energy"
          value="0%"
          text="Share of energy from renewable sources."
        />

        <MetricCard
          title="Energy Consumption"
          value="0 kWh"
          text="Total organisational energy consumption."
        />
      </div>
    </main>
  );
}

function MetricCard({ title, value, text }) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
      }}
    >
      <h2>{title}</h2>
      <p style={{ fontSize: "26px", fontWeight: "bold", color: "#0b5d4b" }}>
        {value}
      </p>
      <p>{text}</p>
    </div>
  );
}
