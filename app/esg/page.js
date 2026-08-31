"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ESGPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [environmental, setEnvironmental] = useState(0);
  const [social, setSocial] = useState(0);
  const [governance, setGovernance] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function checkLogin() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setLoading(false);
      }
    }

    checkLogin();

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

  const overallScore =
    (Number(environmental) + Number(social) + Number(governance)) / 3;

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "300px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    marginTop: "6px",
    marginBottom: "18px",
  };

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

      <h1
        style={{
          color: "#0b5d4b",
          marginTop: "30px",
        }}
      >
        ESG Performance
      </h1>

      <p>Enter your Environmental, Social and Governance scores.</p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>ESG Score Input</h2>

        <label>Environmental Score</label>
        <br />

        <input
          type="number"
          min="0"
          max="100"
          value={environmental}
          onChange={(e) => setEnvironmental(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Social Score</label>
        <br />

        <input
          type="number"
          min="0"
          max="100"
          value={social}
          onChange={(e) => setSocial(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Governance Score</label>
        <br />

        <input
          type="number"
          min="0"
          max="100"
          value={governance}
          onChange={(e) => setGovernance(e.target.value)}
          style={inputStyle}
        />

        <hr style={{ margin: "10px 0 25px" }} />

        <h2>ESG Summary</h2>

        <p>
          Environmental: <strong>{Number(environmental).toFixed(1)}/100</strong>
        </p>

        <p>
          Social: <strong>{Number(social).toFixed(1)}/100</strong>
        </p>

        <p>
          Governance: <strong>{Number(governance).toFixed(1)}/100</strong>
        </p>

        <p>
          Overall ESG Score: <strong>{overallScore.toFixed(1)}/100</strong>
        </p>
      </div>
    </main>
  );
}
