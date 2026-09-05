"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const YEARS = [2030, 2040, 2050];

export default function FutureClimateIntelligencePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);

  const [geo, setGeo] = useState(null);
  const [climate, setClimate] = useState(null);
  const [hazards, setHazards] = useState(null);
  const [projections, setProjections] = useState([]);

  const [selectedYear, setSelectedYear] = useState(2030);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    const [
      geoResult,
      climateResult,
      hazardResult,
      projectionResult,
    ] = await Promise.all([
      supabase
        .from("geospatial_intelligence")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("climate_data_intelligence")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("natural_hazard_intelligence")
        .select("*")
        .eq("client_id", clientData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("future_climate_projections")
        .select("*")
        .eq("client_id", clientData.id)
        .order("projection_year", { ascending: true }),
    ]);

    if (geoResult.data) setGeo(geoResult.data);
    if (climateResult.data) setClimate(climateResult.data);
    if (hazardResult.data) setHazards(hazardResult.data);

    if (
      projectionResult.error &&
      !projectionResult.error.message
        .toLowerCase()
        .includes("does not exist")
    ) {
      setError(projectionResult.error.message);
    }

    setProjections(projectionResult.data || []);
    setLoading(false);
  }

  const currentProjection = useMemo(() => {
    return (
      projections.find(
        (item) =>
          Number(item.projection_year) ===
          Number(selectedYear)
      ) || null
    );
  }, [projections, selectedYear]);

  const location =
    geo?.location_name ||
    climate?.location_name ||
    hazards?.location_name ||
    "Awaiting location";

  const country =
    geo?.country ||
    climate?.country ||
    hazards?.country ||
    "Awaiting country";

  const latitude =
    geo?.latitude ??
    climate?.latitude ??
    hazards?.latitude ??
    null;

  const longitude =
    geo?.longitude ??
    climate?.longitude ??
    hazards?.longitude ??
    null;

  const autoDataReady =
    latitude !== null && longitude !== null;

  const climateEvidenceReady =
    Number(climate?.data_completeness || 0) > 0;

  const projectionReady =
    currentProjection !== null;

  function valueOrAwaiting(value, suffix = "") {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Awaiting verified data";
    }

    return `${value}${suffix}`;
  }

  function riskValue(value) {
    if (!value) return "Awaiting projection";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function money(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Awaiting assessment";
    }

    return `£${Number(value).toLocaleString()}`;
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Future Climate Intelligence</h2>
        <p>Loading climate intelligence...</p>
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
              N&T FUTURE CLIMATE INTELLIGENCE ENGINE
            </div>

            <h1 style={styles.title}>
              Future Climate Intelligence
            </h1>

            <p style={styles.subtitle}>
              Location-based climate intelligence
              architecture connecting verified
              geographic evidence with future climate
              scenarios, natural hazards, business
              disruption, financial exposure and
              resilience planning.
            </p>
          </div>

          <div style={styles.badge}>
            DAY 16 • FUTURE ENGINE
          </div>
        </header>

        {error && (
          <div style={styles.error}>
            {error}
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
            value={location}
            sub={country}
          />

          <Summary
            label="AUTOMATIC DATA"
            value={
              autoDataReady
                ? "LOCATION READY"
                : "AWAITING LOCATION"
            }
            sub="Coordinate foundation"
          />

          <Summary
            label="CLIMATE EVIDENCE"
            value={`${Number(
              climate?.data_completeness || 0
            )}%`}
            sub="Verified climate inputs"
          />

          <Summary
            label="METHODOLOGY"
            value="NT-FCI-v1"
            sub="Scenario intelligence framework"
          />
        </section>

        <Section title="AUTOMATIC LOCATION FOUNDATION">
          <div style={styles.infoGrid}>
            <InfoCard
              label="Location"
              value={location}
            />

            <InfoCard
              label="Country"
              value={country}
            />

            <InfoCard
              label="Latitude"
              value={valueOrAwaiting(latitude)}
            />

            <InfoCard
              label="Longitude"
              value={valueOrAwaiting(longitude)}
            />
          </div>

          <div style={styles.statusPanel}>
            <StatusDot active={autoDataReady} />

            <div>
              <strong>
                Automatic Data Foundation
              </strong>

              <p style={styles.muted}>
                {autoDataReady
                  ? "Coordinates are available. The platform is ready for connection to approved climate and hazard data services."
                  : "Save a verified location and coordinates in Geospatial Intelligence before automatic location-based retrieval can operate."}
              </p>
            </div>
          </div>
        </Section>

        <Section title="FUTURE SCENARIO HORIZON">
          <div style={styles.yearButtons}>
            {YEARS.map((year) => (
              <button
                key={year}
                style={{
                  ...styles.yearButton,
                  ...(selectedYear === year
                    ? styles.yearButtonActive
                    : {}),
                }}
                onClick={() =>
                  setSelectedYear(year)
                }
              >
                {year}
              </button>
            ))}
          </div>

          <div style={styles.scenarioHero}>
            <div>
              <div style={styles.eyebrow}>
                SELECTED PROJECTION
              </div>

              <h2 style={styles.scenarioYear}>
                {selectedYear}
              </h2>
            </div>

            <div>
              <div style={styles.label}>
                DATA STATUS
              </div>

              <div style={styles.bigValue}>
                {projectionReady
                  ? "VERIFIED PROJECTION AVAILABLE"
                  : "AWAITING VERIFIED PROJECTION DATA"}
              </div>
            </div>
          </div>
        </Section>

        <Section title="CLIMATE PROJECTION">
          <div style={styles.metricGrid}>
            <Metric
              title="Mean Temperature"
              value={valueOrAwaiting(
                currentProjection?.projected_mean_temperature_c,
                "°C"
              )}
              sub={`${selectedYear} scenario`}
            />

            <Metric
              title="Temperature Change"
              value={valueOrAwaiting(
                currentProjection?.temperature_change_c,
                "°C"
              )}
              sub="Relative to recorded baseline"
            />

            <Metric
              title="Annual Precipitation"
              value={valueOrAwaiting(
                currentProjection?.projected_annual_precipitation_mm,
                " mm"
              )}
              sub="Scenario projection"
            />

            <Metric
              title="Hot Days"
              value={valueOrAwaiting(
                currentProjection?.projected_hot_days_per_year,
                " days/year"
              )}
              sub="Future heat exposure"
            />

            <Metric
              title="Heavy Rain Days"
              value={valueOrAwaiting(
                currentProjection?.projected_heavy_rain_days_per_year,
                " days/year"
              )}
              sub="Future rainfall exposure"
            />

            <Metric
              title="Dry Days"
              value={valueOrAwaiting(
                currentProjection?.projected_dry_days_per_year,
                " days/year"
              )}
              sub="Future drought indicator"
            />
          </div>
        </Section>

        <Section title="FUTURE NATURAL HAZARD OUTLOOK">
          <div style={styles.metricGrid}>
            <RiskCard
              title="Flood"
              value={riskValue(
                currentProjection?.flood_projection
              )}
            />

            <RiskCard
              title="Extreme Heat"
              value={riskValue(
                currentProjection?.heat_projection
              )}
            />

            <RiskCard
              title="Drought / Water Stress"
              value={riskValue(
                currentProjection?.drought_projection
              )}
            />

            <RiskCard
              title="Storm / Severe Wind"
              value={riskValue(
                currentProjection?.storm_projection
              )}
            />

            <RiskCard
              title="Wildfire"
              value={riskValue(
                currentProjection?.wildfire_projection
              )}
            />

            <RiskCard
              title="Coastal Hazard"
              value={riskValue(
                currentProjection?.coastal_projection
              )}
            />
          </div>
        </Section>

        <Section title="BUSINESS + FINANCIAL FUTURE EXPOSURE">
          <div style={styles.metricGrid}>
            <Metric
              title="Business Impact"
              value={
                currentProjection?.business_impact ||
                "Awaiting scenario assessment"
              }
              sub={`${selectedYear} scenario`}
            />

            <Metric
              title="Financial Exposure"
              value={money(
                currentProjection?.financial_exposure_gbp
              )}
              sub="Scenario-linked estimate"
            />

            <Metric
              title="Resilience Priority"
              value={riskValue(
                currentProjection?.resilience_priority
              )}
              sub="Future adaptation priority"
            />

            <Metric
              title="Recommended Action"
              value={
                currentProjection?.recommended_action ||
                "Awaiting evidence"
              }
              sub="Evidence-linked action"
            />
          </div>
        </Section>

        <Section title="SCENARIO + EVIDENCE PROVENANCE">
          <div style={styles.infoGrid}>
            <InfoCard
              label="Projection Scenario"
              value={
                currentProjection?.scenario_name ||
                "Awaiting scenario"
              }
            />

            <InfoCard
              label="Baseline Period"
              value={
                currentProjection?.baseline_period ||
                climate?.baseline_period ||
                "Awaiting evidence"
              }
            />

            <InfoCard
              label="Data Source"
              value={
                currentProjection?.evidence_source ||
                "Awaiting verified source"
              }
            />

            <InfoCard
              label="Source Reference"
              value={
                currentProjection?.evidence_reference ||
                "Awaiting reference"
              }
            />

            <InfoCard
              label="Projection Year"
              value={selectedYear}
            />

            <InfoCard
              label="Data Quality"
              value={
                currentProjection?.data_quality ||
                "Awaiting assessment"
              }
            />
          </div>
        </Section>

        <section style={styles.flowPanel}>
          <div style={styles.eyebrow}>
            N&T FUTURE INTELLIGENCE FLOW
          </div>

          <h2 style={styles.flowTitle}>
            Location → Climate Data → Future Scenario
            → Natural Hazards → Business Impact →
            Financial Exposure → Resilience
          </h2>

          <div style={styles.flow}>
            <Flow text="Location" />
            <Arrow />
            <Flow text="Climate Data" />
            <Arrow />
            <Flow text="2030 / 2040 / 2050" />
            <Arrow />
            <Flow text="Hazards" />
            <Arrow />
            <Flow text="Business Impact" />
            <Arrow />
            <Flow text="Financial Exposure" />
            <Arrow />
            <Flow text="Action" />
          </div>
        </section>

        <section style={styles.splitGrid}>
          <div style={styles.splitCard}>
            <div style={styles.eyebrow}>
              OBSERVATION
            </div>

            <h3>
              Current Evidence
            </h3>

            <p style={styles.muted}>
              Current climate observations,
              geographic evidence and natural hazard
              records remain separate from future
              climate scenarios.
            </p>

            <strong>
              Climate evidence completeness:{" "}
              {Number(
                climate?.data_completeness || 0
              )}
              %
            </strong>
          </div>

          <div style={styles.splitCard}>
            <div style={styles.eyebrow}>
              PROJECTION
            </div>

            <h3>
              Future Scenario
            </h3>

            <p style={styles.muted}>
              2030, 2040 and 2050 values are treated
              as projections based on an identified
              dataset and scenario, not guaranteed
              future events.
            </p>

            <strong>
              Selected horizon: {selectedYear}
            </strong>
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>
            ✓
          </div>

          <div>
            <h3 style={{ margin: 0 }}>
              Future Prediction Integrity
            </h3>

            <p style={styles.muted}>
              N&T does not manufacture future climate
              values. A projection appears only when
              a verified source, scenario and time
              horizon are recorded. Missing
              projections remain clearly identified
              as awaiting data.
            </p>
          </div>
        </section>

        <section style={styles.autoPanel}>
          <div>
            <div style={styles.eyebrow}>
              AUTOMATION ROADMAP
            </div>

            <h2 style={styles.autoTitle}>
              Automatic location-based intelligence
            </h2>

            <p style={styles.muted}>
              The engine is structured so approved
              climate APIs and geospatial datasets
              can populate future scenarios
              automatically. The database keeps
              source, scenario, baseline and data
              quality alongside each projection.
            </p>
          </div>

          <div style={styles.statusColumn}>
            <AutoStatus
              name="Location Detection"
              active={autoDataReady}
            />

            <AutoStatus
              name="Current Climate Evidence"
              active={climateEvidenceReady}
            />

            <AutoStatus
              name={`${selectedYear} Projection`}
              active={projectionReady}
            />
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

function Summary({ label, value, sub }) {
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

function InfoCard({ label, value }) {
  return (
    <div style={styles.infoCard}>
      <div style={styles.label}>
        {label}
      </div>

      <div style={styles.infoValue}>
        {value}
      </div>
    </div>
  );
}

function Metric({ title, value, sub }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.label}>
        {title}
      </div>

      <div style={styles.metricValue}>
        {value}
      </div>

      <div style={styles.muted}>
        {sub}
      </div>
    </div>
  );
}

function RiskCard({ title, value }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.label}>
        {title}
      </div>

      <div style={styles.riskValue}>
        {value}
      </div>

      <div style={styles.muted}>
        Future scenario hazard outlook
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

function StatusDot({ active }) {
  return (
    <div
      style={{
        ...styles.statusDot,
        opacity: active ? 1 : 0.4,
      }}
    >
      {active ? "✓" : "•"}
    </div>
  );
}

function AutoStatus({ name, active }) {
  return (
    <div style={styles.autoStatus}>
      <StatusDot active={active} />

      <div>
        <strong>{name}</strong>

        <div style={styles.muted}>
          {active
            ? "Ready"
            : "Awaiting verified data"}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 85% 0%, #123c32 0%, #051711 35%, #020706 82%)",
    color: "#f5fff9",
    fontFamily: "Arial, sans-serif",
    padding: "35px 20px 80px",
  },

  loading: {
    minHeight: "100vh",
    background: "#020706",
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#68efae",
    cursor: "pointer",
    marginBottom: 30,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 30,
    flexWrap: "wrap",
    marginBottom: 30,
  },

  eyebrow: {
    color: "#56eca6",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.7,
  },

  title: {
    fontSize: "clamp(40px,6vw,70px)",
    lineHeight: 1,
    letterSpacing: -2,
    margin: "12px 0 18px",
  },

  subtitle: {
    maxWidth: 850,
    color: "#99b3a7",
    lineHeight: 1.7,
  },

  badge: {
    height: "fit-content",
    padding: "10px 16px",
    border: "1px solid #28704e",
    borderRadius: 30,
    color: "#65efad",
    fontWeight: 900,
    fontSize: 12,
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
  },

  sectionTitle: {
    margin: "38px 0 15px",
    color: "#70eeb2",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.8,
  },

  label: {
    color: "#67ecad",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.25,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  muted: {
    color: "#8da89b",
    fontSize: 13,
    lineHeight: 1.6,
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  infoCard: {
    padding: 20,
    border: "1px solid #1b4936",
    borderRadius: 15,
    background: "#06140f",
  },

  infoValue: {
    fontWeight: 900,
    fontSize: 17,
  },

  statusPanel: {
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginTop: 16,
    padding: 18,
    border: "1px solid #1c5039",
    borderRadius: 14,
    background: "rgba(17,69,47,.2)",
  },

  statusDot: {
    minWidth: 34,
    height: 34,
    borderRadius: "50%",
    background: "#4bea9c",
    color: "#021109",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  yearButtons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  yearButton: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid #245a41",
    background: "#06140f",
    color: "#9db5aa",
    fontWeight: 900,
    cursor: "pointer",
  },

  yearButtonActive: {
    background: "#4bea9c",
    color: "#021109",
    border: "1px solid #4bea9c",
  },

  scenarioHero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 25,
    padding: 26,
    borderRadius: 18,
    border: "1px solid #225b40",
    background:
      "linear-gradient(120deg,rgba(12,66,45,.75),rgba(4,17,12,.95))",
  },

  scenarioYear: {
    fontSize: 55,
    margin: "7px 0 0",
  },

  bigValue: {
    fontWeight: 900,
    fontSize: 17,
    color: "#dffff0",
  },

  metricGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  metricCard: {
    minHeight: 125,
    padding: 22,
    borderRadius: 17,
    border: "1px solid #183e2e",
    background: "#06140f",
  },

  metricValue: {
    fontSize: 19,
    fontWeight: 900,
    margin: "15px 0 8px",
  },

  riskValue: {
    fontSize: 18,
    fontWeight: 900,
    margin: "15px 0 8px",
    textTransform: "capitalize",
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
    fontSize: 27,
    margin: "10px 0 23px",
    lineHeight: 1.35,
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

  splitGrid: {
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

  autoPanel: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",
    gap: 30,
    marginTop: 22,
    padding: 28,
    borderRadius: 18,
    border: "1px solid #245c43",
    background:
      "linear-gradient(140deg,#071a13,#09271c)",
  },

  autoTitle: {
    margin: "9px 0",
    fontSize: 28,
  },

  statusColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 13,
  },

  autoStatus: {
    display: "flex",
    gap: 13,
    alignItems: "center",
    padding: 13,
    borderRadius: 12,
    background: "rgba(0,0,0,.22)",
  },

  error: {
    padding: 15,
    marginBottom: 20,
    border: "1px solid #914343",
    background: "rgba(130,30,30,.2)",
    borderRadius: 10,
  },
};
