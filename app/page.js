"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email || "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "40px",
        }}
      >
        Checking secure login...
      </main>
    );
  }

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f4f7f6",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ color: "#0b5d4b" }}>
            N&T AI-Powered Sustainable Finance & Accounting
          </h1>

          <p>Secure Client Portal</p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#0b5d4b",
            color: "white",
            border: "none",
            padding: "12px 22px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      <hr />

      <h2>Welcome to Your Financial Dashboard</h2>

      <p>
        Manage your accounting, sustainability, ESG and financial information
        from one secure platform.
      </p>

      <p>
        Logged in as: <strong>{email}</strong>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <DashboardCard
          title="Financial Overview"
          text="View financial performance and accounting insights."
          href="/financial"
        />

        <DashboardCard
          title="ESG Performance"
          text="Track environmental, social and governance metrics."
          href="/esg"
        />

        <DashboardCard
          title="Carbon & Energy"
          text="Monitor carbon emissions and energy performance."
          href="/carbon-energy"
        />

        <DashboardCard
          title="Sustainable Finance"
          text="Track sustainable investments and finance indicators."
          href="/sustainable-finance"
        />

        <DashboardCard
          title="AI Insights"
          text="AI-assisted financial and sustainability insights."
          href="/ai-insights"
        />

        <DashboardCard
          title="Documents"
          text="Access your client accounting and reporting documents."
          href="/documents"
        />
      </div>
    </main>
  );
}

function DashboardCard({ title, text, href }) {
  return (
    <div
      style={{
        background: "white",
        padding: "28px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ color: "#0b5d4b" }}>{title}</h3>

      <p>{text}</p>

      <Link
        href={href}
        style={{
          color: "#0b5d4b",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        Open →
      </Link>
    </div>
  );
}
