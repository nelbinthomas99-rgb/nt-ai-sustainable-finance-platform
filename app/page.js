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

      const { data: profile, error: profileError } = await supabase
        .from("client_profiles")
        .select("client_id, client_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (!profileError && profile) {
        setClientId(profile.client_id || "");
        setClientName(profile.client_name || "");
      }

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
        Checking secure client access...
      </main>
    );
  }

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
      description: "AI-assisted financial and sustainability insights.",
      href: "/ai-insights",
    },
    {
      title: "Documents",
      description: "Access your client accounting and reporting documents.",
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
        }}
      >
        <div>
          <h1 style={{ color: "#0b5d4b", marginBottom: "10px" }}>
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
            borderRadius: "8px",
            padding: "12px 24px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <hr style={{ margin: "25px 0" }} />

      <h2>Welcome to Your Financial Dashboard</h2>

      <p>
        Manage your accounting, sustainability, ESG and financial information
        from one secure platform.
      </p>

      <div
        style={{
          background: "white",
          padding: "18px",
          borderRadius: "10px",
          marginTop: "20px",
          marginBottom: "30px",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
            <h3 style={{ color: "#0b5d4b" }}>{card.title}</h3>

            <p style={{ lineHeight: "1.5" }}>{card.description}</p>

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
    </main>
  );
}
