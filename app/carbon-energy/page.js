"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function CarbonEnergyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [electricity, setElectricity] = useState(0);
  const [gas, setGas] = useState(0);
  const [travel, setTravel] = useState(0);

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

  const totalActivity =
    Number(electricity) + Number(gas) + Number(travel);

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
        Carbon & Energy
      </h1>

      <p>Track energy use and business activity data.</p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Activity Data Input</h2>

        <label>Electricity Usage (kWh)</label>
        <br />

        <input
          type="number"
          value={electricity}
          onChange={(e) => setElectricity(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Gas Usage (kWh)</label>
        <br />

        <input
          type="number"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Business Travel (miles)</label>
        <br />

        <input
          type="number"
          value={travel}
          onChange={(e) => setTravel(e.target.value)}
          style={inputStyle}
        />

        <hr style={{ margin: "10px 0 25px" }} />

        <h2>Activity Summary</h2>

        <p>
          Electricity: <strong>{Number(electricity).toFixed(0)} kWh</strong>
        </p>

        <p>
          Gas: <strong>{Number(gas).toFixed(0)} kWh</strong>
        </p>

        <p>
          Business Travel: <strong>{Number(travel).toFixed(0)} miles</strong>
        </p>

        <p>
          Total Recorded Activity: <strong>{totalActivity.toFixed(0)}</strong>
        </p>

        <p style={{ marginTop: "20px", color: "#555" }}>
          This page currently records activity data only. Carbon-emission
          calculations can be added later using verified UK conversion factors.
        </p>
      </div>
    </main>
  );
}
