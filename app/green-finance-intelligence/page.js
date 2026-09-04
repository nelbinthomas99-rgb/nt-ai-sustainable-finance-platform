"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function GreenFinanceIntelligence() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [green, setGreen] = useState(null);
  const [renewable, setRenewable] = useState(null);
  const [sustainable, setSustainable] = useState(null);
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

    const { data: greenData } = await supabase
      .from("green_finance_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: renewableData } = await supabase
      .from("renewable_energy_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: sustainableData } = await supabase
      .from("sustainable_finance_data")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setGreen(greenData || null);
    setRenewable(renewableData || null);
    setSustainable(sustainableData || null);

    setLoading(false);
  }

  function money(value) {
    if (value === null || value === undefined)
      return "Awaiting assessment";

    return `£${Number(value).toLocaleString()}`;
  }

  function numberValue(value, suffix = "") {
    if (value === null || value === undefined)
      return "Awaiting assessment";

    return `${Number(value).toLocaleString()}${suffix}`;
  }

  function status(value) {
    return value || "AWAITING ASSESSMENT";
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <h2>N&T Green Finance Intelligence</h2>
        <p>Loading sustainable finance intelligence...</p>
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
              N&T SUSTAINABLE FINANCE INTELLIGENCE
            </div>

            <h1 style={styles.title}>
              Green Finance
              <br />
              Intelligence
            </h1>

            <p style={styles.subtitle}>
              Connecting renewable investment, green finance,
              green bonds, transition finance, sustainability KPIs
              and environmental evidence.
            </p>
          </div>

          <div style={styles.badge}>
            DAY 10 • PROTOTYPE ENGINE
          </div>
        </header>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <section style={styles.clientPanel}>
          <Item
            title="CLIENT"
            value={client?.client_name}
            sub={client?.client_code}
          />

          <Item
            title="PROJECT"
            value={
              green?.project_name ||
              "Green Transition Assessment"
            }
            sub="Green finance assessment"
          />

          <Item
            title="STATUS"
            value={
              green?.assessment_status ||
              "prototype"
            }
            sub="Assessment architecture"
          />

          <Item
            title="METHODOLOGY"
            value={
              green?.methodology_version ||
              "NT-GFI-v1"
            }
            sub="Explainable evidence layer"
          />
        </section>

        <SectionTitle text="GREEN FINANCE ELIGIBILITY" />

        <section style={styles.grid}>
          <StatusCard
            title="Green Project"
            value={status(green?.green_project_status)}
            text="Project classification remains pending until supporting evidence is recorded."
          />

          <StatusCard
            title="Green Loan"
            value={status(green?.green_loan_status)}
            text="Green-loan suitability requires project and financing evidence."
          />

          <StatusCard
            title="Green Bond"
            value={status(green?.green_bond_status)}
            text="Green-bond assessment links project eligibility, proceeds and environmental evidence."
          />

          <StatusCard
            title="Transition Finance"
            value={status(
              green?.transition_finance_status
            )}
            text="Supports assessment of credible lower-carbon business transition."
          />

          <StatusCard
            title="Sustainability-Linked Finance"
            value={status(
              green?.sustainability_linked_status
            )}
            text="Connect financing decisions with measurable sustainability KPIs."
          />
        </section>

        <SectionTitle text="FINANCIAL STRUCTURE" />

        <section style={styles.metricGrid}>
          <Metric
            title="Project Cost"
            value={money(green?.project_cost_gbp)}
            sub="Total project investment"
          />

          <Metric
            title="Eligible Green Expenditure"
            value={money(
              green?.eligible_green_expenditure_gbp
            )}
            sub="Subject to eligibility assessment"
          />

          <Metric
            title="Proposed Green Finance"
            value={money(
              green?.proposed_green_finance_gbp
            )}
            sub="Potential sustainable financing"
          />

          <Metric
            title="Green Bond"
            value={money(
              green?.proposed_green_bond_gbp
            )}
            sub="Potential bond financing"
          />

          <Metric
            title="Green Loan"
            value={money(
              green?.proposed_green_loan_gbp
            )}
            sub="Potential green-loan financing"
          />

          <Metric
            title="Allocated Finance"
            value={money(
              green?.allocated_green_finance_gbp
            )}
            sub="Recorded allocation"
          />

          <Metric
            title="Unallocated Finance"
            value={money(
              green?.unallocated_green_finance_gbp
            )}
            sub="Remaining allocation"
          />
        </section>

        <SectionTitle text="GREEN BOND INTELLIGENCE" />

        <section style={styles.bondPanel}>
          <BondStep
            number="01"
            title="Project Selection"
            value={status(
              green?.green_project_status
            )}
            text="Identify and assess potentially eligible green projects."
          />

          <Arrow />

          <BondStep
            number="02"
            title="Use of Proceeds"
            value={status(
              green?.use_of_proceeds_status
            )}
            text="Track how proposed green financing is intended to be used."
          />

          <Arrow />

          <BondStep
            number="03"
            title="Allocation"
            value={
              green?.allocated_green_finance_gbp
                ? "RECORDED"
                : "AWAITING DATA"
            }
            text="Monitor allocation of financing to eligible projects."
          />

          <Arrow />

          <BondStep
            number="04"
            title="Environmental KPI"
            value={status(green?.kpi_status)}
            text="Connect financing with measurable environmental outcomes."
          />

          <Arrow />

          <BondStep
            number="05"
            title="Reporting"
            value={status(
              green?.reporting_status
            )}
            text="Build an evidence trail for reporting and review."
          />
        </section>

        <SectionTitle text="ENVIRONMENTAL IMPACT EVIDENCE" />

        <section style={styles.metricGrid}>
          <Metric
            title="Renewable Energy"
            value={numberValue(
              green?.renewable_energy_kwh,
              " kWh"
            )}
            sub="Recorded renewable energy impact"
          />

          <Metric
            title="Carbon Reduction"
            value={numberValue(
              green?.carbon_reduction_kg,
              " kg CO₂e"
            )}
            sub="Recorded project reduction"
          />

          <Metric
            title="Energy Saving"
            value={numberValue(
              green?.energy_savings_kwh,
              " kWh"
            )}
            sub="Energy efficiency impact"
          />

          <Metric
            title="Renewable Payback"
            value={numberValue(
              renewable?.estimated_payback_years,
              " years"
            )}
            sub="From Renewable Energy Intelligence"
          />
        </section>

        <SectionTitle text="EXISTING SUSTAINABLE FINANCE POSITION" />

        <section style={styles.metricGrid}>
          <Metric
            title="Green Investment"
            value={money(
              sustainable?.green_investment
            )}
            sub="Existing client data"
          />

          <Metric
            title="Sustainable Loans"
            value={money(
              sustainable?.sustainable_loans
            )}
            sub="Existing client data"
          />

          <Metric
            title="ESG Funds"
            value={money(
              sustainable?.esg_funds
            )}
            sub="Existing client data"
          />

          <Metric
            title="Total Finance"
            value={money(
              sustainable?.total_finance
            )}
            sub="Existing financing baseline"
          />
        </section>

        <section style={styles.engine}>
          <div style={styles.eyebrow}>
            N&T GREEN FINANCE ENGINE
          </div>

          <h2 style={styles.engineTitle}>
            From Environmental Opportunity
            to Finance Evidence
          </h2>

          <div style={styles.flow}>
            <Flow text="Climate Risk" />
            <Arrow />
            <Flow text="Renewable Project" />
            <Arrow />
            <Flow text="Eligibility" />
            <Arrow />
            <Flow text="Green Finance" />
            <Arrow />
            <Flow text="Use of Proceeds" />
            <Arrow />
            <Flow text="Impact KPI" />
            <Arrow />
            <Flow text="Reporting" />
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.check}>✓</div>

          <div>
            <h3 style={{ marginTop: 0 }}>
              Evidence Before Classification
            </h3>

            <p style={styles.muted}>
              N&T does not automatically classify a project,
              loan or bond as green without supporting evidence.
              Eligibility, financial values, environmental impact
              and allocation data remain unavailable until valid
              project information is recorded.
            </p>
          </div>
        </section>

        <section style={styles.finalPanel}>
          <div style={styles.eyebrow}>
            N&T DECISION INTELLIGENCE ARCHITECTURE
          </div>

          <h2 style={styles.finalTitle}>
            Climate → Weather → Renewable Energy →
            Carbon → ESG → Green Finance →
            Green Bonds → Financial Decision
          </h2>

          <p style={styles.muted}>
            The platform now links sustainability,
            environmental and financial intelligence while
            preserving an evidence-first approach.
          </p>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ text }) {
  return (
    <div style={styles.sectionTitle}>
      {text}
    </div>
  );
}

function Item({ title, value, sub }) {
  return (
    <div>
      <div style={styles.label}>{title}</div>
      <div style={styles.itemValue}>
        {value || "—"}
      </div>
      <div style={styles.muted}>{sub}</div>
    </div>
  );
}

function Metric({ title, value, sub }) {
  return (
    <div style={styles.metric}>
      <div style={styles.label}>{title}</div>
      <div style={styles.metricValue}>
        {value}
      </div>
      <div style={styles.muted}>{sub}</div>
    </div>
  );
}

function StatusCard({ title, value, text }) {
  return (
    <div style={styles.statusCard}>
      <div style={styles.label}>{title}</div>
      <div style={styles.statusValue}>
        {value}
      </div>
      <p style={styles.muted}>{text}</p>
    </div>
  );
}

function BondStep({ number, title, value, text }) {
  return (
    <div style={styles.bondStep}>
      <div style={styles.stepNumber}>{number}</div>
      <div style={styles.label}>{title}</div>
      <div style={styles.bondValue}>{value}</div>
      <div style={styles.muted}>{text}</div>
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
      "radial-gradient(circle at 85% 0%,#103c2e 0%,#071812 35%,#020706 78%)",
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
    maxWidth: 1260,
    margin: "0 auto",
  },

  back: {
    padding: "10px 16px",
    border: "1px solid #24523f",
    background: "transparent",
    color: "#69eaaa",
    borderRadius: 9,
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
    fontSize: "clamp(40px,6vw,70px)",
    lineHeight: 0.98,
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
    border: "1px solid #26704e",
    borderRadius: 30,
    padding: "10px 15px",
    color: "#68efae",
    fontSize: 12,
    fontWeight: 900,
  },

  clientPanel: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 18,
    padding: 24,
    background: "rgba(5,26,18,.9)",
    border: "1px solid #183d2f",
    borderRadius: 18,
  },

  label: {
    color: "#68eeb0",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },

  itemValue: {
    fontSize: 18,
    fontWeight: 900,
    margin: "9px 0",
  },

  muted: {
    color: "#89a497",
    fontSize: 13,
    lineHeight: 1.6,
  },

  sectionTitle: {
    color: "#70eeb2",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 1.8,
    margin: "38px 0 15px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  statusCard: {
    minHeight: 180,
    padding: 23,
    background:
      "linear-gradient(145deg,#08231a,#050e0b)",
    border: "1px solid #194734",
    borderRadius: 17,
  },

  statusValue: {
    fontSize: 18,
    fontWeight: 900,
    margin: "15px 0 12px",
  },

  metricGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: 15,
  },

  metric: {
    minHeight: 130,
    padding: 22,
    background: "#06140f",
    border: "1px solid #183e2e",
    borderRadius: 17,
  },

  metricValue: {
    fontSize: 23,
    fontWeight: 900,
    margin: "14px 0 9px",
  },

  bondPanel: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "stretch",
    padding: 25,
    borderRadius: 18,
    border: "1px solid #265a43",
    background:
      "linear-gradient(120deg,rgba(12,63,43,.55),rgba(5,17,13,.9))",
  },

  bondStep: {
    flex: "1 1 170px",
    padding: 18,
    borderRadius: 14,
    background: "#071b14",
    border: "1px solid #1e4a37",
  },

  stepNumber: {
    color: "#48e89a",
    fontSize: 25,
    fontWeight: 900,
    marginBottom: 15,
  },

  bondValue: {
    fontSize: 15,
    fontWeight: 900,
    margin: "12px 0",
  },

  engine: {
    marginTop: 38,
    padding: 29,
    borderRadius: 18,
    border: "1px solid #266044",
    background:
      "linear-gradient(120deg,rgba(11,70,46,.7),rgba(4,16,11,.95))",
  },

  engineTitle: {
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
    border: "1px solid #2a7152",
    borderRadius: 9,
    background: "#09271c",
    padding: "12px 14px",
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

  finalPanel: {
    marginTop: 24,
    padding: 30,
    borderRadius: 18,
    border: "1px solid #2a674a",
    background:
      "linear-gradient(120deg,#0a3f2b,#06130e)",
  },

  finalTitle: {
    fontSize: "clamp(24px,4vw,38px)",
    lineHeight: 1.3,
  },

  error: {
    padding: 15,
    marginBottom: 20,
    border: "1px solid #914343",
    borderRadius: 10,
  },
};
