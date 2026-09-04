"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ClimateAssessmentPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [client, setClient] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    location_name: "",
    country: "",
    flood_risk: "",
    heat_risk: "",
    storm_risk: "",
    drought_risk: "",
    business_impact: "",
    financial_exposure_gbp: "",
    resilience_action: "",
    evidence_source: "",
    evidence_reference: "",
    evidence_date: "",
  });

  useEffect(() => {
    loadAssessment();
  }, []);

  async function loadAssessment() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("owner_user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!clientData) {
      setError("No active client profile found.");
      setLoading(false);
      return;
    }

    setClient(clientData);

    const { data, error: assessmentError } = await supabase
      .from("climate_assessments")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessmentError) {
      setError(assessmentError.message);
      setLoading(false);
      return;
    }

    if (data) {
      setAssessment(data);

      setForm({
        location_name: data.location_name || "",
        country: data.country || "",
        flood_risk: data.flood_risk || "",
        heat_risk: data.heat_risk || "",
        storm_risk: data.storm_risk || "",
        drought_risk: data.drought_risk || "",
        business_impact: data.business_impact || "",
        financial_exposure_gbp: data.financial_exposure_gbp ?? "",
        resilience_action: data.resilience_action || "",
        evidence_source: data.evidence_source || "",
        evidence_reference: data.evidence_reference || "",
        evidence_date: data.evidence_date || "",
      });
    }

    setLoading(false);
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function saveAssessment() {
    if (!client) return;

    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      client_id: client.id,
      location_name: form.location_name || null,
      country: form.country || null,
      flood_risk: form.flood_risk || null,
      heat_risk: form.heat_risk || null,
      storm_risk: form.storm_risk || null,
      drought_risk: form.drought_risk || null,
      business_impact: form.business_impact || null,
      financial_exposure_gbp:
        form.financial_exposure_gbp === ""
          ? null
          : Number(form.financial_exposure_gbp),
      resilience_action: form.resilience_action || null,
      evidence_source: form.evidence_source || null,
      evidence_reference: form.evidence_reference || null,
      evidence_date: form.evidence_date || null,
      assessment_status: "assessed",
      methodology_version: "NT-CA-v1",
    };

    let result;

    if (assessment?.id) {
      result = await supabase
        .from("climate_assessments")
        .update(payload)
        .eq("id", assessment.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("climate_assessments")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setAssessment(result.data);
    setMessage("Climate assessment saved successfully.");
    setSaving(false);

    await loadAssessment();
  }

  function riskLabel(value) {
    return value ? value.toUpperCase() : "AWAITING ASSESSMENT";
  }

  function money(value) {
    if (value === null || value === undefined) return "Awaiting data";

    return `£${Number(value).toLocaleString()}`;
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Climate Assessment Engine</h2>
        <p>Loading climate assessment...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button style={styles.back} onClick={() => router.push("/")}>
          ← Dashboard
        </button>

        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              N&T CLIMATE ASSESSMENT ENGINE
            </div>

            <h1 style={styles.title}>Climate Assessment</h1>

            <p style={styles.subtitle}>
              Record location-specific climate evidence across flood, heat,
              storm and drought risks, then connect those hazards to business
              impact, financial exposure and resilience action.
            </p>
          </div>

          <div style={styles.badge}>DAY 12 • CLIMATE ENGINE</div>
        </header>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <section style={styles.clientPanel}>
          <Item
            title="CLIENT"
            value={client?.client_name}
            sub={client?.client_code}
          />

          <Item
            title="STATUS"
            value={assessment?.assessment_status || "draft"}
            sub="Climate evidence workflow"
          />

          <Item
            title="METHODOLOGY"
            value={assessment?.methodology_version || "NT-CA-v1"}
            sub="Evidence-first climate assessment"
          />

          <Item
            title="FINANCIAL EXPOSURE"
            value={money(assessment?.financial_exposure_gbp)}
            sub="Recorded climate-linked exposure"
          />
        </section>

        <div style={styles.sectionTitle}>LOCATION</div>

        <section style={styles.formGrid}>
          <Field
            label="Location"
            value={form.location_name}
            onChange={(v) => updateField("location_name", v)}
            placeholder="Example: Watford"
          />

          <Field
            label="Country"
            value={form.country}
            onChange={(v) => updateField("country", v)}
            placeholder="Example: United Kingdom"
          />
        </section>

        <div style={styles.sectionTitle}>PHYSICAL CLIMATE RISKS</div>

        <section style={styles.formGrid}>
          <RiskSelect
            label="Flood Risk"
            value={form.flood_risk}
            onChange={(v) => updateField("flood_risk", v)}
          />

          <RiskSelect
            label="Extreme Heat Risk"
            value={form.heat_risk}
            onChange={(v) => updateField("heat_risk", v)}
          />

          <RiskSelect
            label="Storm Risk"
            value={form.storm_risk}
            onChange={(v) => updateField("storm_risk", v)}
          />

          <RiskSelect
            label="Drought / Water Stress"
            value={form.drought_risk}
            onChange={(v) => updateField("drought_risk", v)}
          />
        </section>

        <div style={styles.sectionTitle}>BUSINESS + FINANCIAL IMPACT</div>

        <section style={styles.formGrid}>
          <Field
            label="Business Impact"
            value={form.business_impact}
            onChange={(v) => updateField("business_impact", v)}
            placeholder="Example: Operational disruption risk"
          />

          <NumberField
            label="Financial Exposure (£)"
            value={form.financial_exposure_gbp}
            onChange={(v) => updateField("financial_exposure_gbp", v)}
          />

          <Field
            label="Resilience Action"
            value={form.resilience_action}
            onChange={(v) => updateField("resilience_action", v)}
            placeholder="Example: Flood protection, heat plan..."
          />
        </section>

        <div style={styles.sectionTitle}>EVIDENCE & PROVENANCE</div>

        <section style={styles.formGrid}>
          <Field
            label="Evidence Source"
            value={form.evidence_source}
            onChange={(v) => updateField("evidence_source", v)}
            placeholder="Environment Agency, Met Office, consultant report..."
          />

          <Field
            label="Evidence Reference"
            value={form.evidence_reference}
            onChange={(v) => updateField("evidence_reference", v)}
            placeholder="Report ID, URL, dataset reference..."
          />

          <div>
            <label style={styles.label}>Evidence Date</label>

            <input
              type="date"
              style={styles.input}
              value={form.evidence_date}
              onChange={(e) => updateField("evidence_date", e.target.value)}
            />
          </div>
        </section>

        <button
          style={styles.save}
          onClick={saveAssessment}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Climate Assessment"}
        </button>

        <div style={styles.sectionTitle}>CLIMATE RISK MATRIX</div>

        <section style={styles.riskGrid}>
          <RiskCard
            title="Flood"
            value={riskLabel(assessment?.flood_risk)}
          />

          <RiskCard
            title="Extreme Heat"
            value={riskLabel(assessment?.heat_risk)}
          />

          <RiskCard
            title="Storm"
            value={riskLabel(assessment?.storm_risk)}
          />

          <RiskCard
            title="Drought / Water Stress"
            value={riskLabel(assessment?.drought_risk)}
          />
        </section>

        <div style={styles.sectionTitle}>RESILIENCE INTELLIGENCE</div>

        <section style={styles.metricGrid}>
          <Metric
            title="Business Impact"
            value={assessment?.business_impact || "Awaiting evidence"}
            sub="Recorded operational impact"
          />

          <Metric
            title="Financial Exposure"
            value={money(assessment?.financial_exposure_gbp)}
            sub="Recorded climate-linked exposure"
          />

          <Metric
            title="Resilience Action"
            value={assessment?.resilience_action || "Awaiting evidence"}
            sub="Recorded response action"
          />

          <Metric
            title="Location"
            value={
              assessment?.location_name
                ? `${assessment.location_name}, ${assessment.country || ""}`
                : "Awaiting location"
            }
            sub="Client-specific climate assessment"
          />
        </section>

        <section style={styles.flowPanel}>
          <div style={styles.eyebrow}>N&T CLIMATE DECISION FLOW</div>

          <h2 style={styles.flowTitle}>
            Location → Hazard → Business Impact → Financial Exposure →
            Resilience Action
          </h2>

          <div style={styles.flow}>
            <Flow text="Location" />
            <Arrow />
            <Flow text="Flood / Heat / Storm / Drought" />
            <Arrow />
            <Flow text="Business Impact" />
            <Arrow />
            <Flow text="Financial Exposure" />
            <Arrow />
            <Flow text="Resilience Action" />
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>✓</div>

          <div>
            <h3 style={{ marginTop: 0 }}>Climate Evidence Integrity</h3>

            <p style={styles.muted}>
              N&T records climate-risk classifications only when supporting
              evidence is available. Weather observations are kept separate
              from long-term climate risk, and missing evidence remains
              missing rather than being converted into fabricated scores.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }) {
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

function NumberField({ label, value, onChange }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function RiskSelect({ label, value, onChange }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>

      <select
        style={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Awaiting assessment</option>
        <option value="low">Low</option>
        <option value="moderate">Moderate</option>
        <option value="high">High</option>
        <option value="severe">Severe</option>
      </select>
    </div>
  );
}

function Item({ title, value, sub }) {
  return (
    <div>
      <div style={styles.label}>{title}</div>
      <div style={styles.itemValue}>{value || "—"}</div>
      <div style={styles.muted}>{sub}</div>
    </div>
  );
}

function RiskCard({ title, value }) {
  return (
    <div style={styles.riskCard}>
      <div style={styles.label}>{title}</div>
      <div style={styles.riskValue}>{value}</div>
    </div>
  );
}

function Metric({ title, value, sub }) {
  return (
    <div style={styles.metric}>
      <div style={styles.label}>{title}</div>
      <div style={styles.metricValue}>{value}</div>
      <div style={styles.muted}>{sub}</div>
    </div>
  );
}

function Flow({ text }) {
  return <div style={styles.flowBox}>{text}</div>;
}

function Arrow() {
  return <div style={styles.arrow}>→</div>;
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 85% 0%,#113f30 0%,#071812 35%,#020706 78%)",
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
    maxWidth: 760,
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

  clientPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 18,
    padding: 24,
    borderRadius: 18,
    border: "1px solid #183d2f",
    background: "rgba(5,26,18,.9)",
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

  itemValue: {
    fontSize: 18,
    fontWeight: 900,
    marginBottom: 7,
  },

  muted: {
    color: "#89a497",
    fontSize: 13,
    lineHeight: 1.6,
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
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: 16,
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
    marginTop: 22,
    padding: "13px 20px",
    border: 0,
    borderRadius: 10,
    background: "#4cea9d",
    color: "#03110a",
    fontWeight: 900,
    cursor: "pointer",
  },

  riskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  riskCard: {
    padding: 22,
    borderRadius: 17,
    border: "1px solid #194734",
    background: "linear-gradient(145deg,#08231a,#050e0b)",
  },

  riskValue: {
    fontSize: 20,
    fontWeight: 900,
    marginTop: 15,
  },

  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  metric: {
    minHeight: 140,
    padding: 22,
    borderRadius: 17,
    border: "1px solid #183e2e",
    background: "#06140f",
  },

  metricValue: {
    fontSize: 20,
    fontWeight: 900,
    margin: "14px 0 9px",
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
