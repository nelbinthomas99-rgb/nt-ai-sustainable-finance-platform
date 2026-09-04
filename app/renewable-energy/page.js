"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function RenewableEnergyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [carbon, setCarbon] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

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

    const { data: carbonData } = await supabase
      .from("carbon_energy_data")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setCarbon(carbonData || null);

    const { data: renewableData } = await supabase
      .from("renewable_energy_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setAssessment(renewableData || null);
    setLoading(false);
  }

  const value = (v, suffix = "") =>
    v === null || v === undefined || v === ""
      ? "Awaiting assessment"
      : `${v}${suffix}`;

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Renewable Energy Intelligence</h2>
        <p>Loading transition intelligence...</p>
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
              N&T ENERGY TRANSITION INTELLIGENCE
            </div>

            <h1 style={styles.title}>
              Renewable Energy
              <br />
              Intelligence
            </h1>

            <p style={styles.subtitle}>
              Connecting energy consumption, renewable opportunities,
              carbon reduction and sustainable finance.
            </p>
          </div>

          <div style={styles.badge}>DAY 9 • PROTOTYPE ENGINE</div>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.clientPanel}>
          <Item
            title="CLIENT"
            value={client?.client_name}
            sub={client?.client_code}
          />

          <Item
            title="ASSESSMENT STATUS"
            value={assessment?.assessment_status || "Prototype"}
            sub="Renewable transition assessment"
          />

          <Item
            title="METHODOLOGY"
            value={assessment?.methodology_version || "NT-REI-v1"}
            sub="Explainable assessment layer"
          />

          <Item
            title="DATA INTEGRITY"
            value="NO FABRICATED SCORES"
            sub="Missing values remain missing"
          />
        </section>

        <SectionTitle text="CURRENT ENERGY BASELINE" />

        <section style={styles.grid}>
          <Metric
            title="Electricity"
            value={value(carbon?.electricity_kwh, " kWh")}
            sub="Latest recorded client period"
          />

          <Metric
            title="Gas"
            value={value(carbon?.gas_kwh, " kWh")}
            sub="Latest recorded client period"
          />

          <Metric
            title="Business Travel"
            value={value(carbon?.travel_km, " km")}
            sub="Latest recorded client period"
          />

          <Metric
            title="Recorded Carbon"
            value={value(carbon?.carbon_emissions_kg, " kg CO₂e")}
            sub="Existing carbon module"
          />
        </section>

        <SectionTitle text="RENEWABLE OPPORTUNITY ASSESSMENT" />

        <section style={styles.opportunityGrid}>
          <Opportunity
            icon="☀"
            title="Solar Opportunity"
            status={assessment?.solar_status || "AWAITING ASSESSMENT"}
            text="Requires verified site, roof, irradiance and system-design information."
          />

          <Opportunity
            icon="◉"
            title="Wind Opportunity"
            status={assessment?.wind_status || "AWAITING ASSESSMENT"}
            text="Requires verified local wind and site suitability information."
          />

          <Opportunity
            icon="⚡"
            title="Clean Electricity"
            status={
              assessment?.clean_electricity_status || "AWAITING ASSESSMENT"
            }
            text="Assess renewable electricity procurement and energy transition options."
          />

          <Opportunity
            icon="▣"
            title="Energy Efficiency"
            status={
              assessment?.efficiency_status || "AWAITING ASSESSMENT"
            }
            text="Connect energy-efficiency improvements to emissions and financial outcomes."
          />
        </section>

        <SectionTitle text="TRANSITION FINANCIAL INTELLIGENCE" />

        <section style={styles.grid}>
          <Metric
            title="Estimated CAPEX"
            value={
              assessment?.estimated_capex_gbp
                ? `£${Number(
                    assessment.estimated_capex_gbp
                  ).toLocaleString()}`
                : "Awaiting assessment"
            }
            sub="Indicative investment requirement"
          />

          <Metric
            title="Annual Saving"
            value={
              assessment?.estimated_annual_savings_gbp
                ? `£${Number(
                    assessment.estimated_annual_savings_gbp
                  ).toLocaleString()}`
                : "Awaiting assessment"
            }
            sub="Requires verified project assumptions"
          />

          <Metric
            title="Payback"
            value={value(assessment?.estimated_payback_years, " years")}
            sub="Calculated only when evidence exists"
          />

          <Metric
            title="Carbon Reduction"
            value={value(
              assessment?.estimated_carbon_reduction_kg,
              " kg CO₂e"
            )}
            sub="Potential project impact"
          />
        </section>

        <section style={styles.engine}>
          <div style={styles.eyebrow}>
            N&T RENEWABLE TRANSITION ENGINE
          </div>

          <h2 style={styles.engineTitle}>
            Energy → Renewable Opportunity → Financial Impact
          </h2>

          <div style={styles.flow}>
            <Flow text="Client Energy" />
            <Arrow />
            <Flow text="Location" />
            <Arrow />
            <Flow text="Renewable Assessment" />
            <Arrow />
            <Flow text="Carbon Reduction" />
            <Arrow />
            <Flow text="Financial Case" />
            <Arrow />
            <Flow text="Green Finance" />
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>✓</div>

          <div>
            <h3>Evidence Before Recommendation</h3>
            <p style={styles.muted}>
              N&T does not classify a location as suitable for solar,
              wind or another renewable technology without supporting
              site and energy information. Financial savings, payback
              and carbon-reduction values remain unavailable until
              sufficient assessment data exists.
            </p>
          </div>
        </section>

        <SectionTitle text="SUSTAINABLE FINANCE CONNECTION" />

        <section style={styles.financeGrid}>
          <FinanceCard
            title="Green Loans"
            text="Link eligible renewable and efficiency investments with green-finance opportunities."
          />

          <FinanceCard
            title="Green Bonds"
            text="Future project eligibility, use-of-proceeds and environmental KPI evidence layer."
          />

          <FinanceCard
            title="Transition Finance"
            text="Support business transition from higher-carbon energy toward lower-carbon alternatives."
          />

          <FinanceCard
            title="Sustainability-Linked Finance"
            text="Connect measurable sustainability KPIs with financial decision-making."
          />
        </section>

        <section style={styles.next}>
          <div style={styles.eyebrow}>N&T DECISION INTELLIGENCE</div>

          <h2>
            Climate → Weather → Renewable Energy → Carbon → ESG →
            Green Finance
          </h2>

          <p style={styles.muted}>
            Day 9 establishes the renewable-energy and transition
            intelligence layer. Day 10 connects this architecture to
            green finance, green bonds and sustainable-finance
            intelligence.
          </p>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ text }) {
  return <div style={styles.sectionTitle}>{text}</div>;
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

function Opportunity({ icon, title, status, text }) {
  return (
    <div style={styles.opportunity}>
      <div style={styles.icon}>{icon}</div>
      <div style={styles.label}>{title}</div>
      <div style={styles.status}>{status}</div>
      <p style={styles.muted}>{text}</p>
    </div>
  );
}

function FinanceCard({ title, text }) {
  return (
    <div style={styles.financeCard}>
      <div style={styles.label}>{title}</div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={styles.muted}>{text}</p>
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
      "radial-gradient(circle at 85% 0%,#123f30 0%,#071812 35%,#020706 78%)",
    color: "#f4fff9",
    fontFamily: "Arial, sans-serif",
    padding: "35px 20px 80px",
  },

  loading: {
    minHeight: "100vh",
    background: "#020706",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
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
    color: "#77e6b2",
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
    color: "#54e9a1",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 1.7,
  },

  title: {
    fontSize: "clamp(40px,6vw,70px)",
    letterSpacing: -2,
    lineHeight: 0.98,
    margin: "12px 0 18px",
  },

  subtitle: {
    color: "#9cb8aa",
    lineHeight: 1.7,
    maxWidth: 700,
  },

  badge: {
    height: "fit-content",
    border: "1px solid #28704e",
    borderRadius: 30,
    padding: "10px 15px",
    color: "#66efad",
    fontWeight: 800,
    fontSize: 12,
  },

  clientPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 18,
    padding: 24,
    border: "1px solid #173b2e",
    borderRadius: 18,
    background: "rgba(6,27,19,.85)",
  },

  label: {
    color: "#65e9ab",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  itemValue: {
    fontSize: 18,
    fontWeight: 800,
    margin: "8px 0",
  },

  muted: {
    color: "#8aa597",
    fontSize: 13,
    lineHeight: 1.6,
  },

  sectionTitle: {
    color: "#6cebb0",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 1.7,
    margin: "38px 0 14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  metric: {
    minHeight: 135,
    padding: 22,
    borderRadius: 17,
    border: "1px solid #173b2e",
    background: "linear-gradient(145deg,#071d15,#050e0b)",
  },

  metricValue: {
    fontSize: 25,
    fontWeight: 900,
    margin: "15px 0 10px",
  },

  opportunityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 16,
  },

  opportunity: {
    minHeight: 205,
    padding: 24,
    border: "1px solid #1d4937",
    borderRadius: 18,
    background:
      "linear-gradient(145deg,rgba(12,47,34,.85),rgba(4,15,11,.9))",
  },

  icon: {
    fontSize: 31,
    marginBottom: 19,
    color: "#5bf0aa",
  },

  status: {
    marginTop: 13,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: 900,
  },

  engine: {
    marginTop: 38,
    padding: 28,
    borderRadius: 18,
    border: "1px solid #275a44",
    background:
      "linear-gradient(120deg,rgba(11,64,43,.65),rgba(5,17,13,.9))",
  },

  engineTitle: {
    fontSize: 28,
    marginTop: 10,
  },

  flow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 25,
  },

  flowBox: {
    padding: "12px 14px",
    borderRadius: 9,
    border: "1px solid #287052",
    background: "#09271c",
    fontSize: 12,
    fontWeight: 800,
  },

  arrow: {
    color: "#52eea4",
    fontSize: 20,
  },

  integrity: {
    marginTop: 20,
    display: "flex",
    gap: 18,
    padding: 24,
    borderRadius: 18,
    border: "1px solid #276445",
    background: "rgba(17,75,50,.18)",
  },

  check: {
    minWidth: 36,
    height: 36,
    borderRadius: "50%",
    background: "#4dea9d",
    color: "#03110b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  financeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 15,
  },

  financeCard: {
    padding: 23,
    borderRadius: 17,
    border: "1px solid #173d2e",
    background: "#06130f",
  },

  next: {
    marginTop: 35,
    padding: 30,
    borderRadius: 18,
    border: "1px solid #276047",
    background:
      "linear-gradient(120deg,rgba(10,62,42,.8),rgba(4,15,11,.95))",
  },

  error: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    border: "1px solid #8b4141",
  },
};
