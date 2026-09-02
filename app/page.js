"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

function Icon({ type, size = 22 }) {
  const icons = {
    dashboard: (
      <>
        <path d="M4 13h6V4H4v9Z" />
        <path d="M14 20h6v-9h-6v9Z" />
        <path d="M4 20h6v-3H4v3Z" />
        <path d="M14 7h6V4h-6v3Z" />
      </>
    ),
    financial: (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V3" />
      </>
    ),
    esg: (
      <>
        <path d="M12 21c0-7 3-12 9-16-1 8-4 12-9 16Z" />
        <path d="M12 21C11 14 7 10 3 8c0 7 3 11 9 13Z" />
      </>
    ),
    carbon: (
      <>
        <path d="M8 18h9a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.3 8.4 4.5 4.5 0 0 0 8 18Z" />
      </>
    ),
    sustainable: (
      <>
        <path d="M12 21V9" />
        <path d="M12 12c-5 0-7-3-7-7 4 0 7 2 7 7Z" />
        <path d="M12 15c5 0 7-3 7-7-4 0-7 2-7 7Z" />
      </>
    ),
    ai: (
      <>
        <rect x="5" y="5" width="14" height="14" rx="3" />
        <path d="M9 9h6v6H9z" />
        <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
      </>
    ),
    documents: (
      <>
        <path d="M4 5h6l2 2h8v12H4V5Z" />
      </>
    ),
    architecture: (
      <>
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M12 7v5M12 12 5 17M12 12l7 5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H4v14h6" />
        <path d="M14 8l4 4-4 4M18 12H8" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[type]}
    </svg>
  );
}

function MiniBars({ values }) {
  const max = Math.max(...values, 1);

  return (
    <div className="miniBars">
      {values.map((value, index) => (
        <span
          key={index}
          style={{ height: `${Math.max((value / max) * 100, 12)}%` }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value, max = 100, gold = false }) {
  const width = Math.min(Math.max((Number(value) / max) * 100, 0), 100);

  return (
    <div className="progressTrack">
      <div
        className={gold ? "progressGold" : "progressGreen"}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");

  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    environmental: 0,
    social: 0,
    governance: 0,
    esgScore: 0,
    electricity: 0,
    gas: 0,
    travel: 0,
    carbon: 0,
    greenInvestment: 0,
    sustainableLoans: 0,
    esgFunds: 0,
    totalFinance: 0,
    sustainablePercentage: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("client_id, client_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profile) {
        setClientId(profile.client_id || "");
        setClientName(profile.client_name || "");
      }

      const [financial, esg, carbon, sustainable] = await Promise.all([
        supabase
          .from("financial_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("esg_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("carbon_energy_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("sustainable_finance_data")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const revenue = Number(financial.data?.revenue || 0);
      const expenses = Number(financial.data?.expenses || 0);
      const profit = revenue - expenses;

      const environmental = Number(
        esg.data?.environmental_score ?? esg.data?.environmental ?? 0
      );

      const social = Number(
        esg.data?.social_score ?? esg.data?.social ?? 0
      );

      const governance = Number(
        esg.data?.governance_score ?? esg.data?.governance ?? 0
      );

      const esgScore =
        environmental || social || governance
          ? (environmental + social + governance) / 3
          : 0;

      const electricity = Number(carbon.data?.electricity_kwh || 0);
      const gas = Number(carbon.data?.gas_kwh || 0);
      const travel = Number(carbon.data?.travel_km || 0);
      const carbonTotal = Number(carbon.data?.carbon_emissions_kg || 0);

      const greenInvestment = Number(
        sustainable.data?.green_investment || 0
      );

      const sustainableLoans = Number(
        sustainable.data?.sustainable_loans || 0
      );

      const esgFunds = Number(sustainable.data?.esg_funds || 0);

      const totalFinance = Number(
        sustainable.data?.total_finance || 0
      );

      const sustainableTotal =
        greenInvestment + sustainableLoans + esgFunds;

      const sustainablePercentage =
        totalFinance > 0 ? (sustainableTotal / totalFinance) * 100 : 0;

      if (!mounted) return;

      setSummary({
        revenue,
        expenses,
        profit,
        environmental,
        social,
        governance,
        esgScore,
        electricity,
        gas,
        travel,
        carbon: carbonTotal,
        greenInvestment,
        sustainableLoans,
        esgFunds,
        totalFinance,
        sustainablePercentage,
      });

      setLoading(false);
    }

    loadDashboard();

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="loadingScreen">
        <div className="loadingLogo">N&T</div>
        <div className="loadingRing" />
        <p>Loading secure intelligence platform...</p>

        <style>{styles}</style>
      </main>
    );
  }

  const money = (value) =>
    `£${Number(value).toLocaleString("en-GB", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const navItems = [
    ["dashboard", "Dashboard", "/"],
    ["financial", "Financial Overview", "/financial"],
    ["esg", "ESG Performance", "/esg"],
    ["carbon", "Carbon & Energy", "/carbon-energy"],
    ["sustainable", "Sustainable Finance", "/sustainable-finance"],
    ["ai", "AI Insights", "/ai-insights"],
    ["documents", "Documents", "/documents"],
    ["architecture", "Architecture", "/architecture"],
  ];

  const modules = [
    ["financial", "Financial", "Accounting & Financial Data", "/financial"],
    ["esg", "ESG", "Environmental, Social & Governance", "/esg"],
    ["carbon", "Carbon & Energy", "Emissions & Energy Tracking", "/carbon-energy"],
    [
      "sustainable",
      "Sustainable Finance",
      "Investments & Finance Metrics",
      "/sustainable-finance",
    ],
    ["ai", "AI Insights", "Automated Business Insights", "/ai-insights"],
    ["documents", "Documents", "Secure Document Management", "/documents"],
  ];

  const aiMessage =
    summary.esgScore >= 75
      ? "Your current ESG performance is strong. Continue monitoring environmental, social and governance indicators."
      : "Your ESG dashboard has opportunities for improvement. Review individual ESG indicators for the next actions.";

  return (
    <main className="appShell">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">
            <span className="brandBars">▥</span>
            <span className="brandArrow">↗</span>
          </div>

          <div>
            <div className="brandName">N&T</div>
            <div className="brandTag">
              AI-POWERED
              <br />
              SUSTAINABLE FINANCE
            </div>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(([icon, label, href], index) => (
            <Link
              key={label}
              href={href}
              className={`navItem ${index === 0 ? "navActive" : ""}`}
            >
              <Icon type={icon} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="partnerCard">
          <div className="partnerGlow" />
          <div className="partnerTitle">N&T Client Portal</div>
          <div className="partnerText">
            Secure. Sustainable. Intelligent.
          </div>
          <div className="clientCode">
            {clientId || "Secure Client"}
          </div>
        </div>

        <button onClick={handleLogout} className="logoutButton">
          <Icon type="logout" />
          Logout
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="searchBox">
            <span className="searchIcon">⌕</span>
            <span>Search platform...</span>
            <span className="aiSearch">AI</span>
          </div>

          <div className="profile">
            <div className="liveDot" />
            <div className="profileCircle">NT</div>
            <div>
              <strong>N&T Client</strong>
              <small>{email}</small>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="welcomeRow">
            <div>
              <h1>
                Welcome to <span>N&T Intelligence</span>
              </h1>

              <p>
                Your financial and sustainability performance in one secure
                intelligent platform.
              </p>

              {clientName && (
                <div className="clientPill">{clientName}</div>
              )}
            </div>

            <div className="statusPill">
              <span className="pulseDot" />
              LIVE DATA CONNECTED
            </div>
          </div>

          <section className="kpiGrid">
            <div className="kpiCard">
              <div className="kpiTop">
                <div className="roundIcon">
                  <Icon type="financial" />
                </div>
                <span>Revenue</span>
              </div>

              <h2>{money(summary.revenue)}</h2>
              <p>Current financial snapshot</p>
              <MiniBars values={[25, 37, 30, 48, 42, 62, 55, 74]} />
            </div>

            <div className="kpiCard goldCard">
              <div className="kpiTop">
                <div className="roundIcon gold">
                  <Icon type="financial" />
                </div>
                <span>Net Profit</span>
              </div>

              <h2>{money(summary.profit)}</h2>
              <p>Revenue less expenses</p>
              <MiniBars values={[20, 28, 25, 35, 32, 44, 39, 55]} />
            </div>

            <div className="kpiCard">
              <div className="kpiTop">
                <div className="roundIcon">
                  <Icon type="esg" />
                </div>
                <span>ESG Score</span>
              </div>

              <h2>{summary.esgScore.toFixed(1)}<small>/100</small></h2>
              <p>Current ESG performance</p>
              <MiniBars values={[35, 45, 50, 48, 60, 68, 72, 80]} />
            </div>

            <div className="kpiCard goldCard">
              <div className="kpiTop">
                <div className="roundIcon gold">
                  <Icon type="carbon" />
                </div>
                <span>Carbon Emissions</span>
              </div>

              <h2>
                {summary.carbon.toFixed(2)}
                <small> kg CO₂e</small>
              </h2>

              <p>Latest calculated footprint</p>
              <MiniBars values={[75, 68, 62, 58, 54, 48, 45, 40]} />
            </div>
          </section>

          <section className="intelligenceGrid">
            <div className="impactPanel">
              <div className="impactText">
                <span className="eyebrow">N&T INTELLIGENCE ENGINE</span>

                <h2>
                  Sustainable finance.
                  <br />
                  <span>Measurable impact.</span>
                </h2>

                <p>
                  Financial, ESG, carbon and sustainable finance information
                  combined into one secure reporting experience.
                </p>

                <div className="syncState">
                  <span className="pulseDot" />
                  Supabase data synchronised
                </div>
              </div>

              <div className="globeScene">
                <div className="orbit orbitOne">
                  <i />
                  <i />
                </div>

                <div className="orbit orbitTwo">
                  <i />
                </div>

                <div className="globe">
                  <div className="globeGrid globeGridOne" />
                  <div className="globeGrid globeGridTwo" />
                  <div className="continent c1" />
                  <div className="continent c2" />
                  <div className="continent c3" />
                  <div className="globeGlow" />
                </div>

                <div className="platformRing ring1" />
                <div className="platformRing ring2" />
                <div className="platformRing ring3" />
              </div>

              <div className="impactMetrics">
                <div>
                  <span>ESG Health</span>
                  <strong>{summary.esgScore.toFixed(0)}/100</strong>
                </div>

                <div>
                  <span>Sustainable Finance</span>
                  <strong>
                    {summary.sustainablePercentage.toFixed(1)}%
                  </strong>
                </div>

                <div>
                  <span>Carbon Tracked</span>
                  <strong>{summary.carbon.toFixed(1)}</strong>
                </div>

                <div>
                  <span>Secure Session</span>
                  <strong className="greenText">Active</strong>
                </div>
              </div>
            </div>

            <aside className="rightPanel">
              <div className="aiPanel">
                <div className="panelHeading">
                  <span className="lightning">✦</span>
                  <strong>AI Insights</strong>
                  <span className="liveBadge">LIVE</span>
                </div>

                <div className="aiBrain">
                  <div className="brainCore">AI</div>
                  <span className="node n1" />
                  <span className="node n2" />
                  <span className="node n3" />
                  <span className="node n4" />
                  <span className="node n5" />
                </div>

                <h3>
                  ESG Score {summary.esgScore.toFixed(1)}/100
                </h3>

                <p>{aiMessage}</p>

                <Link href="/ai-insights" className="actionButton">
                  Explore AI Insights →
                </Link>
              </div>

              <div className="securityPanel">
                <div className="securityIcon">
                  <Icon type="shield" size={30} />
                </div>

                <div>
                  <h3>Platform Security</h3>
                  <p>
                    Authenticated client session with protected database
                    access.
                  </p>

                  <span className="secureState">
                    ● Secure session active
                  </span>
                </div>
              </div>
            </aside>
          </section>

          <div className="sectionHeading">
            <div>
              <span className="eyebrow">REAL-TIME OVERVIEW</span>
              <h2>Performance Intelligence</h2>
            </div>

            <div className="currentTag">Current Snapshot</div>
          </div>

          <section className="performanceGrid">
            <div className="performanceCard">
              <h3>
                <Icon type="financial" /> Financial Performance
              </h3>

              <div className="metricRow">
                <span>Revenue</span>
                <strong>{money(summary.revenue)}</strong>
              </div>
              <ProgressBar value={summary.revenue} max={50000} />

              <div className="metricRow">
                <span>Expenses</span>
                <strong>{money(summary.expenses)}</strong>
              </div>
              <ProgressBar value={summary.expenses} max={50000} />

              <div className="metricRow">
                <span>Net Profit</span>
                <strong>{money(summary.profit)}</strong>
              </div>
              <ProgressBar value={summary.profit} max={50000} gold />
            </div>

            <div className="performanceCard">
              <h3>
                <Icon type="esg" /> ESG Performance
              </h3>

              <div className="metricRow">
                <span>Environmental</span>
                <strong>{summary.environmental}/100</strong>
              </div>
              <ProgressBar value={summary.environmental} />

              <div className="metricRow">
                <span>Social</span>
                <strong>{summary.social}/100</strong>
              </div>
              <ProgressBar value={summary.social} />

              <div className="metricRow">
                <span>Governance</span>
                <strong>{summary.governance}/100</strong>
              </div>
              <ProgressBar value={summary.governance} gold />
            </div>

            <div className="performanceCard">
              <h3>
                <Icon type="carbon" /> Carbon & Energy
              </h3>

              <div className="metricRow">
                <span>Electricity</span>
                <strong>{summary.electricity.toLocaleString()} kWh</strong>
              </div>
              <ProgressBar value={summary.electricity} max={1000} />

              <div className="metricRow">
                <span>Gas</span>
                <strong>{summary.gas.toLocaleString()} kWh</strong>
              </div>
              <ProgressBar value={summary.gas} max={1000} />

              <div className="metricRow">
                <span>Business Travel</span>
                <strong>{summary.travel.toLocaleString()} km</strong>
              </div>
              <ProgressBar value={summary.travel} max={1000} gold />
            </div>

            <div className="performanceCard">
              <h3>
                <Icon type="sustainable" /> Sustainable Finance
              </h3>

              <div className="metricRow">
                <span>Green Investment</span>
                <strong>{money(summary.greenInvestment)}</strong>
              </div>
              <ProgressBar
                value={summary.greenInvestment}
                max={summary.totalFinance || 100000}
              />

              <div className="metricRow">
                <span>Sustainable Loans</span>
                <strong>{money(summary.sustainableLoans)}</strong>
              </div>
              <ProgressBar
                value={summary.sustainableLoans}
                max={summary.totalFinance || 100000}
              />

              <div className="metricRow">
                <span>ESG Funds</span>
                <strong>{money(summary.esgFunds)}</strong>
              </div>
              <ProgressBar
                value={summary.esgFunds}
                max={summary.totalFinance || 100000}
                gold
              />
            </div>
          </section>

          <div className="sectionHeading moduleHeading">
            <div>
              <span className="eyebrow">SECURE CLIENT TOOLS</span>
              <h2>Client Portal Modules</h2>
            </div>
          </div>

          <section className="moduleGrid">
            {modules.map(([icon, title, description, href], index) => (
              <Link href={href} className="moduleCard" key={title}>
                <div className={`moduleOrb orb${index + 1}`}>
                  <Icon type={icon} size={34} />
                </div>

                <h3>{title}</h3>
                <p>{description}</p>

                <span className="openLink">Open →</span>
              </Link>
            ))}
          </section>

          <footer>
            <span>
              © 2026 N&T AI-Powered Sustainable Finance & Accounting Ltd
            </span>

            <span className="footerBrand">
              N&T <small>Building a Sustainable Future.</small>
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  background: #020807;
}

body {
  font-family: Inter, Arial, Helvetica, sans-serif;
}

a {
  color: inherit;
}

.appShell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 70% 25%, rgba(0, 255, 166, .06), transparent 30%),
    radial-gradient(circle at 95% 70%, rgba(218, 166, 64, .05), transparent 25%),
    #020807;
  color: #f3f7f5;
  display: flex;
}

.sidebar {
  width: 250px;
  min-height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 25px 18px;
  border-right: 1px solid rgba(64, 255, 176, .13);
  background:
    linear-gradient(180deg, rgba(4, 30, 24, .98), rgba(1, 12, 10, .99));
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px 26px;
}

.brandMark {
  width: 48px;
  height: 48px;
  border: 1px solid #cda54d;
  border-radius: 50%;
  position: relative;
  color: #8ff58f;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(69, 255, 142, .13);
}

.brandBars {
  font-size: 25px;
}

.brandArrow {
  position: absolute;
  right: 5px;
  top: 0px;
  color: #d8aa46;
  font-size: 20px;
}

.brandName {
  font-family: Georgia, serif;
  font-size: 30px;
  color: #d7ae58;
  line-height: 1;
}

.brandTag {
  font-size: 8px;
  letter-spacing: .8px;
  color: #d9e3df;
  margin-top: 4px;
  line-height: 1.3;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.navItem {
  color: #aab9b4;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 14px;
  transition: .25s ease;
  border: 1px solid transparent;
}

.navItem:hover {
  color: #fff;
  background: rgba(25, 133, 92, .13);
  border-color: rgba(58, 255, 169, .12);
  transform: translateX(4px);
}

.navActive {
  color: white;
  background:
    linear-gradient(90deg, rgba(19, 113, 72, .75), rgba(8, 71, 50, .45));
  border: 1px solid rgba(70, 255, 158, .55);
  box-shadow:
    inset 3px 0 0 #cfa43d,
    0 0 22px rgba(24, 255, 136, .11);
}

.partnerCard {
  margin-top: auto;
  border: 1px solid rgba(82, 255, 172, .25);
  background: rgba(8, 48, 37, .43);
  border-radius: 13px;
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.partnerGlow {
  position: absolute;
  width: 100px;
  height: 100px;
  background: rgba(53, 255, 158, .12);
  filter: blur(35px);
  right: -30px;
  top: -30px;
}

.partnerTitle {
  font-weight: 700;
  margin-bottom: 4px;
}

.partnerText {
  color: #93aaa1;
  font-size: 11px;
}

.clientCode {
  color: #d2ad5d;
  font-size: 11px;
  margin-top: 12px;
}

.logoutButton {
  background: transparent;
  border: 0;
  color: #c7d2ce;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 17px 13px 5px;
  cursor: pointer;
  font-size: 14px;
}

.workspace {
  margin-left: 250px;
  width: calc(100% - 250px);
}

.topbar {
  height: 72px;
  border-bottom: 1px solid rgba(54, 255, 166, .12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 34px;
  position: sticky;
  top: 0;
  z-index: 8;
  backdrop-filter: blur(18px);
  background: rgba(2, 10, 8, .84);
}

.searchBox {
  width: min(410px, 45vw);
  height: 40px;
  border: 1px solid rgba(48, 239, 156, .28);
  border-radius: 9px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 9px;
  color: #83978f;
  font-size: 13px;
  background: rgba(7, 35, 28, .45);
}

.searchIcon {
  font-size: 20px;
  color: #c9d7d1;
}

.aiSearch {
  margin-left: auto;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid rgba(67, 255, 171, .23);
  color: #77f6ae;
}

.profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profileCircle {
  width: 38px;
  height: 38px;
  border: 1px solid #c99e41;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: Georgia, serif;
  color: #dbb459;
  background: #071711;
}

.profile strong {
  font-size: 12px;
  display: block;
}

.profile small {
  color: #849890;
  font-size: 9px;
  display: block;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.liveDot,
.pulseDot {
  width: 8px;
  height: 8px;
  background: #42f587;
  border-radius: 50%;
  box-shadow: 0 0 10px #42f587;
}

.pulseDot {
  display: inline-block;
  animation: pulse 1.8s infinite;
}

.content {
  padding: 25px 30px 10px;
  max-width: 1650px;
  margin: 0 auto;
}

.welcomeRow {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.welcomeRow h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
}

.welcomeRow h1 span {
  color: #38e988;
}

.welcomeRow p {
  margin: 7px 0 0;
  color: #8ca099;
  font-size: 13px;
}

.clientPill {
  display: inline-block;
  margin-top: 9px;
  padding: 6px 10px;
  border: 1px solid rgba(50, 238, 151, .18);
  border-radius: 20px;
  color: #a7bcb4;
  font-size: 10px;
}

.statusPill {
  color: #75e6a2;
  border: 1px solid rgba(69, 248, 150, .21);
  padding: 8px 12px;
  border-radius: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 9px;
  letter-spacing: 1px;
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.kpiCard {
  background:
    linear-gradient(145deg, rgba(5, 30, 23, .95), rgba(4, 18, 15, .96));
  border: 1px solid rgba(57, 237, 157, .19);
  border-radius: 14px;
  padding: 18px;
  min-height: 145px;
  position: relative;
  overflow: hidden;
  transition: .3s ease;
}

.kpiCard::after {
  content: "";
  position: absolute;
  inset: auto -30px -45px auto;
  width: 100px;
  height: 100px;
  background: rgba(23, 255, 140, .06);
  border-radius: 50%;
  filter: blur(25px);
}

.kpiCard:hover {
  transform: translateY(-4px);
  border-color: rgba(62, 255, 167, .43);
  box-shadow: 0 12px 35px rgba(0, 0, 0, .35);
}

.goldCard {
  border-color: rgba(209, 164, 65, .19);
}

.kpiTop {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #afc0b9;
  font-size: 11px;
}

.roundIcon {
  width: 37px;
  height: 37px;
  display: grid;
  place-items: center;
  border: 1px solid #25db77;
  border-radius: 50%;
  color: #52ee8d;
  background: rgba(24, 139, 78, .15);
}

.roundIcon.gold {
  color: #e1b348;
  border-color: #d29b20;
  background: rgba(200, 141, 18, .1);
}

.kpiCard h2 {
  font-size: 25px;
  margin: 13px 0 2px;
}

.kpiCard h2 small {
  font-size: 11px;
  color: #94a69f;
  font-weight: 400;
}

.kpiCard p {
  margin: 0;
  color: #637b72;
  font-size: 9px;
}

.miniBars {
  height: 27px;
  display: flex;
  gap: 3px;
  align-items: flex-end;
  margin-top: 9px;
}

.miniBars span {
  flex: 1;
  max-width: 18px;
  background: linear-gradient(180deg, #44fa8f, #0d6c47);
  border-radius: 2px 2px 0 0;
  opacity: .78;
  animation: barGlow 3s ease-in-out infinite alternate;
}

.goldCard .miniBars span {
  background: linear-gradient(180deg, #f0bc4f, #875d08);
}

.intelligenceGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 285px;
  gap: 14px;
  margin-top: 16px;
}

.impactPanel {
  min-height: 320px;
  border: 1px solid rgba(51, 242, 157, .2);
  border-radius: 15px;
  background:
    radial-gradient(circle at center, rgba(0, 255, 157, .07), transparent 42%),
    linear-gradient(145deg, rgba(4, 26, 20, .97), rgba(2, 14, 12, .99));
  display: grid;
  grid-template-columns: 1fr 1.6fr .9fr;
  gap: 12px;
  padding: 22px;
  overflow: hidden;
  position: relative;
}

.impactPanel::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: .11;
  background-image:
    linear-gradient(rgba(38, 248, 154, .15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38, 248, 154, .15) 1px, transparent 1px);
  background-size: 35px 35px;
  pointer-events: none;
}

.impactText {
  z-index: 1;
  align-self: center;
}

.eyebrow {
  color: #50e990;
  font-size: 8px;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.impactText h2 {
  font-size: 25px;
  line-height: 1.1;
  margin: 12px 0;
}

.impactText h2 span {
  color: #d7ad55;
}

.impactText p {
  color: #92a69e;
  font-size: 11px;
  line-height: 1.7;
  max-width: 230px;
}

.syncState {
  color: #91c9aa;
  font-size: 9px;
  margin-top: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.globeScene {
  min-height: 270px;
  position: relative;
  display: grid;
  place-items: center;
  perspective: 700px;
}

.globe {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 1px solid rgba(72, 255, 186, .67);
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 38% 35%, rgba(55, 255, 186, .2), transparent 22%),
    radial-gradient(circle at 50% 50%, #0b553f 0%, #063127 43%, #021612 72%);
  box-shadow:
    inset -20px -15px 40px rgba(0, 0, 0, .65),
    inset 12px 10px 30px rgba(68, 255, 182, .16),
    0 0 45px rgba(23, 255, 171, .23);
  animation: globeFloat 4s ease-in-out infinite;
  z-index: 3;
}

.globeGridOne,
.globeGridTwo {
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  border: 1px solid rgba(121, 255, 210, .18);
}

.globeGridOne::before,
.globeGridOne::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  border-left: 1px solid rgba(117, 255, 207, .18);
}

.globeGridOne::after {
  transform: rotate(60deg);
}

.globeGridTwo {
  transform: scaleX(.5);
}

.continent {
  position: absolute;
  background: rgba(52, 230, 146, .62);
  filter: drop-shadow(0 0 5px rgba(45, 255, 164, .4));
}

.c1 {
  width: 55px;
  height: 42px;
  top: 48px;
  left: 37px;
  border-radius: 60% 30% 65% 40%;
  transform: rotate(-15deg);
}

.c2 {
  width: 32px;
  height: 50px;
  top: 88px;
  left: 75px;
  border-radius: 45% 40% 65% 50%;
  transform: rotate(20deg);
}

.c3 {
  width: 42px;
  height: 25px;
  top: 55px;
  right: 18px;
  border-radius: 50% 60% 40% 70%;
}

.globeGlow {
  position: absolute;
  inset: 30%;
  background: #62ffbd;
  filter: blur(25px);
  opacity: .2;
}

.orbit {
  position: absolute;
  width: 250px;
  height: 95px;
  border: 1px solid rgba(65, 255, 173, .28);
  border-radius: 50%;
  transform: rotate(-15deg);
  animation: orbitSpin 9s linear infinite;
}

.orbitTwo {
  width: 230px;
  height: 80px;
  transform: rotate(35deg);
  border-color: rgba(223, 175, 70, .25);
  animation-duration: 12s;
  animation-direction: reverse;
}

.orbit i {
  width: 7px;
  height: 7px;
  background: #52f597;
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 8px #52f597;
}

.orbit i:first-child {
  left: 35px;
  top: 8px;
}

.orbit i:nth-child(2) {
  right: 20px;
  bottom: 5px;
  background: #d6aa4d;
}

.platformRing {
  position: absolute;
  height: 22px;
  border: 1px solid rgba(64, 255, 180, .35);
  border-radius: 50%;
  bottom: 35px;
}

.ring1 {
  width: 230px;
}

.ring2 {
  width: 190px;
  bottom: 39px;
  border-color: rgba(208, 166, 69, .36);
}

.ring3 {
  width: 140px;
  bottom: 43px;
  box-shadow: 0 0 25px rgba(54, 255, 176, .18);
}

.impactMetrics {
  z-index: 1;
  align-self: center;
}

.impactMetrics div {
  border-bottom: 1px solid rgba(56, 224, 151, .11);
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.impactMetrics span {
  color: #80978e;
  font-size: 9px;
}

.impactMetrics strong {
  font-size: 11px;
}

.greenText {
  color: #4feb87;
}

.rightPanel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.aiPanel,
.securityPanel {
  border: 1px solid rgba(58, 249, 161, .22);
  background:
    linear-gradient(145deg, rgba(5, 35, 27, .96), rgba(3, 19, 16, .98));
  border-radius: 14px;
  padding: 16px;
}

.panelHeading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.lightning {
  color: #efb844;
  font-size: 20px;
}

.liveBadge {
  margin-left: auto;
  color: #5afa92;
  font-size: 8px;
  border: 1px solid rgba(80, 255, 145, .22);
  padding: 3px 6px;
  border-radius: 10px;
}

.aiBrain {
  height: 80px;
  position: relative;
  display: grid;
  place-items: center;
  margin: 10px 0;
  background:
    radial-gradient(circle, rgba(33, 255, 158, .13), transparent 55%);
}

.brainCore {
  width: 45px;
  height: 45px;
  border: 1px solid #49f596;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #5afca1;
  font-weight: 700;
  box-shadow: 0 0 22px rgba(57, 255, 164, .2);
  animation: brainPulse 2s ease-in-out infinite;
}

.node {
  width: 5px;
  height: 5px;
  background: #59f99b;
  border-radius: 50%;
  position: absolute;
  animation: nodeBlink 1.7s infinite alternate;
}

.n1 { left: 22%; top: 28%; }
.n2 { right: 22%; top: 22%; animation-delay: .2s; }
.n3 { left: 15%; bottom: 20%; animation-delay: .5s; }
.n4 { right: 16%; bottom: 22%; animation-delay: .8s; }
.n5 { right: 42%; top: 4%; animation-delay: 1s; }

.aiPanel h3 {
  margin: 8px 0 6px;
  font-size: 15px;
}

.aiPanel p,
.securityPanel p {
  color: #92a69e;
  line-height: 1.55;
  font-size: 10px;
}

.actionButton {
  display: block;
  text-align: center;
  border-radius: 8px;
  padding: 9px;
  margin-top: 11px;
  background: linear-gradient(90deg, #086141, #074a36);
  border: 1px solid rgba(64, 255, 169, .23);
  text-decoration: none;
  font-size: 10px;
  transition: .25s;
}

.actionButton:hover {
  box-shadow: 0 0 22px rgba(49, 255, 155, .16);
  transform: translateY(-2px);
}

.securityPanel {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.securityIcon {
  color: #5bf195;
  min-width: 37px;
}

.securityPanel h3 {
  margin: 0;
  font-size: 13px;
}

.secureState {
  color: #5ee991;
  font-size: 9px;
}

.sectionHeading {
  margin: 26px 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.sectionHeading h2 {
  margin: 4px 0 0;
  font-size: 18px;
}

.currentTag {
  color: #82978f;
  border: 1px solid rgba(71, 238, 161, .13);
  padding: 6px 9px;
  border-radius: 8px;
  font-size: 9px;
}

.performanceGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 13px;
}

.performanceCard {
  border: 1px solid rgba(61, 228, 154, .16);
  border-radius: 13px;
  padding: 16px;
  background: rgba(5, 26, 21, .72);
  transition: .25s;
}

.performanceCard:hover {
  border-color: rgba(61, 255, 164, .35);
  background: rgba(6, 35, 27, .84);
}

.performanceCard h3 {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dce7e2;
  margin: 0 0 16px;
}

.metricRow {
  display: flex;
  justify-content: space-between;
  color: #9caea7;
  font-size: 9px;
  margin: 11px 0 5px;
}

.metricRow strong {
  color: #dce5e1;
  font-size: 9px;
}

.progressTrack {
  width: 100%;
  height: 5px;
  background: #1a2925;
  border-radius: 10px;
  overflow: hidden;
}

.progressGreen,
.progressGold {
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #1faa65, #59f79a);
  box-shadow: 0 0 8px rgba(64, 255, 154, .2);
  animation: growBar 1.3s ease-out both;
}

.progressGold {
  background: linear-gradient(90deg, #8a6112, #e0b34e);
}

.moduleHeading {
  margin-top: 26px;
}

.moduleGrid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

.moduleCard {
  border: 1px solid rgba(64, 235, 159, .17);
  background:
    linear-gradient(145deg, rgba(5, 30, 24, .9), rgba(3, 17, 14, .96));
  border-radius: 14px;
  padding: 15px;
  min-height: 165px;
  text-decoration: none;
  transition: .3s ease;
  position: relative;
  overflow: hidden;
}

.moduleCard:hover {
  transform: translateY(-6px);
  border-color: rgba(74, 255, 171, .4);
  box-shadow: 0 15px 32px rgba(0, 0, 0, .36);
}

.moduleOrb {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #61f496;
  background:
    radial-gradient(circle, rgba(67, 255, 157, .25), rgba(5, 42, 27, .2) 60%);
  border-bottom: 2px solid rgba(76, 255, 153, .45);
  box-shadow: 0 10px 18px rgba(12, 255, 131, .08);
  margin: 0 auto 12px;
  animation: moduleFloat 4s ease-in-out infinite;
}

.orb4,
.orb6 {
  color: #e0ae45;
  background:
    radial-gradient(circle, rgba(228, 175, 66, .2), rgba(67, 48, 6, .12) 60%);
  border-bottom-color: rgba(224, 173, 62, .5);
}

.moduleCard h3 {
  font-size: 12px;
  margin: 5px 0;
}

.moduleCard p {
  color: #82978f;
  font-size: 9px;
  line-height: 1.45;
  min-height: 39px;
}

.openLink {
  color: #8cf781;
  font-size: 9px;
}

footer {
  border-top: 1px solid rgba(55, 218, 146, .11);
  margin-top: 26px;
  padding: 18px 3px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  color: #657970;
  font-size: 9px;
}

.footerBrand {
  color: #d6ab4e;
  font-family: Georgia, serif;
  font-size: 18px;
}

.footerBrand small {
  color: #778c83;
  font-family: Arial, sans-serif;
  font-size: 8px;
  margin-left: 8px;
}

.loadingScreen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 15px;
  background: #020908;
  color: #7fa095;
}

.loadingLogo {
  color: #d7ab4d;
  font-family: Georgia, serif;
  font-size: 45px;
}

.loadingRing {
  width: 55px;
  height: 55px;
  border: 2px solid rgba(54, 255, 162, .12);
  border-top-color: #4dec8a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loadingScreen p {
  font-size: 11px;
  letter-spacing: 1px;
}

@keyframes pulse {
  0%, 100% { opacity: .45; transform: scale(.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes barGlow {
  from { opacity: .55; }
  to { opacity: 1; box-shadow: 0 0 7px rgba(67, 255, 154, .3); }
}

@keyframes globeFloat {
  0%, 100% { transform: translateY(0) rotateY(-4deg); }
  50% { transform: translateY(-7px) rotateY(7deg); }
}

@keyframes orbitSpin {
  from { transform: rotate(-15deg); }
  to { transform: rotate(345deg); }
}

@keyframes brainPulse {
  0%, 100% { transform: scale(.95); box-shadow: 0 0 12px rgba(58,255,158,.15); }
  50% { transform: scale(1.08); box-shadow: 0 0 28px rgba(58,255,158,.35); }
}

@keyframes nodeBlink {
  from { opacity: .25; transform: scale(.7); }
  to { opacity: 1; transform: scale(1.4); }
}

@keyframes growBar {
  from { width: 0; }
}

@keyframes moduleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .kpiGrid,
  .performanceGrid {
    grid-template-columns: repeat(2, 1fr);
  }

  .moduleGrid {
    grid-template-columns: repeat(3, 1fr);
  }

  .impactPanel {
    grid-template-columns: 1fr 1.3fr;
  }

  .impactMetrics {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .sidebar {
    width: 78px;
    padding: 20px 10px;
  }

  .brand > div:last-child,
  .navItem span,
  .partnerCard,
  .logoutButton:not(svg) {
  }

  .brandName,
  .brandTag {
    display: none;
  }

  .navItem {
    justify-content: center;
    padding: 13px;
  }

  .navItem span {
    display: none;
  }

  .partnerCard {
    display: none;
  }

  .logoutButton {
    justify-content: center;
    margin-top: auto;
    font-size: 0;
  }

  .workspace {
    margin-left: 78px;
    width: calc(100% - 78px);
  }

  .intelligenceGrid {
    grid-template-columns: 1fr;
  }

  .rightPanel {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .impactPanel {
    grid-template-columns: 1fr;
  }

  .globeScene {
    min-height: 250px;
  }

  .impactMetrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 650px) {
  .topbar {
    padding: 0 15px;
  }

  .profile > div:last-child {
    display: none;
  }

  .content {
    padding: 20px 14px;
  }

  .welcomeRow {
    flex-direction: column;
  }

  .kpiGrid,
  .performanceGrid,
  .moduleGrid,
  .rightPanel {
    grid-template-columns: 1fr;
  }

  .impactMetrics {
    grid-template-columns: 1fr 1fr;
  }

  footer {
    flex-direction: column;
  }
}
`;
