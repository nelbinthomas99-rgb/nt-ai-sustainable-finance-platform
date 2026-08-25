import Link from "next/link";

export default function FinancialPage() {
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
        Financial Overview
      </h1>

      <p>
        View your financial performance and accounting information.
      </p>

      <div
        style={{
          background: "white",
          padding: "25px",
          marginTop: "30px",
          borderRadius: "12px",
        }}
      >
        <h2>Financial Summary</h2>

        <p>Revenue: £0.00</p>
        <p>Expenses: £0.00</p>
        <p>Net Profit: £0.00</p>
        <p>Cash Balance: £0.00</p>
      </div>
    </main>
  );
}
