"use client";

import Link from "next/link";

export default function ArchitecturePage() {
  const box = {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
    border: "1px solid #dfe7e4",
  };

  const green = "#0b5d4b";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7f6",
        fontFamily: "Arial, sans-serif",
        padding: "35px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: green,
              }}
            >
              N&T AI-Powered Sustainable Finance & Accounting Platform
            </h1>

            <p
              style={{
                color: "#555",
                marginTop: "10px",
              }}
            >
              Multi-Client Platform Architecture
            </p>
          </div>

          <Link
            href="/"
            style={{
              background: green,
              color: "white",
              padding: "12px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        <hr
          style={{
            border: "none",
            borderTop: "1px solid #ddd",
            margin: "28px 0",
          }}
        />

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ color: green }}>1. Access Layer</h2>

          <div
            style={{
              ...box,
              textAlign: "center",
              maxWidth: "650px",
              margin: "0 auto",
              borderTop: `5px solid ${green}`,
            }}
          >
            <h2 style={{ marginBottom: "8px" }}>🔐 Secure Authentication</h2>

            <p style={{ margin: "5px 0" }}>
              Supabase Authentication
            </p>

            <p style={{ margin: "5px 0", color: "#666" }}>
              Email / Password • Secure Login • Role-Based Access
            </p>
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            fontSize: "28px",
            color: green,
            margin: "8px 0",
          }}
        >
          ↓
        </div>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ color: green }}>2. Portal Layer</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={{ ...box, borderTop: "5px solid #2e7d32" }}>
              <h2>👨‍💼 N&T Admin Portal</h2>

              <p>Manage clients and account information.</p>
              <p>Monitor business, financial and sustainability data.</p>
              <p>Access reports and client management tools.</p>
            </div>

            <div style={{ ...box, borderTop: "5px solid #1976d2" }}>
              <h2>👥 Client Portal</h2>

              <p>Each client has a secure login.</p>
              <p>Each client views only their own information.</p>
              <p>Access financial, ESG, carbon and reporting tools.</p>
            </div>
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            fontSize: "28px",
            color: green,
          }}
        >
          ↓
        </div>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ color: green }}>3. Client Layer</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {["Client A", "Client B", "Client C", "Client D", "Client E"].map(
              (client) => (
                <div
                  key={client}
                  style={{
                    ...box,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "35px" }}>🏢</div>
                  <h3>{client}</h3>
                  <p style={{ color: "#666" }}>
                    Company / Organisation
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            fontSize: "28px",
            color: green,
          }}
        >
          ↓
        </div>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ color: green }}>4. Module Layer</h2>

          <p style={{ color: "#555" }}>
            Each client will have access to their own isolated portal modules.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              ["📊", "Financial", "Accounting and financial data"],
              ["🌿", "ESG", "Environmental, Social and Governance"],
              ["🌍", "Carbon & Energy", "Emissions and energy tracking"],
              [
                "💚",
                "Sustainable Finance",
                "Investment and sustainable finance metrics",
              ],
              ["🧠", "AI Insights", "Automated analysis and insights"],
              ["📁", "Documents", "Secure document management"],
              ["📄", "Reports", "Client analytics and reports"],
            ].map(([icon, title, description]) => (
              <div
                key={title}
                style={{
                  ...box,
                  textAlign: "center",
                  borderTop: `4px solid ${green}`,
                }}
              >
                <div style={{ fontSize: "35px" }}>{icon}</div>
                <h3 style={{ color: green }}>{title}</h3>
                <p style={{ color: "#666" }}>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            textAlign: "center",
            fontSize: "28px",
            color: green,
          }}
        >
          ↓
        </div>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ color: green }}>5. Data & Storage Layer</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            }}
          >
            <div style={box}>
              <h3>🗄️ Supabase Database</h3>
              <p>Structured client data storage.</p>
              <p>Financial, ESG, carbon and sustainability information.</p>
            </div>

            <div style={box}>
              <h3>📂 Secure File Storage</h3>
              <p>Client document storage.</p>
              <p>Secure access to uploaded files.</p>
            </div>

            <div style={box}>
              <h3>🛡️ Row Level Security</h3>
              <p>Clients access only their own information.</p>
              <p>Data isolation between client accounts.</p>
            </div>

            <div style={box}>
              <h3>🔄 Backup & Security</h3>
              <p>Secure platform architecture.</p>
              <p>Data protection and future backup controls.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ color: green }}>6. Platform Benefits</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              "✅ Complete Client Data Isolation",
              "✅ Secure Role-Based Access",
              "✅ Multi-Client Scalability",
              "✅ Centralised N&T Management",
              "✅ Financial & ESG Reporting",
              "✅ AI-Powered Sustainable Finance Roadmap",
            ].map((benefit) => (
              <div
                key={benefit}
                style={{
                  ...box,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                {benefit}
              </div>
            ))}
          </div>
        </section>

        <p
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#777",
            fontSize: "13px",
          }}
        >
          N&T AI-Powered Sustainable Finance & Accounting — Platform
          Architecture
        </p>
      </div>
    </main>
  );
}
