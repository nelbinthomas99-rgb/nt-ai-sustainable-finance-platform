"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function GeospatialIntelligencePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState(null);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    location_name: "",
    postcode: "",
    country: "",
    latitude: "",
    longitude: "",
    elevation_m: "",
    terrain_type: "",
    river_exposure: "",
    coastal_exposure: "",
    flood_geography: "",
    land_use: "",
    infrastructure_context: "",
    solar_geography: "",
    wind_geography: "",
    biodiversity_context: "",
    evidence_source: "",
    evidence_reference: "",
    evidence_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("owner_user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (clientError || !clientData) {
      setError("No active client profile found.");
      setLoading(false);
      return;
    }

    setClient(clientData);

    const { data, error: geoError } = await supabase
      .from("geospatial_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (geoError) {
      setError(geoError.message);
      setLoading(false);
      return;
    }

    if (data) {
      setRecord(data);

      setForm({
        location_name: data.location_name || "",
        postcode: data.postcode || "",
        country: data.country || "",
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
        elevation_m: data.elevation_m ?? "",
        terrain_type: data.terrain_type || "",
        river_exposure: data.river_exposure || "",
        coastal_exposure: data.coastal_exposure || "",
        flood_geography: data.flood_geography || "",
        land_use: data.land_use || "",
        infrastructure_context: data.infrastructure_context || "",
        solar_geography: data.solar_geography || "",
        wind_geography: data.wind_geography || "",
        biodiversity_context: data.biodiversity_context || "",
        evidence_source: data.evidence_source || "",
        evidence_reference: data.evidence_reference || "",
        evidence_date: data.evidence_date || "",
      });
    }

    setLoading(false);
  }

  function change(field, value) {
    setForm((old) => ({
      ...old,
      [field]: value,
    }));
  }

  function numberOrNull(value) {
    if (value === "") return null;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function saveData() {
    if (!client) return;

    setSaving(true);
    setError("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const payload = {
      client_id: client.id,
      user_id: user.id,

      location_name: form.location_name || null,
      postcode: form.postcode || null,
      country: form.country || null,

      latitude: numberOrNull(form.latitude),
      longitude: numberOrNull(form.longitude),
      elevation_m: numberOrNull(form.elevation_m),

      terrain_type: form.terrain_type || null,

      river_exposure: form.river_exposure || null,
      coastal_exposure: form.coastal_exposure || null,
      flood_geography: form.flood_geography || null,

      land_use: form.land_use || null,
      infrastructure_context: form.infrastructure_context || null,

      solar_geography: form.solar_geography || null,
      wind_geography: form.wind_geography || null,

      biodiversity_context: form.biodiversity_context || null,

      evidence_source: form.evidence_source || null,
      evidence_reference: form.evidence_reference || null,
      evidence_date: form.evidence_date || null,

      assessment_status: "assessed",
      methodology_version: "NT-GEO-v1",
      updated_at: new Date().toISOString(),
    };

    let result;

    if (record?.id) {
      result = await supabase
        .from("geospatial_intelligence")
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("geospatial_intelligence")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setRecord(result.data);
    setMessage("Geospatial intelligence saved successfully.");
    setSaving(false);
  }

  function show(value, suffix = "") {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Awaiting evidence";
    }

    return `${value}${suffix}`;
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Geospatial Intelligence</h2>
        <p>Loading location intelligence...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button
          style={styles.back}
          onClick={() => router.push("/")}
        >
          ← Dashboard
        </button>

        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              N&T GEOSPATIAL INTELLIGENCE ENGINE
            </div>

            <h1 style={styles.title}>
              Geospatial Intelligence
            </h1>

            <p style={styles.subtitle}>
              Connect business location with physical geography,
              flood exposure, land use, infrastructure,
              renewable-energy geography and environmental evidence.
            </p>
          </div>

          <div style={styles.badge}>
            DAY 13 • GEOSPATIAL ENGINE
          </div>
        </header>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {message && (
          <div style={styles.success}>{message}</div>
        )}

        <section style={styles.summaryGrid}>
          <Summary
            label="CLIENT"
            value={client?.client_name}
            sub={client?.client_code}
          />

          <Summary
            label="LOCATION"
            value={record?.location_name || "Awaiting location"}
            sub={record?.country || "Country awaiting evidence"}
          />

          <Summary
            label="STATUS"
            value={record?.assessment_status || "draft"}
            sub="Geospatial evidence workflow"
          />

          <Summary
            label="METHODOLOGY"
            value={record?.methodology_version || "NT-GEO-v1"}
            sub="Evidence-first location intelligence"
          />
        </section>

        <Section title="LOCATION INTELLIGENCE">

          <div style={styles.formGrid}>
            <Input
              label="Location / City"
              value={form.location_name}
              onChange={(v) => change("location_name", v)}
              placeholder="Example: Watford"
            />

            <Input
              label="Postcode"
              value={form.postcode}
              onChange={(v) => change("postcode", v)}
              placeholder="Example: WD17"
            />

            <Input
              label="Country"
              value={form.country}
              onChange={(v) => change("country", v)}
              placeholder="United Kingdom"
            />

            <NumberInput
              label="Latitude"
              value={form.latitude}
              onChange={(v) => change("latitude", v)}
              placeholder="51.6565"
            />

            <NumberInput
              label="Longitude"
              value={form.longitude}
              onChange={(v) => change("longitude", v)}
              placeholder="-0.3903"
            />

            <NumberInput
              label="Elevation (metres)"
              value={form.elevation_m}
              onChange={(v) => change("elevation_m", v)}
              placeholder="Verified elevation"
            />
          </div>

        </Section>

        <Section title="PHYSICAL GEOGRAPHY">

          <div style={styles.formGrid}>
            <Input
              label="Terrain Type"
              value={form.terrain_type}
              onChange={(v) => change("terrain_type", v)}
              placeholder="Urban, lowland, coastal..."
            />

            <Select
              label="River Exposure"
              value={form.river_exposure}
              onChange={(v) => change("river_exposure", v)}
            />

            <Select
              label="Coastal Exposure"
              value={form.coastal_exposure}
              onChange={(v) => change("coastal_exposure", v)}
            />

            <Input
              label="Flood Geography"
              value={form.flood_geography}
              onChange={(v) => change("flood_geography", v)}
              placeholder="Verified flood geography evidence"
            />
          </div>

        </Section>

        <Section title="LAND + INFRASTRUCTURE">

          <div style={styles.formGrid}>
            <Input
              label="Land Use"
              value={form.land_use}
              onChange={(v) => change("land_use", v)}
              placeholder="Urban, commercial, agricultural..."
            />

            <Input
              label="Infrastructure Context"
              value={form.infrastructure_context}
              onChange={(v) =>
                change("infrastructure_context", v)
              }
              placeholder="Transport, grid, utilities..."
            />

            <Input
              label="Biodiversity / Nature Context"
              value={form.biodiversity_context}
              onChange={(v) =>
                change("biodiversity_context", v)
              }
              placeholder="Protected areas, habitats..."
            />
          </div>

        </Section>

        <Section title="RENEWABLE ENERGY GEOGRAPHY">

          <div style={styles.formGrid}>
            <Select
              label="Solar Geography"
              value={form.solar_geography}
              onChange={(v) => change("solar_geography", v)}
            />

            <Select
              label="Wind Geography"
              value={form.wind_geography}
              onChange={(v) => change("wind_geography", v)}
            />
          </div>

        </Section>

        <Section title="EVIDENCE + PROVENANCE">

          <div style={styles.formGrid}>
            <Input
              label="Evidence Source"
              value={form.evidence_source}
              onChange={(v) => change("evidence_source", v)}
              placeholder="Dataset, authority, consultant..."
            />

            <Input
              label="Evidence Reference"
              value={form.evidence_reference}
              onChange={(v) =>
                change("evidence_reference", v)
              }
              placeholder="Dataset / report reference"
            />

            <div>
              <label style={styles.label}>
                Evidence Date
              </label>

              <input
                type="date"
                style={styles.input}
                value={form.evidence_date}
                onChange={(e) =>
                  change("evidence_date", e.target.value)
                }
              />
            </div>
          </div>

        </Section>

        <button
          style={styles.save}
          onClick={saveData}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Geospatial Assessment"}
        </button>

        <Section title="GEOGRAPHIC INTELLIGENCE MATRIX">

          <div style={styles.matrixGrid}>
            <Card
              title="Coordinates"
              value={
                record?.latitude != null &&
                record?.longitude != null
                  ? `${record.latitude}, ${record.longitude}`
                  : "Awaiting evidence"
              }
              sub="Verified geographic position"
            />

            <Card
              title="Elevation"
              value={show(record?.elevation_m, " m")}
              sub="Physical geography"
            />

            <Card
              title="River Exposure"
              value={show(record?.river_exposure)}
              sub="River proximity / exposure evidence"
            />

            <Card
              title="Coastal Exposure"
              value={show(record?.coastal_exposure)}
              sub="Coastal geography evidence"
            />

            <Card
              title="Land Use"
              value={show(record?.land_use)}
              sub="Location context"
            />

            <Card
              title="Infrastructure"
              value={show(record?.infrastructure_context)}
              sub="Business infrastructure context"
            />

            <Card
              title="Solar Geography"
              value={show(record?.solar_geography)}
              sub="Renewable opportunity evidence"
            />

            <Card
              title="Wind Geography"
              value={show(record?.wind_geography)}
              sub="Renewable opportunity evidence"
            />
          </div>

        </Section>

        <section style={styles.flowPanel}>
          <div style={styles.eyebrow}>
            N&T GEOSPATIAL DECISION FLOW
          </div>

          <h2 style={styles.flowTitle}>
            Geography → Climate → Energy → Business →
            Finance
          </h2>

          <div style={styles.flow}>
            <Flow text="Location" />
            <Arrow />
            <Flow text="Physical Geography" />
            <Arrow />
            <Flow text="Climate Risk" />
            <Arrow />
            <Flow text="Renewable Energy" />
            <Arrow />
            <Flow text="Financial Impact" />
            <Arrow />
            <Flow text="Green Finance" />
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>✓</div>

          <div>
            <h3 style={{ margin: 0 }}>
              Geographic Evidence Integrity
            </h3>

            <p style={styles.muted}>
              Missing geographic evidence remains missing.
              N&T does not automatically classify flood,
              renewable-energy or environmental suitability
              without supporting location-specific evidence.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <>
      <div style={styles.sectionTitle}>
        {title}
      </div>
      {children}
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <input
        type="number"
        step="any"
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Select({ label, value, onChange }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <select
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">
          Awaiting assessment
        </option>
        <option value="low">Low</option>
        <option value="moderate">
          Moderate
        </option>
        <option value="high">High</option>
      </select>
    </div>
  );
}

function Summary({
  label,
  value,
  sub,
}) {
  return (
    <div>
      <div style={styles.label}>
        {label}
      </div>

      <div style={styles.summaryValue}>
        {value || "—"}
      </div>

      <div style={styles.muted}>
        {sub}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  sub,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>
        {title}
      </div>

      <div style={styles.cardValue}>
        {value}
      </div>

      <div style={styles.muted}>
        {sub}
      </div>
    </div>
  );
}

function Flow({ text }) {
  return (
    <div style={styles.flowBox}>
      {text}
    </div>
  );
}

function Arrow() {
  return (
    <div style={styles.arrow}>
      →
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 85% 0%, #103d2d 0%, #061710 35%, #020706 80%)",
    color: "#f4fff9",
    fontFamily: "Arial, sans-serif",
    padding: "35px 20px 80px",
  },

  loading: {
    minHeight: "100vh",
    background: "#020706",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    maxWidth: 1250,
    margin: "0 auto",
  },

  back: {
    padding: "10px 16px",
    borderRadius: 9,
    border: "1px solid #24523f",
    background: "transparent",
    color: "#6cebae",
    cursor: "pointer",
    marginBottom: 30,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 30,
    marginBottom: 30,
  },

  eyebrow: {
    color: "#55eca4",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.7,
  },

  title: {
    fontSize: "clamp(40px, 6vw, 68px)",
    lineHeight: 1,
    letterSpacing: -2,
    margin: "12px 0 18px",
  },

  subtitle: {
    maxWidth: 800,
    color: "#9bb5a8",
    lineHeight: 1.7,
  },

  badge: {
    height: "fit-content",
    border: "1px solid #28704e",
    borderRadius: 30,
    padding: "10px 15px",
    color: "#67efae",
    fontSize: 12,
    fontWeight: 900,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: 18,
    padding: 24,
    borderRadius: 18,
    border: "1px solid #183d2f",
    background: "rgba(5,26,18,.9)",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 7,
  },

  sectionTitle: {
    margin: "38px 0 15px",
    color: "#70eeb2",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.8,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",
    gap: 16,
  },

  label: {
    display: "block",
    marginBottom: 8,
    color: "#68eeb0",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid #24513d",
    background: "#06140f",
    color: "white",
    outline: "none",
  },

  save: {
    marginTop: 25,
    padding: "14px 22px",
    border: 0,
    borderRadius: 10,
    background: "#4cea9d",
    color: "#03110a",
    fontWeight: 900,
    cursor: "pointer",
  },

  matrixGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  card: {
    minHeight: 130,
    padding: 22,
    borderRadius: 17,
    border: "1px solid #183e2e",
    background: "#06140f",
  },

  cardValue: {
    fontSize: 19,
    fontWeight: 900,
    margin: "14px 0 9px",
    textTransform: "capitalize",
  },

  muted: {
    color: "#89a497",
    fontSize: 13,
    lineHeight: 1.6,
  },

  flowPanel: {
    marginTop: 38,
    padding: 29,
    borderRadius: 18,
    border: "1px solid #266044",
    background:
      "linear-gradient(120deg,rgba(11,70,46,.7),rgba(4,16,11,.95))",
  },

  flowTitle: {
    fontSize: 28,
    margin: "10px 0 23px",
  },

  flow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },

  flowBox: {
    padding: "12px 14px",
    borderRadius: 9,
    border: "1px solid #2a7152",
    background: "#09271c",
    fontSize: 12,
    fontWeight: 800,
  },

  arrow: {
    color: "#52eca3",
    fontSize: 20,
  },

  integrity: {
    marginTop: 22,
    padding: 25,
    display: "flex",
    gap: 18,
    borderRadius: 18,
    border: "1px solid #296247",
    background: "rgba(14,73,47,.18)",
  },

  check: {
    minWidth: 36,
    height: 36,
    borderRadius: "50%",
    background: "#4cea9d",
    color: "#031009",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 900,
  },

  error: {
    padding: 15,
    marginBottom: 20,
    border: "1px solid #914343",
    background: "rgba(130,30,30,.2)",
    borderRadius: 10,
  },

  success: {
    padding: 15,
    marginBottom: 20,
    border: "1px solid #28704e",
    background: "rgba(40,130,80,.15)",
    borderRadius: 10,
  },
};
