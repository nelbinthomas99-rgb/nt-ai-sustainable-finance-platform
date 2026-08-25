import Link from "next/link";

export default function SustainableFinancePage() {
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
        Sustainable Finance
      </h1>

      <p>
        Track sustainable investments, green finance and ESG-linked financial activity.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <FinanceCard title="Green Investments" value="£0.00" />
        <FinanceCard title="Sustainable Loans" value="£0.00" />
        <FinanceCard title="ESG-Linked Finance" value="£0.00" />
        <FinanceCard title="Eligible Green Projects" value="0" />
      </div>
    </main>
  );
}

function FinanceCard({ title, value }) {
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
    </div>
  );
}
