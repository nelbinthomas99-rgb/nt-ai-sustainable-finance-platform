import Link from "next/link";

export default function DocumentsPage() {
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
        Documents
      </h1>

      <p>
        View and manage accounting, ESG and sustainability documents.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <DocumentCard
          title="Accounting Documents"
          description="Invoices, statements, accounts and supporting records."
        />

        <DocumentCard
          title="ESG Reports"
          description="Environmental, social and governance reports."
        />

        <DocumentCard
          title="Carbon & Energy Records"
          description="Emissions, energy and sustainability evidence."
        />

        <DocumentCard
          title="Client Reports"
          description="Completed reports and advisory documents."
        />
      </div>
    </main>
  );
}

function DocumentCard({ title, description }) {
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
      <p>{description}</p>
      <p style={{ color: "#0b5d4b", fontWeight: "bold" }}>
        No documents uploaded
      </p>
    </div>
  );
}
