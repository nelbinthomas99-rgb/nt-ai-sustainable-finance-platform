import Link from "next/link";

export default function AIInsightsPage() {
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
        AI-assisted financial and sustainability insights for your business.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <InsightCard
          title="Financial Health"
          value="Analysing..."
          description="AI-assisted review of financial performance."
        />

        <InsightCard
          title="Cost Opportunities"
          value="No data yet"
          description="Identify potential cost-saving opportunities."
        />

        <InsightCard
          title="ESG Insights"
          value="No data yet"
          description="Analyse sustainability and ESG performance."
        />

        <InsightCard
          title="Risk Alerts"
          value="0"
          description="Monitor financial and sustainability risks."
        />
      </div>
    </main>
  );
}

function InsightCard({ title, value, description }) {
  return (
    <div
      style={{
        background: "white",
        padding: "26px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <h2>{title}</h2>
      <h3 style={{ color: "#0b5d4b" }}>{value}</h3>
      <p>{description}</p>
    </div>
  );
}
