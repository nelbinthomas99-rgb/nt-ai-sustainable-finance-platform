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
  const [userId, setUserId] = useState("");

  const [electricity, setElectricity] = useState(0);
  const [gas, setGas] = useState(0);
  const [travel, setTravel] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCarbonData() {
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
        .from("carbon_energy_data")
        .select(
          "electricity_kwh, gas_kwh, travel_km, carbon_emissions_kg, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!mounted) return;

      if (!error && data && data.length > 0) {
        setElectricity(Number(data[0].electricity_kwh) || 0);
        setGas(Number(data[0].gas_kwh) || 0);
        setTravel(Number(data[0].travel_km) || 0);
      }

      setLoading(false);
    }

    loadCarbonData();

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

  const electricityCarbon = Number(electricity) * 0.193;
  const gasCarbon = Number(gas) * 0.184;
  const travelCarbon = Number(travel) * 0.171;

  const totalCarbon =
    electricityCarbon + gasCarbon + travelCarbon;

  async function saveCarbonData() {
    if (!userId) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("carbon_energy_data")
      .insert([
        {
          id: Date.now(),
          user_id: userId,
          electricity_kwh: Number(electricity) || 0,
          gas_kwh: Number(gas) || 0,
          travel_km: Number(travel) || 0,
          carbon_emissions_kg: totalCarbon,
        },
      ]);

    if (error) {
      console.error(error);
      setMessage("Unable to save carbon data.");
    } else {
      setMessage("Carbon & Energy data saved successfully.");
    }

    setSaving(false);
  }

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
        Loading secure carbon data...
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

      <p>
        Enter energy and travel data to calculate an estimated
        carbon footprint.
      </p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Carbon & Energy Input</h2>

        <label>Electricity Usage (kWh)</label>
        <br />
        <input
          type="number"
          min="0"
          value={electricity}
          onChange={(e) => setElectricity(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Gas Usage (kWh)</label>
        <br />
        <input
          type="number"
          min="0"
          value={gas}
          onChange={(e) => setGas(e.target.value)}
          style={inputStyle}
        />

        <br />

        <label>Business Travel (km)</label>
        <br />
        <input
          type="number"
          min="0"
          value={travel}
          onChange={(e) => setTravel(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={saveCarbonData}
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
          {saving ? "Saving..." : "Save Carbon Data"}
        </button>

        {message && (
          <p
            style={{
              fontWeight: "bold",
              color:
                message ===
                "Carbon & Energy data saved successfully."
                  ? "#0b5d4b"
                  : "#b42318",
            }}
          >
            {message}
          </p>
        )}

        <hr style={{ margin: "20px 0 25px" }} />

        <h2>Carbon Summary</h2>

        <p>
          Electricity Emissions:{" "}
          <strong>{electricityCarbon.toFixed(2)} kg CO₂e</strong>
        </p>

        <p>
          Gas Emissions:{" "}
          <strong>{gasCarbon.toFixed(2)} kg CO₂e</strong>
        </p>

        <p>
          Travel Emissions:{" "}
          <strong>{travelCarbon.toFixed(2)} kg CO₂e</strong>
        </p>

        <p>
          Total Estimated Carbon Emissions:{" "}
          <strong>{totalCarbon.toFixed(2)} kg CO₂e</strong>
        </p>

        <p style={{ fontSize: "13px", color: "#666", marginTop: "20px" }}>
          Prototype calculation using demo emission factors.
        </p>
      </div>
    </main>
  );
}
