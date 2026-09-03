"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const fmt = (value, suffix = "") =>
  value === null || value === undefined ? "Awaiting data" : `${value}${suffix}`;

function RiskCard({ icon, title, value, description }) {
  const available = value !== null && value !== undefined;

  return (
    <div className="riskCard">
      <div className="riskTop">
        <span className="riskIcon">{icon}</span>
        <span className={available ? "status live" : "status pending"}>
          {available ? "ASSESSED" : "AWAITING DATA"}
        </span>
      </div>

      <div className="riskTitle">{title}</div>

      <div className={available ? "riskValue" : "riskValue empty"}>
        {available ? `${value}/100` : "—"}
      </div>

      <div className="riskDescription">{description}</div>

      <div className="riskTrack">
        <div
          className="riskFill"
          style={{ width: available ? `${Math.min(Number(value), 100)}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function ClimateRiskPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [client, setClient] = useState(null);
  const [climate, setClimate] = useState(null);

  useEffect(() => {
    loadClimateIntelligence();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.push("/login");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadClimateIntelligence() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setEmail(user.email || "");

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id, client_code, client_name, status")
      .eq("owner_user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (clientError || !clientData) {
      setLoading(false);
      return;
    }

    setClient(clientData);

    const { data: climateData } = await supabase
      .from("client_climate_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .maybeSingle();

    setClimate(climateData || null);
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="loadingScreen">
        <div className="loader" />
        <h2>N&T Climate Intelligence</h2>
        <p>Loading climate-risk environment...</p>

        <style jsx>{`
          .loadingScreen {
            min-height: 100vh;
            background: #001c16;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
          }

          .loader {
            width: 46px;
            height: 46px;
            border: 3px solid #174b3e;
            border-top-color: #35e99a;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  const location = climate?.location_name || "Location not configured";
  const country = climate?.country || "";
  const overall = climate?.overall_physical_risk_score;
  const hasAssessment = overall !== null && overall !== undefined;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandCircle">NT</div>
          <div>
            <div className="brandName">N&T</div>
            <div className="brandSub">CLIMATE INTELLIGENCE</div>
          </div>
        </div>

        <nav>
          <Link href="/">← Dashboard</Link>
          <Link href="/reporting-periods">Reporting Periods</Link>
          <Link href="/historical-intelligence">Historical Intelligence</Link>
          <Link href="/financial">Financial</Link>
          <Link href="/esg">ESG</Link>
          <Link href="/carbon-energy">Carbon & Energy</Link>
          <Link href="/sustainable-finance">Sustainable Finance</Link>
          <Link href="/climate-risk" className="active">
            Climate Risk
          </Link>
          <Link href="/ai-insights">AI Insights</Link>
        </nav>

        <div className="secure">
          <strong>● Secure Session</strong>
          <span>Client isolation enabled</span>
        </div>

        <button onClick={logout} className="logout">
          Logout
        </button>
      </aside>

      <section className="content">
        <header>
          <div>
            <div className="eyebrow">N&T CLIMATE RISK ENGINE</div>
            <h1>
              Climate Risk <span>Intelligence</span>
            </h1>
            <p>
              Connecting climate exposure with financial, ESG and
              sustainability intelligence.
            </p>
          </div>

          <div className="clientBox">
            <div className="clientCode">{client?.client_code || "—"}</div>
            <div>
              <strong>{client?.client_name || "Client"}</strong>
              <small>{email}</small>
            </div>
          </div>
        </header>

        <section className="hero">
          <div className="heroText">
            <div className="eyebrow">PHYSICAL CLIMATE RISK</div>

            <h2>
              From climate exposure
              <br />
              to <span>financial resilience.</span>
            </h2>

            <p>
              N&T Climate Intelligence is designed to combine location,
              physical climate hazards, financial exposure and sustainability
              information into one client-specific decision layer.
            </p>

            <div className="tags">
              <span>Flood</span>
              <span>Heat</span>
              <span>Storm</span>
              <span>Drought</span>
              <span>Financial Exposure</span>
            </div>
          </div>

          <div className="climateVisual">
            <div className="orbit orbit1" />
            <div className="orbit orbit2" />
            <div className="planet">
              <div className="planetInner">CRI</div>
            </div>
            <div className="pulse p1" />
            <div className="pulse p2" />
            <div className="pulse p3" />
          </div>

          <div className="overallBox">
            <small>OVERALL PHYSICAL RISK</small>

            <div className={hasAssessment ? "overallValue" : "overallValue empty"}>
              {hasAssessment ? `${overall}/100` : "PENDING"}
            </div>

            <div className="riskLabel">
              {climate?.risk_level
                ? climate.risk_level.toUpperCase()
                : "NO VERIFIED ASSESSMENT"}
            </div>

            <div className="method">
              Methodology
              <strong>{climate?.methodology_version || "NT-CRI-v1"}</strong>
            </div>
          </div>
        </section>

        <section className="locationGrid">
          <div className="infoCard">
            <small>CLIENT LOCATION</small>
            <strong>{location}</strong>
            <span>{country}</span>
          </div>

          <div className="infoCard">
            <small>ASSESSMENT STATUS</small>
            <strong className="green">
              {(climate?.assessment_status || "Not configured").toUpperCase()}
            </strong>
            <span>Climate profile status</span>
          </div>

          <div className="infoCard">
            <small>DATA STATUS</small>
            <strong className={climate?.data_status === "live" ? "green" : "gold"}>
              {(climate?.data_status || "Awaiting assessment").toUpperCase()}
            </strong>
            <span>Provenance-aware intelligence</span>
          </div>

          <div className="infoCard">
            <small>FINANCIAL EXPOSURE</small>
            <strong>
              {climate?.estimated_financial_exposure !== null &&
              climate?.estimated_financial_exposure !== undefined
                ? `£${Number(
                    climate.estimated_financial_exposure
                  ).toLocaleString("en-GB")}`
                : "Awaiting data"}
            </strong>
            <span>Climate-linked exposure estimate</span>
          </div>
        </section>

        <section className="sectionHeading">
          <div>
            <div className="eyebrow">MULTI-HAZARD INTELLIGENCE</div>
            <h2>Physical Climate Risk Matrix</h2>
          </div>

          <span className="prototypeBadge">
            {hasAssessment ? "ASSESSMENT AVAILABLE" : "NO FABRICATED SCORES"}
          </span>
        </section>

        <section className="riskGrid">
          <RiskCard
            icon="≈"
            title="Flood Risk"
            value={climate?.flood_score}
            description="Exposure to flooding and potential disruption to operations, assets and supply chains."
          />

          <RiskCard
            icon="☀"
            title="Extreme Heat"
            value={climate?.heat_score}
            description="Potential exposure to heat stress, productivity impacts and cooling requirements."
          />

          <RiskCard
            icon="↯"
            title="Storm Risk"
            value={climate?.storm_score}
            description="Potential operational and asset exposure associated with severe storm conditions."
          />

          <RiskCard
            icon="◌"
            title="Drought / Water Stress"
            value={climate?.drought_score}
            description="Potential sensitivity to water availability and prolonged dry conditions."
          />
        </section>

        <section className="intelligenceGrid">
          <div className="intelligencePanel">
            <div className="eyebrow">CLIMATE × FINANCE</div>
            <h2>Climate-Financial Intelligence Layer</h2>

            <div className="flow">
              <div>
                <b>01</b>
                <strong>Client Location</strong>
                <span>{location}</span>
              </div>

              <div className="arrow">→</div>

              <div>
                <b>02</b>
                <strong>Hazard Exposure</strong>
                <span>Flood • Heat • Storm • Drought</span>
              </div>

              <div className="arrow">→</div>

              <div>
                <b>03</b>
                <strong>Business Impact</strong>
                <span>Assets • Operations • Revenue</span>
              </div>

              <div className="arrow">→</div>

              <div>
                <b>04</b>
                <strong>Resilience Action</strong>
                <span>Mitigation • Adaptation • Monitoring</span>
              </div>
            </div>
          </div>

          <div className="actionPanel">
            <div className="eyebrow">RESILIENCE SIGNAL</div>
            <h2>Recommended Action</h2>

            <p>
              {climate?.recommended_action ||
                "No climate-risk recommendation has been generated because verified or scenario assessment data has not yet been recorded."}
            </p>

            <div className="dataIntegrity">
              <strong>✓ Data Integrity Control</strong>
              <span>
                Missing climate observations remain missing. The platform does
                not convert unavailable hazard data into invented risk scores.
              </span>
            </div>
          </div>
        </section>

        <section className="future">
          <div>
            <div className="eyebrow">N&T INNOVATION ROADMAP</div>
            <h2>Climate intelligence architecture</h2>
            <p>
              The current module establishes the secure climate-risk data and
              decision architecture. External weather and climate datasets can
              later feed the assessment layer through controlled integrations.
            </p>
          </div>

          <div className="roadmap">
            <span>Client Data</span>
            <b>→</b>
            <span>Location</span>
            <b>→</b>
            <span>Climate Data</span>
            <b>→</b>
            <span>Risk Engine</span>
            <b>→</b>
            <span>Financial Impact</span>
            <b>→</b>
            <span>Action</span>
          </div>
        </section>
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #001b15;
        }

        .shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at 72% 15%, rgba(26, 181, 112, 0.08), transparent 28%),
            linear-gradient(135deg, #001a14, #00231b 55%, #001710);
          color: #f4fff9;
          font-family: Arial, Helvetica, sans-serif;
          display: flex;
        }

        .sidebar {
          width: 290px;
          min-height: 100vh;
          border-right: 1px solid #155241;
          padding: 34px 21px;
          position: fixed;
          left: 0;
          top: 0;
          background: rgba(0, 39, 30, 0.97);
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .brand {
          display: flex;
          gap: 15px;
          align-items: center;
          margin-bottom: 38px;
        }

        .brandCircle {
          width: 55px;
          height: 55px;
          border: 1px solid #d8ad37;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #e8be4c;
          font-weight: 800;
        }

        .brandName {
          color: #e5bd50;
          font-family: Georgia, serif;
          font-size: 31px;
          font-weight: 700;
        }

        .brandSub {
          color: #85b8a6;
          letter-spacing: 3px;
          font-size: 9px;
          margin-top: 4px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        nav a {
          color: #b7d1c8;
          text-decoration: none;
          padding: 14px 16px;
          border-radius: 10px;
          font-size: 16px;
          transition: 0.2s;
        }

        nav a:hover,
        nav a.active {
          color: white;
          background: #075a43;
          border: 1px solid #15996f;
        }

        .secure {
          margin-top: auto;
          border: 1px solid #14624c;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #35efa4;
        }

        .secure span {
          color: #83ad9e;
          font-size: 12px;
        }

        .logout {
          margin-top: 15px;
          background: transparent;
          border: 1px solid #194c3e;
          color: white;
          padding: 13px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 15px;
        }

        .content {
          margin-left: 290px;
          width: calc(100% - 290px);
          padding: 38px 44px 70px;
        }

        header {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          align-items: center;
          margin-bottom: 28px;
        }

        .eyebrow {
          color: #36efa6;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          margin-bottom: 8px;
        }

        h1 {
          font-size: 42px;
          margin: 0 0 8px;
        }

        h1 span,
        .hero h2 span {
          color: #37e69c;
        }

        header p,
        .hero p,
        .future p {
          color: #8fb4a6;
          line-height: 1.65;
          margin: 0;
        }

        .clientBox {
          border: 1px solid #17604a;
          border-radius: 18px;
          padding: 13px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 370px;
        }

        .clientCode {
          width: 47px;
          height: 47px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid #d9ad38;
          color: #e6bd4b;
          font-weight: 800;
        }

        .clientBox strong,
        .clientBox small {
          display: block;
        }

        .clientBox small {
          color: #769f91;
          margin-top: 4px;
        }

        .hero {
          border: 1px solid #14644d;
          border-radius: 24px;
          min-height: 350px;
          padding: 36px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 0.65fr;
          gap: 25px;
          align-items: center;
          overflow: hidden;
          background:
            radial-gradient(circle at 52% 50%, rgba(37, 229, 151, 0.13), transparent 26%),
            rgba(1, 47, 36, 0.55);
        }

        .hero h2 {
          font-size: 38px;
          line-height: 1.12;
          margin: 0 0 17px;
        }

        .heroText p {
          max-width: 570px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }

        .tags span,
        .roadmap span {
          border: 1px solid #17795b;
          border-radius: 30px;
          padding: 8px 12px;
          color: #bce0d3;
          font-size: 12px;
        }

        .climateVisual {
          height: 250px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .planet {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 35% 30%, #42f0ac, #0b8b64 42%, #003b2d 72%);
          box-shadow:
            0 0 35px rgba(50, 239, 164, 0.35),
            inset -20px -20px 35px rgba(0, 0, 0, 0.35);
          display: grid;
          place-items: center;
          z-index: 3;
          animation: float 4s ease-in-out infinite;
        }

        .planetInner {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.35);
          display: grid;
          place-items: center;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .orbit {
          position: absolute;
          border: 1px solid rgba(53, 235, 162, 0.35);
          border-radius: 50%;
        }

        .orbit1 {
          width: 210px;
          height: 100px;
          transform: rotate(18deg);
          animation: orbit 8s linear infinite;
        }

        .orbit2 {
          width: 210px;
          height: 100px;
          transform: rotate(-45deg);
          animation: orbit2 11s linear infinite;
        }

        .pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #3deda8;
          box-shadow: 0 0 14px #3deda8;
          position: absolute;
        }

        .p1 {
          top: 35px;
          left: 35%;
        }

        .p2 {
          right: 15%;
          top: 48%;
        }

        .p3 {
          left: 15%;
          bottom: 30px;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes orbit {
          to {
            transform: rotate(378deg);
          }
        }

        @keyframes orbit2 {
          to {
            transform: rotate(315deg);
          }
        }

        .overallBox {
          border-left: 1px solid #175b47;
          padding-left: 27px;
        }

        .overallBox small {
          color: #7da99a;
          letter-spacing: 1px;
        }

        .overallValue {
          font-size: 42px;
          font-weight: 900;
          color: #38e69d;
          margin: 12px 0;
        }

        .overallValue.empty {
          color: #e1b642;
          font-size: 30px;
        }

        .riskLabel {
          color: #a8c6bb;
          font-size: 12px;
          margin-bottom: 25px;
        }

        .method {
          border-top: 1px solid #154c3d;
          padding-top: 15px;
          color: #739b8c;
          font-size: 12px;
        }

        .method strong {
          display: block;
          color: white;
          margin-top: 6px;
        }

        .locationGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin: 20px 0 36px;
        }

        .infoCard,
        .riskCard,
        .intelligencePanel,
        .actionPanel,
        .future {
          border: 1px solid #145d49;
          background: rgba(2, 47, 36, 0.58);
          border-radius: 18px;
        }

        .infoCard {
          padding: 22px;
        }

        .infoCard small,
        .infoCard strong,
        .infoCard span {
          display: block;
        }

        .infoCard small {
          color: #78a393;
          margin-bottom: 13px;
        }

        .infoCard strong {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .infoCard span {
          color: #789f91;
          font-size: 12px;
        }

        .green {
          color: #3aefa8;
        }

        .gold {
          color: #e2b842;
        }

        .sectionHeading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          margin-bottom: 16px;
        }

        .sectionHeading h2,
        .intelligencePanel h2,
        .actionPanel h2,
        .future h2 {
          margin: 0;
          font-size: 27px;
        }

        .prototypeBadge {
          color: #e1b741;
          border: 1px solid #766321;
          padding: 8px 12px;
          border-radius: 30px;
          font-size: 11px;
        }

        .riskGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .riskCard {
          padding: 22px;
        }

        .riskTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .riskIcon {
          font-size: 27px;
          color: #3ce7a1;
        }

        .status {
          font-size: 9px;
          border-radius: 20px;
          padding: 6px 8px;
        }

        .status.live {
          color: #3ce7a1;
          border: 1px solid #167c5b;
        }

        .status.pending {
          color: #d9b23f;
          border: 1px solid #67591f;
        }

        .riskTitle {
          margin-top: 24px;
          color: #a9c7bc;
        }

        .riskValue {
          font-size: 34px;
          font-weight: 900;
          margin: 8px 0 13px;
        }

        .riskValue.empty {
          color: #6d9788;
        }

        .riskDescription {
          color: #789f91;
          line-height: 1.5;
          font-size: 12px;
          min-height: 55px;
        }

        .riskTrack {
          height: 5px;
          background: #0d4638;
          border-radius: 20px;
          overflow: hidden;
          margin-top: 18px;
        }

        .riskFill {
          height: 100%;
          background: linear-gradient(90deg, #24d38f, #e2b53f);
          border-radius: 20px;
        }

        .intelligenceGrid {
          display: grid;
          grid-template-columns: 1.5fr 0.75fr;
          gap: 18px;
          margin-bottom: 20px;
        }

        .intelligencePanel,
        .actionPanel {
          padding: 27px;
        }

        .flow {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          gap: 10px;
          align-items: center;
          margin-top: 30px;
        }

        .flow > div:not(.arrow) {
          border: 1px solid #145e49;
          padding: 16px;
          border-radius: 12px;
          min-height: 105px;
        }

        .flow b,
        .flow strong,
        .flow span {
          display: block;
        }

        .flow b {
          color: #e0b53e;
          font-size: 11px;
          margin-bottom: 12px;
        }

        .flow strong {
          margin-bottom: 8px;
        }

        .flow span {
          color: #739b8c;
          font-size: 11px;
          line-height: 1.4;
        }

        .arrow {
          color: #d9ae39;
        }

        .actionPanel p {
          color: #96b8ac;
          line-height: 1.6;
        }

        .dataIntegrity {
          border-left: 2px solid #3ce7a1;
          background: rgba(36, 205, 140, 0.06);
          padding: 15px;
          margin-top: 20px;
        }

        .dataIntegrity strong,
        .dataIntegrity span {
          display: block;
        }

        .dataIntegrity strong {
          color: #3be7a1;
          margin-bottom: 8px;
        }

        .dataIntegrity span {
          color: #7fa596;
          font-size: 12px;
          line-height: 1.5;
        }

        .future {
          padding: 28px;
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 30px;
          align-items: center;
        }

        .future p {
          margin-top: 13px;
        }

        .roadmap {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .roadmap b {
          color: #e0b53d;
        }

        @media (max-width: 1100px) {
          .sidebar {
            position: static;
            width: 100%;
            min-height: auto;
          }

          .shell {
            display: block;
          }

          .content {
            margin-left: 0;
            width: 100%;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .locationGrid,
          .riskGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .intelligenceGrid,
          .future {
            grid-template-columns: 1fr;
          }

          .flow {
            grid-template-columns: 1fr;
          }

          .arrow {
            display: none;
          }
        }

        @media (max-width: 650px) {
          .content {
            padding: 25px 17px;
          }

          header {
            align-items: flex-start;
            flex-direction: column;
          }

          h1 {
            font-size: 32px;
          }

          .hero h2 {
            font-size: 31px;
          }

          .locationGrid,
          .riskGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
