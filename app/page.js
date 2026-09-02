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
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  const [summary, setSummary] = useState({
    revenue: 0,
    profit: 0,
    esgScore: 0,
    carbon: 0,
    sustainablePercentage: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadClient() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("client_id, client_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profile) {
        setClientId(profile.client_id || "");
        setClientName(profile.client_name || "");
      }

      const [financial, esg, carbon, sustainable] = await Promise.all([
        supabase
          .from("financial_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("esg_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("carbon_energy_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("sustainable_finance_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const revenue = Number(financial.data?.revenue || 0);
      const expenses = Number(financial.data?.expenses || 0);
      const profit = revenue - expenses;

      const environmental = Number(
        esg.data?.environmental_score ?? esg.data?.environmental ?? 0
      );

      const social = Number(
        esg.data?.social_score ?? esg.data?.social ?? 0
      );

      const governance = Number(
        esg.data?.governance_score ?? esg.data?.governance ?? 0
      );

      const esgScore =
        environmental > 0 || social > 0 || governance > 0
          ? (environmental + social + governance) / 3
          : 0;

      const carbonTotal = Number(
        carbon.data?.carbon_emissions_kg || 0
      );

      const greenInvestment = Number(
        sustainable.data?.green_investment || 0
      );

      const sustainableLoans = Number(
        sustainable.data?.sustainable_loans || 0
      );

      const esgFunds = Number(
        sustainable.data?.esg_funds || 0
      );

      const totalFinance = Number(
        sustainable.data?.total_finance || 0
      );

      const sustainableTotal =
        greenInvestment + sustainableLoans + esgFunds;

      const sustainablePercentage =
        totalFinance > 0
          ? (sustainableTotal / totalFinance) * 100
          : 0;

      if (!mounted) return;

      setSummary({
        revenue,
        profit,
        esgScore,
        carbon: carbonTotal,
        sustainablePercentage,
      });

      setLoading(false);
    }

    loadClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading secure client dashboard...
      </main>
    );
  }

  const summaryCards = [
    {
      title: "Revenue",
      value: `£${summary.revenue.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      title: "Net Profit",
      value: `£${summary.profit.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    },
    {
      title: "ESG Score",
      value: `${summary.esgScore.toFixed(1)}/100`,
    },
    {
      title: "Carbon Emissions",
      value: `${summary.carbon.toFixed(2)} kg CO₂e`,
    },
    {
      title: "Sustainable Finance",
      value: `${summary.sustainablePercentage.toFixed(1)}%`,
    },
  ];

  const cards = [
    {
      title: "Financial Overview",
      description: "View financial performance and accounting insights.",
      href: "/financial",
    },
    {
      title: "ESG Performance",
      description: "Track environmental, social and governance metrics.",
      href: "/esg",
    },
    {
      title: "Carbon & Energy",
      description: "Monitor carbon emissions and energy performance.",
      href: "/carbon-energy",
    },
    {
      title: "Sustainable Finance",
      description: "Track sustainable investments and finance indicators.",
      href: "/sustainable-finance",
    },
    {
      title: "AI Insights",
      description:
        "View automated financial and sustainability insights.",
      href: "/ai-insights",
    },
    {
      title: "Documents",
      description:
        "Access your client accounting and reporting documents.",
      href: "/documents",
    },
  ];

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
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              color: "#0b5d4b",
              marginBottom: "10px",
            }}
          >
            N&T AI-Powered Sustainable Finance & Accounting
          </h1>

          <p
            style={{
              margin: 0,
              color: "#555",
            }}
          >
            Secure Client Portal
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#0b5d4b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <hr
        style={{
          margin: "25px 0",
          border: "none",
          borderTop: "1px solid #ddd",
        }}
      />

      <h2>Welcome to Your Business & Sustainability Dashboard</h2>

      <p
        style={{
          color: "#555",
          lineHeight: "1.6",
        }}
      >
        View your latest financial, ESG, carbon and sustainable finance
        information from one secure platform.
      </p>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          Logged in as: <strong>{email}</strong>
        </p>

        <p style={{ margin: "5px 0" }}>
          Client ID: <strong>{clientId || "Not assigned"}</strong>
        </p>

        <p style={{ margin: "5px 0" }}>
          Client Name: <strong>{clientName || "Not assigned"}</strong>
        </p>
      </div>

      <h2
        style={{
          marginTop: "35px",
          color: "#0b5d4b",
        }}
      >
        Business & Sustainability Snapshot
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "18px",
          marginTop: "20px",
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
              borderTop: "4px solid #0b5d4b",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "14px",
              }}
            >
              {card.title}
            </p>

            <h3
              style={{
                color: "#0b5d4b",
                marginTop: "12px",
                marginBottom: 0,
                fontSize: "22px",
              }}
            >
              {card.value}
            </h3>
          </div>
        ))}
      </div>

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        Client Portal Services
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.href}
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ color: "#0b5d4b" }}>
              {card.title}
            </h3>

            <p
              style={{
                lineHeight: "1.5",
                color: "#555",
              }}
            >
              {card.description}
            </p>

            <Link
              href={card.href}
              style={{
                color: "#0b5d4b",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Open →
            </Link>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: "35px",
          fontSize: "13px",
          color: "#777",
          textAlign: "center",
        }}
      >
        N&T AI-Powered Sustainable Finance & Accounting — Secure Client
        Reporting Portal
      </p>
    </main>
  );
}
