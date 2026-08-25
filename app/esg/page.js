import Link from "next/link";

export default function ESGPage() {
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

      <p>
        Track your Environmental, Social and Governance performance.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Environmental</h2>
          <p>Score: 0/100</p>
          <p>Track emissions, energy and environmental performance.</p>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Social</h2>
          <p>Score: 0/100</p>
          <p>Track workforce, community and social indicators.</p>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Governance</h2>
          <p>Score: 0/100</p>
          <p>Track governance, compliance and business controls.</p>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h2>Overall ESG Score</h2>
          <p style={{ fontSize: "28px", fontWeight: "bold" }}>0/100</p>
          <p>Your combined ESG performance score.</p>
        </div>
      </div>
    </main>
  );
}
