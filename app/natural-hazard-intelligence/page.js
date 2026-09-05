"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const initialForm = {
  location_name: "",
  country: "",
  latitude: "",
  longitude: "",

  flood_risk: "",
  heatwave_risk: "",
  drought_risk: "",
  storm_risk: "",
  coastal_flood_risk: "",
  wildfire_risk: "",
  extreme_cold_risk: "",

  earthquake_risk: "",
  tsunami_risk: "",
  landslide_risk: "",
  volcanic_risk: "",

  business_impact: "",
  financial_exposure_gbp: "",
  resilience_priority: "",
  resilience_action: "",

  evidence_source: "",
  evidence_reference: "",
  evidence_date: "",
  notes: "",
};

export default function NaturalHazardIntelligencePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [client, setClient] = useState(null);
  const [record, setRecord] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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

    const { data: clientData, error: clientError } =
      await supabase
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

    const { data: hazardData, error: hazardError } =
      await supabase
        .from("natural_hazard_intelligence")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (hazardError) {
      setError(hazardError.message);
      setLoading(false);
      return;
    }

    if (hazardData) {
      setRecord(hazardData);

      setForm({
        location_name: hazardData.location_name || "",
        country: hazardData.country || "",
        latitude: hazardData.latitude ?? "",
        longitude: hazardData.longitude ?? "",

        flood_risk: hazardData.flood_risk || "",
        heatwave_risk: hazardData.heatwave_risk || "",
        drought_risk: hazardData.drought_risk || "",
        storm_risk: hazardData.storm_risk || "",
        coastal_flood_risk:
          hazardData.coastal_flood_risk || "",
        wildfire_risk: hazardData.wildfire_risk || "",
        extreme_cold_risk:
          hazardData.extreme_cold_risk || "",

        earthquake_risk:
          hazardData.earthquake_risk || "",
        tsunami_risk: hazardData.tsunami_risk || "",
        landslide_risk:
          hazardData.landslide_risk || "",
        volcanic_risk:
          hazardData.volcanic_risk || "",

        business_impact:
          hazardData.business_impact || "",

        financial_exposure_gbp:
          hazardData.financial_exposure_gbp ?? "",

        resilience_priority:
          hazardData.resilience_priority || "",

        resilience_action:
          hazardData.resilience_action || "",

        evidence_source:
          hazardData.evidence_source || "",

        evidence_reference:
          hazardData.evidence_reference || "",

        evidence_date:
          hazardData.evidence_date || "",

        notes: hazardData.notes || "",
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

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }

  const hazardCompleteness = useMemo(() => {
    const hazards = [
      form.flood_risk,
      form.heatwave_risk,
      form.drought_risk,
      form.storm_risk,
      form.coastal_flood_risk,
      form.wildfire_risk,
      form.extreme_cold_risk,
      form.earthquake_risk,
      form.tsunami_risk,
      form.landslide_risk,
      form.volcanic_risk,
    ];

    const completed = hazards.filter(
      (value) => value !== ""
    ).length;

    return Math.round(
      (completed / hazards.length) * 100
    );
  }, [form]);

  const highestRisk = useMemo(() => {
    const risks = [
      form.flood_risk,
      form.heatwave_risk,
      form.drought_risk,
      form.storm_risk,
      form.coastal_flood_risk,
      form.wildfire_risk,
      form.extreme_cold_risk,
      form.earthquake_risk,
      form.tsunami_risk,
      form.landslide_risk,
      form.volcanic_risk,
    ];

    if (risks.includes("severe")) return "Severe";
    if (risks.includes("high")) return "High";
    if (risks.includes("moderate")) return "Moderate";
    if (risks.includes("low")) return "Low";

    return "Awaiting evidence";
  }, [form]);

  async function saveAssessment() {
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
      country: form.country || null,

      latitude: numberOrNull(form.latitude),
      longitude: numberOrNull(form.longitude),

      flood_risk: form.flood_risk || null,
      heatwave_risk: form.heatwave_risk || null,
      drought_risk: form.drought_risk || null,
      storm_risk: form.storm_risk || null,

      coastal_flood_risk:
        form.coastal_flood_risk || null,

      wildfire_risk:
        form.wildfire_risk || null,

      extreme_cold_risk:
        form.extreme_cold_risk || null,

      earthquake_risk:
        form.earthquake_risk || null,

      tsunami_risk:
        form.tsunami_risk || null,

      landslide_risk:
        form.landslide_risk || null,

      volcanic_risk:
        form.volcanic_risk || null,

      business_impact:
        form.business_impact || null,

      financial_exposure_gbp:
        numberOrNull(form.financial_exposure_gbp),

      resilience_priority:
        form.resilience_priority || null,

      resilience_action:
        form.resilience_action || null,

      evidence_source:
        form.evidence_source || null,

      evidence_reference:
        form.evidence_reference || null,

      evidence_date:
        form.evidence_date || null,

      notes: form.notes || null,

      hazard_completeness:
        hazardCompleteness,

      highest_recorded_risk:
        highestRisk === "Awaiting evidence"
          ? null
          : highestRisk.toLowerCase(),

      assessment_status:
        hazardCompleteness === 100
          ? "evidence_complete"
          : "partial",

      methodology_version:
        "NT-NHI-v1",

      updated_at:
        new Date().toISOString(),
    };

    let result;

    if (record?.id) {
      result = await supabase
        .from("natural_hazard_intelligence")
        .update(payload)
        .eq("id", record.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("natural_hazard_intelligence")
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
      "Natural hazard assessment saved successfully."
    );

    setSaving(false);
  }

  function display(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Awaiting evidence";
    }

    return String(value);
  }

  function money(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Awaiting evidence";
    }

    return `£${Number(value).toLocaleString()}`;
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Natural Hazard Intelligence</h2>
        <p>Loading hazard evidence...</p>
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
              N&T NATURAL HAZARD INTELLIGENCE ENGINE
            </div>

            <h1 style={styles.title}>
              Natural Hazard Intelligence
            </h1>

            <p style={styles.subtitle}>
              Connect geography with climate-related
              and geophysical hazards, business
              disruption, financial exposure and
              resilience evidence without treating
              every natural hazard as climate change.
            </p>
          </div>

          <div style={styles.badge}>
            DAY 15 • HAZARD ENGINE
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
            label="HAZARD EVIDENCE"
            value={`${hazardCompleteness}%`}
            sub="Hazards with recorded evidence"
          />

          <Summary
            label="HIGHEST RECORDED RISK"
            value={highestRisk}
            sub="Highest entered hazard classification"
          />

          <Summary
            label="METHODOLOGY"
            value="NT-NHI-v1"
            sub="Evidence-first hazard intelligence"
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

        <Section title="CLIMATE-RELATED NATURAL HAZARDS">
          <p style={styles.sectionNote}>
            These hazards may be influenced by climate
            variability or climate change. Classification
            should be supported by appropriate evidence.
          </p>

          <div style={styles.hazardGrid}>
            <HazardSelect
              label="Flood"
              value={form.flood_risk}
              onChange={(v) =>
                change("flood_risk", v)
              }
            />

            <HazardSelect
              label="Heatwave"
              value={form.heatwave_risk}
              onChange={(v) =>
                change("heatwave_risk", v)
              }
            />

            <HazardSelect
              label="Drought / Water Stress"
              value={form.drought_risk}
              onChange={(v) =>
                change("drought_risk", v)
              }
            />

            <HazardSelect
              label="Storm / Severe Wind"
              value={form.storm_risk}
              onChange={(v) =>
                change("storm_risk", v)
              }
            />

            <HazardSelect
              label="Coastal Flood / Storm Surge"
              value={form.coastal_flood_risk}
              onChange={(v) =>
                change("coastal_flood_risk", v)
              }
            />

            <HazardSelect
              label="Wildfire"
              value={form.wildfire_risk}
              onChange={(v) =>
                change("wildfire_risk", v)
              }
            />

            <HazardSelect
              label="Extreme Cold / Severe Snow"
              value={form.extreme_cold_risk}
              onChange={(v) =>
                change("extreme_cold_risk", v)
              }
            />
          </div>
        </Section>

        <Section title="GEOPHYSICAL NATURAL HAZARDS">
          <p style={styles.sectionNote}>
            These hazards are kept separate from the
            climate-risk category. Their presence does
            not imply a climate-change cause.
          </p>

          <div style={styles.hazardGrid}>
            <HazardSelect
              label="Earthquake"
              value={form.earthquake_risk}
              onChange={(v) =>
                change("earthquake_risk", v)
              }
            />

            <HazardSelect
              label="Tsunami"
              value={form.tsunami_risk}
              onChange={(v) =>
                change("tsunami_risk", v)
              }
            />

            <HazardSelect
              label="Landslide"
              value={form.landslide_risk}
              onChange={(v) =>
                change("landslide_risk", v)
              }
            />

            <HazardSelect
              label="Volcanic Hazard"
              value={form.volcanic_risk}
              onChange={(v) =>
                change("volcanic_risk", v)
              }
            />
          </div>
        </Section>

        <Section title="BUSINESS + FINANCIAL EXPOSURE">
          <div style={styles.formGrid}>
            <Input
              label="Business Impact"
              value={form.business_impact}
              onChange={(v) =>
                change("business_impact", v)
              }
              placeholder="Operational disruption, asset damage..."
            />

            <NumberInput
              label="Financial Exposure (£)"
              value={form.financial_exposure_gbp}
              onChange={(v) =>
                change(
                  "financial_exposure_gbp",
                  v
                )
              }
              placeholder="Verified exposure"
            />

            <PrioritySelect
              label="Resilience Priority"
              value={form.resilience_priority}
              onChange={(v) =>
                change(
                  "resilience_priority",
                  v
                )
              }
            />

            <Input
              label="Resilience Action"
              value={form.resilience_action}
              onChange={(v) =>
                change(
                  "resilience_action",
                  v
                )
              }
              placeholder="Protection, adaptation, continuity action..."
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
              placeholder="Government dataset, scientific source..."
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
              placeholder="Dataset, report or assessment reference"
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
              placeholder="Evidence and methodology notes"
            />
          </div>
        </Section>

        <button
          style={styles.save}
          onClick={saveAssessment}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Natural Hazard Assessment"}
        </button>

        <Section title="NATURAL HAZARD MATRIX">
          <div style={styles.matrixGrid}>
            <Card
              title="Flood"
              value={display(record?.flood_risk)}
              sub="Climate-related hazard"
            />

            <Card
              title="Heatwave"
              value={display(record?.heatwave_risk)}
              sub="Climate-related hazard"
            />

            <Card
              title="Drought"
              value={display(record?.drought_risk)}
              sub="Climate-related hazard"
            />

            <Card
              title="Storm"
              value={display(record?.storm_risk)}
              sub="Climate-related hazard"
            />

            <Card
              title="Wildfire"
              value={display(record?.wildfire_risk)}
              sub="Climate-related hazard"
            />

            <Card
              title="Earthquake"
              value={display(record?.earthquake_risk)}
              sub="Geophysical hazard"
            />

            <Card
              title="Tsunami"
              value={display(record?.tsunami_risk)}
              sub="Geophysical hazard"
            />

            <Card
              title="Landslide"
              value={display(record?.landslide_risk)}
              sub="Natural hazard"
            />

            <Card
              title="Volcanic"
              value={display(record?.volcanic_risk)}
              sub="Geophysical hazard"
            />

            <Card
              title="Financial Exposure"
              value={money(
                record?.financial_exposure_gbp
              )}
              sub="Recorded hazard-linked exposure"
            />
          </div>
        </Section>

        <section style={styles.flowPanel}>
          <div style={styles.eyebrow}>
            N&T NATURAL HAZARD DECISION FLOW
          </div>

          <h2 style={styles.flowTitle}>
            Geography → Hazard Evidence → Asset
            Exposure → Business Impact → Financial
            Exposure → Resilience
          </h2>

          <div style={styles.flow}>
            <Flow text="Geography" />
            <Arrow />

            <Flow text="Natural Hazards" />
            <Arrow />

            <Flow text="Asset Exposure" />
            <Arrow />

            <Flow text="Business Impact" />
            <Arrow />

            <Flow text="Financial Exposure" />
            <Arrow />

            <Flow text="Resilience" />
          </div>
        </section>

        <section style={styles.splitPanel}>
          <div style={styles.splitCard}>
            <div style={styles.eyebrow}>
              CLIMATE-RELATED
            </div>

            <h3>
              Climate & Weather Hazards
            </h3>

            <p style={styles.muted}>
              Flood, heatwave, drought, severe
              storms, coastal flooding, wildfire
              and extreme temperature events can
              be assessed alongside climate data.
            </p>
          </div>

          <div style={styles.splitCard}>
            <div style={styles.eyebrow}>
              GEOPHYSICAL
            </div>

            <h3>
              Earth-System Hazards
            </h3>

            <p style={styles.muted}>
              Earthquakes, tsunamis and volcanic
              hazards are evaluated separately
              and are not labelled as consequences
              of climate change.
            </p>
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>
            ✓
          </div>

          <div>
            <h3 style={{ margin: 0 }}>
              Natural Hazard Evidence Integrity
            </h3>

            <p style={styles.muted}>
              N&T records hazard classifications
              only when supporting evidence is
              available. Missing evidence remains
              missing. The highest recorded risk
              represents the highest user-entered,
              evidence-supported classification;
              it is not an official government or
              scientific hazard rating.
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
        min="0"
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

function HazardSelect({
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

function PrioritySelect({
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
          Awaiting assessment
        </option>

        <option value="low">
          Low
        </option>

        <option value="medium">
          Medium
        </option>

        <option value="high">
          High
        </option>

        <option value="urgent">
          Urgent
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
      "radial-gradient(circle at 85% 0%, #123d2e 0%, #061710 36%, #020706 80%)",
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
    maxWidth: 820,
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
      "repeat(auto-fit,minmax(190px,1fr))",
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
    textTransform: "capitalize",
  },

  sectionTitle: {
    margin: "38px 0 15px",
    color: "#70eeb2",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.8,
  },

  sectionNote: {
    color: "#89a497",
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: -5,
    marginBottom: 18,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",
    gap: 16,
  },

  hazardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(230px,1fr))",
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
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: 15,
  },

  card: {
    minHeight: 125,
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

  splitPanel: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",
    gap: 16,
    marginTop: 22,
  },

  splitCard: {
    padding: 25,
    borderRadius: 18,
    border: "1px solid #1e4b38",
    background: "#06140f",
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
