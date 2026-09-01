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
  const [userId, setUserId] = useState("");
  const [environmental, setEnvironmental] = useState(0);
  const [social, setSocial] = useState(0);
  const [governance, setGovernance] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadESGData() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("esg_data")
        .select(
          "environmental_score, social_score, governance_score, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!mounted) return;

      if (!error && data && data.length > 0) {
        setEnvironmental(Number(data[0].environmental_score) || 0);
        setSocial(Number(data[0].social_score) || 0);
        setGovernance(Number(data[0].governance_score) || 0);
      }

      setLoading(false);
    }

    loadESGData();

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

  async function saveESGData() {
    if (!userId) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("esg_data").insert([
      {
        id: Date.now(),
        user_id: userId,
        environmental_score: Number(environmental) || 0,
        social_score: Number(social) || 0,
        governance_score: Number(governance) || 0,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("Unable to save ESG data.");
    } else {
      setMessage("ESG data saved successfully.");
    }

    setSaving(false);
  }

  const overallScore =
    (Number(environmental) + Number(social) + Number(governance)) / 3;

  const inputStyle = {
    padding: "12px",
    width: "100%",
    maxWidth: "320px",
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
        Loading secure ESG data...
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

      <p>Enter and securely save your ESG scores.</p>

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

        <button
          onClick={saveESGData}
          disabled={saving}
          style={{
            background: "#0b5d4b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: saving ? "not-allowed" : "pointer",
            marginBottom: "20px",
          }}
        >
          {saving ? "Saving..." : "Save ESG Data"}
        </button>

        {message && (
          <p
            style={{
              fontWeight: "bold",
              color:
                message === "ESG data saved successfully."
                  ? "#0b5d4b"
                  : "#b42318",
            }}
          >
            {message}
          </p>
        )}

        <hr style={{ margin: "20px 0 25px" }} />

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
