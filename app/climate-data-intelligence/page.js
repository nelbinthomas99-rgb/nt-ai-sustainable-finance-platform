"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ClimateDataIntelligencePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [client, setClient] = useState(null);
  const [geo, setGeo] = useState(null);
  const [record, setRecord] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    location_name: "",
    country: "",
    latitude: "",
    longitude: "",

    annual_mean_temperature_c: "",
    annual_precipitation_mm: "",
    hot_days_per_year: "",
    heavy_rain_days_per_year: "",
    dry_days_per_year: "",

    heat_indicator: "",
    rainfall_indicator: "",
    drought_indicator: "",
    flood_indicator: "",

    baseline_period: "",
    observation_period: "",

    evidence_source: "",
    evidence_reference: "",
    evidence_date: "",

    notes: "",
  });

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
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

    const { data: geoData } = await supabase
      .from("geospatial_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setGeo(geoData || null);

    const { data: climateData, error: climateError } = await supabase
      .from("climate_data_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (climateError) {
      setError(climateError.message);
      setLoading(false);
      return;
    }

    if (climateData) {
      setRecord(climateData);

      setForm({
        location_name: climateData.location_name || "",
        country: climateData.country || "",
        latitude: climateData.latitude ?? "",
        longitude: climateData.longitude ?? "",

        annual_mean_temperature_c:
          climateData.annual_mean_temperature_c ?? "",

        annual_precipitation_mm:
          climateData.annual_precipitation_mm ?? "",

        hot_days_per_year:
          climateData.hot_days_per_year ?? "",

        heavy_rain_days_per_year:
          climateData.heavy_rain_days_per_year ?? "",

        dry_days_per_year:
          climateData.dry_days_per_year ?? "",

        heat_indicator:
          climateData.heat_indicator || "",

        rainfall_indicator:
          climateData.rainfall_indicator || "",

        drought_indicator:
          climateData.drought_indicator || "",

        flood_indicator:
          climateData.flood_indicator || "",

        baseline_period:
          climateData.baseline_period || "",

        observation_period:
          climateData.observation_period || "",

        evidence_source:
          climateData.evidence_source || "",

        evidence_reference:
          climateData.evidence_reference || "",

        evidence_date:
          climateData.evidence_date || "",

        notes:
          climateData.notes || "",
      });
    } else {
      setForm((old) => ({
        ...old,
        location_name: geoData?.location_name || "",
        country: geoData?.country || "",
        latitude: geoData?.latitude ?? "",
        longitude: geoData?.longitude ?? "",
      }));
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

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }

  const completeness = useMemo(() => {
    const fields = [
      form.annual_mean_temperature_c,
      form.annual_precipitation_mm,
      form.hot_days_per_year,
      form.heavy_rain_days_per_year,
      form.dry_days_per_year,
      form.heat_indicator,
      form.rainfall_indicator,
      form.drought_indicator,
      form.flood_indicator,
      form.evidence_source,
    ];

    const completed = fields.filter(
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined
    ).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }, [form]);

  async function saveClimateData() {
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

      location_name:
        form.location_name || null,

      country:
        form.country || null,

      latitude:
        numberOrNull(form.latitude),

      longitude:
        numberOrNull(form.longitude),

      annual_mean_temperature_c:
        numberOrNull(
          form.annual_mean_temperature_c
        ),

      annual_precipitation_mm:
        numberOrNull(
          form.annual_precipitation_mm
        ),

      hot_days_per_year:
        numberOrNull(
          form.hot_days_per_year
        ),

      heavy_rain_days_per_year:
        numberOrNull(
          form.heavy_rain_days_per_year
        ),

      dry_days_per_year:
        numberOrNull(
          form.dry_days_per_year
        ),

      heat_indicator:
        form.heat_indicator || null,

      rainfall_indicator:
        form.rainfall_indicator || null,

      drought_indicator:
        form.drought_indicator || null,

      flood_indicator:
        form.flood_indicator || null,

      baseline_period:
        form.baseline_period || null,

      observation_period:
        form.observation_period || null,

      evidence_source:
        form.evidence_source || null,

      evidence_reference:
        form.evidence_reference || null,

      evidence_date:
        form.evidence_date || null,

      notes:
        form.notes || null,

      data_completeness:
        completeness,

      assessment_status:
        completeness === 100
          ? "evidence_complete"
          : "partial",

      methodology_version:
        "NT-CDI-v1",

      updated_at:
        new Date().toISOString(),
    };

    let result;

    if (record?.id) {
      result = await supabase
        .from("climate_data_intelligence")
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("climate_data_intelligence")
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

    setMessage(
      "Climate evidence saved successfully."
    );

    setSaving(false);
  }

  function display(value, suffix = "") {
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
        <h2>
          N&T Climate Data Intelligence
        </h2>

        <p>
          Loading climate evidence...
        </p>
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
              N&T CLIMATE DATA INTELLIGENCE ENGINE
            </div>

            <h1 style={styles.title}>
              Climate Data Intelligence
            </h1>

            <p style={styles.subtitle}>
              Connect verified location-specific
              climate observations with heat,
              rainfall, drought and flood indicators
              while preserving evidence provenance
              and separating climate analysis from
              current weather.
            </p>
          </div>

          <div style={styles.badge}>
            DAY 14 • CLIMATE DATA ENGINE
          </div>

        </header>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        <section style={styles.summaryGrid}>

          <Summary
            label="CLIENT"
            value={client?.client_name}
            sub={client?.client_code}
          />

          <Summary
            label="LOCATION"
            value={
              form.location_name ||
              "Awaiting location"
            }
            sub={
              form.country ||
              "Country awaiting evidence"
            }
          />

          <Summary
            label="DATA COMPLETENESS"
            value={`${completeness}%`}
            sub="Evidence fields completed"
          />

          <Summary
            label="METHODOLOGY"
            value="NT-CDI-v1"
            sub="Evidence-first climate intelligence"
          />

        </section>

        <Section title="GEOGRAPHIC FOUNDATION">

          <div style={styles.formGrid}>

            <Input
              label="Location"
              value={form.location_name}
              onChange={(v) =>
                change("location_name", v)
              }
              placeholder="Example: Watford"
            />

            <Input
              label="Country"
              value={form.country}
              onChange={(v) =>
                change("country", v)
              }
              placeholder="United Kingdom"
            />

            <NumberInput
              label="Latitude"
              value={form.latitude}
              onChange={(v) =>
                change("latitude", v)
              }
              placeholder="51.6565"
            />

            <NumberInput
              label="Longitude"
              value={form.longitude}
              onChange={(v) =>
                change("longitude", v)
              }
              placeholder="-0.3903"
            />

          </div>

        </Section>

        <Section title="CLIMATE OBSERVATIONS">

          <div style={styles.formGrid}>

            <NumberInput
              label="Annual Mean Temperature (°C)"
              value={
                form.annual_mean_temperature_c
              }
              onChange={(v) =>
                change(
                  "annual_mean_temperature_c",
                  v
                )
              }
              placeholder="Verified climate value"
            />

            <NumberInput
              label="Annual Precipitation (mm)"
              value={
                form.annual_precipitation_mm
              }
              onChange={(v) =>
                change(
                  "annual_precipitation_mm",
                  v
                )
              }
              placeholder="Verified annual rainfall"
            />

            <NumberInput
              label="Hot Days Per Year"
              value={
                form.hot_days_per_year
              }
              onChange={(v) =>
                change(
                  "hot_days_per_year",
                  v
                )
              }
              placeholder="Verified observation"
            />

            <NumberInput
              label="Heavy Rain Days Per Year"
              value={
                form.heavy_rain_days_per_year
              }
              onChange={(v) =>
                change(
                  "heavy_rain_days_per_year",
                  v
                )
              }
              placeholder="Verified observation"
            />

            <NumberInput
              label="Dry Days Per Year"
              value={
                form.dry_days_per_year
              }
              onChange={(v) =>
                change(
                  "dry_days_per_year",
                  v
                )
              }
              placeholder="Verified observation"
            />

          </div>

        </Section>

        <Section title="CLIMATE HAZARD INDICATORS">

          <div style={styles.formGrid}>

            <IndicatorSelect
              label="Heat Indicator"
              value={form.heat_indicator}
              onChange={(v) =>
                change("heat_indicator", v)
              }
            />

            <IndicatorSelect
              label="Rainfall Indicator"
              value={form.rainfall_indicator}
              onChange={(v) =>
                change("rainfall_indicator", v)
              }
            />

            <IndicatorSelect
              label="Drought Indicator"
              value={form.drought_indicator}
              onChange={(v) =>
                change("drought_indicator", v)
              }
            />

            <IndicatorSelect
              label="Flood Indicator"
              value={form.flood_indicator}
              onChange={(v) =>
                change("flood_indicator", v)
              }
            />

          </div>

        </Section>

        <Section title="CLIMATE PERIOD">

          <div style={styles.formGrid}>

            <Input
              label="Baseline Period"
              value={form.baseline_period}
              onChange={(v) =>
                change("baseline_period", v)
              }
              placeholder="Example: 1991–2020"
            />

            <Input
              label="Observation / Projection Period"
              value={form.observation_period}
              onChange={(v) =>
                change("observation_period", v)
              }
              placeholder="Example: 2021–2040"
            />

          </div>

        </Section>

        <Section title="EVIDENCE + PROVENANCE">

          <div style={styles.formGrid}>

            <Input
              label="Evidence Source"
              value={form.evidence_source}
              onChange={(v) =>
                change("evidence_source", v)
              }
              placeholder="Met Office, Environment Agency..."
            />

            <Input
              label="Evidence Reference"
              value={form.evidence_reference}
              onChange={(v) =>
                change(
                  "evidence_reference",
                  v
                )
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
                  change(
                    "evidence_date",
                    e.target.value
                  )
                }
              />
            </div>

            <Input
              label="Assessment Notes"
              value={form.notes}
              onChange={(v) =>
                change("notes", v)
              }
              placeholder="Methodology or evidence notes"
            />

          </div>

        </Section>

        <button
          style={styles.save}
          onClick={saveClimateData}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Climate Evidence"}
        </button>

        <Section title="CLIMATE INTELLIGENCE MATRIX">

          <div style={styles.matrixGrid}>

            <Card
              title="Mean Temperature"
              value={display(
                record?.annual_mean_temperature_c,
                " °C"
              )}
              sub="Long-term climate observation"
            />

            <Card
              title="Annual Precipitation"
              value={display(
                record?.annual_precipitation_mm,
                " mm"
              )}
              sub="Climate precipitation evidence"
            />

            <Card
              title="Heat"
              value={display(
                record?.heat_indicator
              )}
              sub="Evidence-based indicator"
            />

            <Card
              title="Heavy Rain"
              value={display(
                record?.rainfall_indicator
              )}
              sub="Evidence-based indicator"
            />

            <Card
              title="Drought"
              value={display(
                record?.drought_indicator
              )}
              sub="Evidence-based indicator"
            />

            <Card
              title="Flood"
              value={display(
                record?.flood_indicator
              )}
              sub="Evidence-based indicator"
            />

            <Card
              title="Baseline"
              value={display(
                record?.baseline_period
              )}
              sub="Climate comparison baseline"
            />

            <Card
              title="Data Completeness"
              value={
                record?.data_completeness != null
                  ? `${record.data_completeness}%`
                  : `${completeness}%`
              }
              sub="Evidence availability"
            />

          </div>

        </Section>

        <section style={styles.flowPanel}>

          <div style={styles.eyebrow}>
            N&T CLIMATE INTELLIGENCE FLOW
          </div>

          <h2 style={styles.flowTitle}>
            Geography → Climate Data →
            Hazard Indicators → Business Impact →
            Financial Exposure → Resilience
          </h2>

          <div style={styles.flow}>

            <Flow text="Location" />
            <Arrow />

            <Flow text="Climate Evidence" />
            <Arrow />

            <Flow text="Heat / Rain / Drought / Flood" />
            <Arrow />

            <Flow text="Business Impact" />
            <Arrow />

            <Flow text="Financial Exposure" />
            <Arrow />

            <Flow text="Resilience Action" />

          </div>

        </section>

        <section style={styles.integrity}>

          <div style={styles.check}>
            ✓
          </div>

          <div>

            <h3 style={{ margin: 0 }}>
              Climate Data Integrity
            </h3>

            <p style={styles.muted}>
              Current weather is not treated as
              long-term climate risk. Climate
              classifications should be supported by
              appropriate historical observations,
              projections or authoritative
              location-specific datasets. Missing
              evidence remains missing.
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

      <label style={styles.label}>
        {label}
      </label>

      <input
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
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

      <label style={styles.label}>
        {label}
      </label>

      <input
        type="number"
        step="any"
        style={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />

    </div>
  );
}

function IndicatorSelect({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label style={styles.label}>
        {label}
      </label>

      <select
        style={styles.input}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >

        <option value="">
          Awaiting evidence
        </option>

        <option value="low">
          Low
        </option>

        <option value="moderate">
          Moderate
        </option>

        <option value="high">
          High
        </option>

        <option value="severe">
          Severe
        </option>

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
    fontSize: "clamp(40px,6vw,68px)",
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
