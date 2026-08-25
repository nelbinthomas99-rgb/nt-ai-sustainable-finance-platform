export default function Home() {
  return (
    <main style={{
      fontFamily: "Arial, sans-serif",
      background: "#f4f7f6",
      minHeight: "100vh",
      padding: "40px"
    }}>
      
      <h1 style={{ color: "#0b5d4b" }}>
        N&T AI-Powered Sustainable Finance & Accounting
      </h1>

      <p>
        Secure Client Portal
      </p>

      <hr />

      <h2>Welcome to Your Financial Dashboard</h2>

      <p>
        Manage your accounting, sustainability, ESG and financial
        information from one secure platform.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginTop: "30px"
      }}>

        <DashboardCard
          title="Financial Overview"
          text="View financial performance and accounting insights."
        />

        <DashboardCard
          title="ESG Performance"
          text="Track environmental, social and governance metrics."
        />

        <DashboardCard
          title="Carbon & Energy"
          text="Monitor carbon emissions and energy performance."
        />

        <DashboardCard
          title="Sustainable Finance"
          text="Track sustainable investments and finance indicators."
        />

        <DashboardCard
          title="AI Insights"
          text="AI-assisted financial and sustainability insights."
        />

        <DashboardCard
          title="Documents"
          text="Access your client accounting and reporting documents."
        />

      </div>
    </main>
  );
}

function DashboardCard({ title, text }) {
  return (
    <div style={{
      background: "white",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}>
      <h3 style={{ color: "#0b5d4b" }}>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
