"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function ProjectAssessmentPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [client, setClient] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    project_name: "",
    project_type: "",
    project_cost_gbp: "",
    expected_annual_energy_saving_kwh: "",
    expected_annual_renewable_generation_kwh: "",
    expected_annual_carbon_reduction_kg: "",
    expected_annual_financial_saving_gbp: "",
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

    const { data: assessmentData, error: assessmentError } = await supabase
      .from("project_assessments")
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

    if (assessmentData) {
      setAssessment(assessmentData);

      setForm({
        project_name: assessmentData.project_name || "",
        project_type: assessmentData.project_type || "",
        project_cost_gbp: assessmentData.project_cost_gbp ?? "",
        expected_annual_energy_saving_kwh:
          assessmentData.expected_annual_energy_saving_kwh ?? "",
        expected_annual_renewable_generation_kwh:
          assessmentData.expected_annual_renewable_generation_kwh ?? "",
        expected_annual_carbon_reduction_kg:
          assessmentData.expected_annual_carbon_reduction_kg ?? "",
        expected_annual_financial_saving_gbp:
          assessmentData.expected_annual_financial_saving_gbp ?? "",
        evidence_source: assessmentData.evidence_source || "",
        evidence_reference: assessmentData.evidence_reference || "",
        evidence_date: assessmentData.evidence_date || "",
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

  function nullableNumber(value) {
    if (value === "") return null;

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }

  async function saveAssessment() {
    if (!client) return;

    setSaving(true);
    setMessage("");
    setError("");

    if (!form.project_name.trim()) {
      setError("Project name is required.");
      setSaving(false);
      return;
    }

    const payload = {
      client_id: client.id,
      project_name: form.project_name.trim(),
      project_type: form.project_type || null,

      project_cost_gbp: nullableNumber(form.project_cost_gbp),

      expected_annual_energy_saving_kwh: nullableNumber(
        form.expected_annual_energy_saving_kwh
      ),

      expected_annual_renewable_generation_kwh: nullableNumber(
        form.expected_annual_renewable_generation_kwh
      ),

      expected_annual_carbon_reduction_kg: nullableNumber(
        form.expected_annual_carbon_reduction_kg
      ),

      expected_annual_financial_saving_gbp: nullableNumber(
        form.expected_annual_financial_saving_gbp
      ),

      evidence_source: form.evidence_source || null,
      evidence_reference: form.evidence_reference || null,
      evidence_date: form.evidence_date || null,

      assessment_status: "draft",
      methodology_version: "NT-PAE-v1",
    };

    let result;

    if (assessment?.id) {
      result = await supabase
        .from("project_assessments")
        .update(payload)
        .eq("id", assessment.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("project_assessments")
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
    setMessage("Assessment saved successfully.");
    setSaving(false);

    await loadAssessment();
  }

  function money(value) {
    if (value === null || value === undefined) return "Awaiting data";

    return `£${Number(value).toLocaleString()}`;
  }

  function metric(value, suffix = "") {
    if (value === null || value === undefined) return "Awaiting data";

    return `${Number(value).toLocaleString()}${suffix}`;
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Project Assessment Engine</h2>
        <p>Loading assessment...</p>
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
              N&T PROJECT ASSESSMENT + EVIDENCE ENGINE
            </div>

            <h1 style={styles.title}>Project Assessment</h1>

            <p style={styles.subtitle}>
              Record verified project inputs, retain evidence and calculate
              financial outcomes without inventing sustainability results.
            </p>
          </div>

          <div style={styles.badge}>DAY 11 • EVIDENCE ENGINE</div>
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
            title="ASSESSMENT STATUS"
            value={assessment?.assessment_status || "draft"}
            sub="Project evidence workflow"
          />

          <Item
            title="METHODOLOGY"
            value={assessment?.methodology_version || "NT-PAE-v1"}
            sub="Evidence-first assessment"
          />

          <Item
            title="PAYBACK"
            value={
              assessment?.calculated_payback_years !== null &&
              assessment?.calculated_payback_years !== undefined
                ? `${assessment.calculated_payback_years} years`
                : "Awaiting valid inputs"
            }
            sub="Automatically calculated"
          />
        </section>

        <div style={styles.sectionTitle}>PROJECT INPUTS</div>

        <section style={styles.formGrid}>
          <Field
            label="Project Name"
            value={form.project_name}
            onChange={(value) => updateField("project_name", value)}
            placeholder="Example: Solar PV Installation"
          />

          <div>
            <label style={styles.label}>Project Type</label>

            <select
              style={styles.input}
              value={form.project_type}
              onChange={(e) => updateField("project_type", e.target.value)}
            >
              <option value="">Select project type</option>
              <option value="solar">Solar</option>
              <option value="wind">Wind</option>
              <option value="energy-efficiency">Energy Efficiency</option>
              <option value="clean-electricity">Clean Electricity</option>
              <option value="renewable-energy">Renewable Energy</option>
              <option value="transition-project">Transition Project</option>
              <option value="other">Other</option>
            </select>
          </div>

          <NumberField
            label="Project Cost (£)"
            value={form.project_cost_gbp}
            onChange={(value) => updateField("project_cost_gbp", value)}
          />

          <NumberField
            label="Annual Financial Saving (£)"
            value={form.expected_annual_financial_saving_gbp}
            onChange={(value) =>
              updateField("expected_annual_financial_saving_gbp", value)
            }
          />

          <NumberField
            label="Annual Energy Saving (kWh)"
            value={form.expected_annual_energy_saving_kwh}
            onChange={(value) =>
              updateField("expected_annual_energy_saving_kwh", value)
            }
          />

          <NumberField
            label="Renewable Generation (kWh)"
            value={form.expected_annual_renewable_generation_kwh}
            onChange={(value) =>
              updateField("expected_annual_renewable_generation_kwh", value)
            }
          />

          <NumberField
            label="Annual Carbon Reduction (kg CO₂e)"
            value={form.expected_annual_carbon_reduction_kg}
            onChange={(value) =>
              updateField("expected_annual_carbon_reduction_kg", value)
            }
          />
        </section>

        <div style={styles.sectionTitle}>EVIDENCE & PROVENANCE</div>

        <section style={styles.formGrid}>
          <Field
            label="Evidence Source"
            value={form.evidence_source}
            onChange={(value) => updateField("evidence_source", value)}
            placeholder="Installer quote, energy audit, supplier report..."
          />

          <Field
            label="Evidence Reference"
            value={form.evidence_reference}
            onChange={(value) => updateField("evidence_reference", value)}
            placeholder="Document ID, URL, report number..."
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
          {saving ? "Saving..." : "Save Assessment Evidence"}
        </button>

        <div style={styles.sectionTitle}>CALCULATED PROJECT INTELLIGENCE</div>

        <section style={styles.metricGrid}>
          <Metric
            title="Project Cost"
            value={money(assessment?.project_cost_gbp)}
            sub="Recorded input"
          />

          <Metric
            title="Annual Saving"
            value={money(assessment?.expected_annual_financial_saving_gbp)}
            sub="Recorded input"
          />

          <Metric
            title="Payback Period"
            value={
              assessment?.calculated_payback_years !== null &&
              assessment?.calculated_payback_years !== undefined
                ? `${assessment.calculated_payback_years} years`
                : "Awaiting data"
            }
            sub="Calculated by database"
          />

          <Metric
            title="Energy Saving"
            value={metric(
              assessment?.expected_annual_energy_saving_kwh,
              " kWh"
            )}
            sub="Recorded evidence"
          />

          <Metric
            title="Renewable Generation"
            value={metric(
              assessment?.expected_annual_renewable_generation_kwh,
              " kWh"
            )}
            sub="Recorded evidence"
          />

          <Metric
            title="Carbon Reduction"
            value={metric(
              assessment?.expected_annual_carbon_reduction_kg,
              " kg CO₂e"
            )}
            sub="Recorded evidence"
          />
        </section>

        <div style={styles.sectionTitle}>GREEN FINANCE READINESS</div>

        <section style={styles.readinessGrid}>
          <Readiness
            title="Green Project"
            value={
              assessment?.green_project_eligibility || "awaiting assessment"
            }
          />

          <Readiness
            title="Green Loan"
            value={
              assessment?.green_loan_eligibility || "awaiting assessment"
            }
          />

          <Readiness
            title="Green Bond"
            value={
              assessment?.green_bond_eligibility || "awaiting assessment"
            }
          />
        </section>

        <section style={styles.flowPanel}>
          <div style={styles.eyebrow}>N&T EVIDENCE FLOW</div>

          <h2 style={styles.flowTitle}>
            Verified Input → Calculation → Eligibility → Finance Decision
          </h2>

          <div style={styles.flow}>
            <Flow text="Client Project" />
            <Arrow />
            <Flow text="Evidence" />
            <Arrow />
            <Flow text="Energy Impact" />
            <Arrow />
            <Flow text="Carbon Impact" />
            <Arrow />
            <Flow text="Financial Payback" />
            <Arrow />
            <Flow text="Green Finance" />
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>✓</div>

          <div>
            <h3 style={{ marginTop: 0 }}>Evidence Integrity Control</h3>

            <p style={styles.muted}>
              N&T calculates payback only when a project cost and valid annual
              financial saving are recorded. Green project, green loan and
              green bond classifications remain separate assessments and are
              not automatically approved from financial inputs alone.
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

function Item({ title, value, sub }) {
  return (
    <div>
      <div style={styles.label}>{title}</div>
      <div style={styles.itemValue}>{value || "—"}</div>
      <div style={styles.muted}>{sub}</div>
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

function Readiness({ title, value }) {
  return (
    <div style={styles.readiness}>
      <div style={styles.label}>{title}</div>
      <div style={styles.readinessValue}>{value}</div>
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
      "radial-gradient(circle at 85% 0%,#123e30 0%,#071812 35%,#020706 78%)",
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
    maxWidth: 720,
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

  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 15,
  },

  metric: {
    minHeight: 130,
    padding: 22,
    borderRadius: 17,
    border: "1px solid #183e2e",
    background: "#06140f",
  },

  metricValue: {
    fontSize: 23,
    fontWeight: 900,
    margin: "14px 0 9px",
  },

  readinessGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 15,
  },

  readiness: {
    padding: 22,
    borderRadius: 17,
    border: "1px solid #194734",
    background:
      "linear-gradient(145deg,#08231a,#050e0b)",
  },

  readinessValue: {
    fontSize: 18,
    fontWeight: 900,
    marginTop: 14,
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
