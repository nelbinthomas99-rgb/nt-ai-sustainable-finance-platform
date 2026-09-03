"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
};

export default function ReportingPeriodsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [client, setClient] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        const user = authData?.user;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        if (!active) return;
        setEmail(user.email || "");

        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id, client_code, client_name, status")
          .eq("owner_user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (clientError) throw clientError;
        if (!clientData) throw new Error("No active client profile is linked to this account.");
        if (!active) return;
        setClient(clientData);

        const { data: periodData, error: periodError } = await supabase
          .from("reporting_periods")
          .select("id, period_name, period_type, start_date, end_date, status, data_quality_status, created_at, updated_at, finalised_at")
          .eq("client_id", clientData.id)
          .order("start_date", { ascending: false });

        if (periodError) throw periodError;
        if (!active) return;

        const rows = periodData || [];
        setPeriods(rows);
        if (rows.length) setSelectedId(rows[0].id);
      } catch (e) {
        console.error(e);
        if (active) setError(e?.message || "Unable to load reporting periods.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [router]);

  const selected = useMemo(
    () => periods.find((period) => period.id === selectedId) || periods[0] || null,
    [periods, selectedId]
  );

  const qualityLabel = selected?.data_quality_status || "missing";
  const statusLabel = selected?.status || "draft";

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="loading">
        <style>{styles}</style>
        <div className="loaderOrb">NT</div>
        <h2>Loading Reporting Intelligence</h2>
        <p>Securing client-specific reporting periods…</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="brand"><span>NT</span><div><strong>N&T</strong><small>REPORTING INTELLIGENCE</small></div></div>
        <nav>
          <Link href="/">← Dashboard</Link>
          <Link className="active" href="/reporting-periods">Reporting Periods</Link>
          <Link href="/financial">Financial</Link>
          <Link href="/esg">ESG</Link>
          <Link href="/carbon-energy">Carbon & Energy</Link>
          <Link href="/sustainable-finance">Sustainable Finance</Link>
          <Link href="/ai-insights">AI Insights</Link>
        </nav>
        <div className="secure"><b>● Secure Session</b><span>Client data isolation enabled</span></div>
        <button onClick={logout}>Logout</button>
      </aside>

      <section className="content">
        <header>
          <div>
            <div className="eyebrow">N&T INTELLIGENCE ENGINE • DAY 5</div>
            <h1>Reporting <em>Intelligence</em></h1>
            <p>Client-specific reporting periods, data quality and historical reporting foundation.</p>
          </div>
          <div className="identity"><span>{client?.client_code || "—"}</span><div><b>{client?.client_name || "Client"}</b><small>{email}</small></div></div>
        </header>

        {error ? <div className="error">{error}</div> : null}

        <section className="hero">
          <div>
            <div className="eyebrow">ACTIVE REPORTING PERIOD</div>
            <h2>{selected?.period_name || "No reporting period"}</h2>
            <p>Select a reporting period to create a controlled time-based view of financial and sustainability performance.</p>
          </div>
          <div className="selectorWrap">
            <label>Reporting Period</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} disabled={!periods.length}>
              {periods.length ? periods.map((period) => (
                <option key={period.id} value={period.id}>{period.period_name}</option>
              )) : <option>No periods available</option>}
            </select>
          </div>
        </section>

        <section className="cards">
          <article><span>Period Type</span><strong>{selected?.period_type?.toUpperCase() || "—"}</strong><small>Monthly • Quarterly • Annual • Custom</small></article>
          <article><span>Period Status</span><strong className="green">{statusLabel.toUpperCase()}</strong><small>Draft → Open → Finalised</small></article>
          <article><span>Data Quality</span><strong className={qualityLabel === "complete" ? "green" : qualityLabel === "partial" ? "gold" : "muted"}>{qualityLabel.toUpperCase()}</strong><small>Completeness indicator</small></article>
          <article><span>Client Isolation</span><strong className="green">ENABLED</strong><small>{client?.client_code || "Client"} records only</small></article>
        </section>

        <section className="grid">
          <article className="panel">
            <div className="panelHead"><div><div className="eyebrow">PERIOD CONTROL</div><h3>{selected?.period_name || "Reporting Period"}</h3></div><span className="live">● LIVE DATA</span></div>
            <div className="timeline">
              <div><span>Start Date</span><b>{formatDate(selected?.start_date)}</b></div>
              <div className="line"><i /></div>
              <div><span>End Date</span><b>{formatDate(selected?.end_date)}</b></div>
            </div>
            <div className="detailRows">
              <div><span>Client</span><b>{client?.client_code || "—"}</b></div>
              <div><span>Reporting frequency</span><b>{selected?.period_type || "—"}</b></div>
              <div><span>Workflow status</span><b>{statusLabel}</b></div>
              <div><span>Data quality</span><b>{qualityLabel}</b></div>
              <div><span>Last updated</span><b>{selected?.updated_at ? new Date(selected.updated_at).toLocaleString("en-GB") : "—"}</b></div>
            </div>
          </article>

          <article className="panel intelligence">
            <div className="eyebrow">N&T HISTORICAL FOUNDATION</div>
            <h3>From snapshot to intelligence.</h3>
            <p>Reporting periods provide the time dimension required for historical comparisons, trend analysis, climate-financial modelling and future forecasting.</p>
            <div className="flow"><span>Financial</span><span>ESG</span><span>Carbon</span><span>Sustainable Finance</span></div>
            <div className="next"><b>Next Intelligence Layer</b><span>Historical trends → period comparison → percentage change → anomaly signals</span></div>
          </article>
        </section>

        <section className="periodList">
          <div className="panelHead"><div><div className="eyebrow">AVAILABLE PERIODS</div><h3>Reporting History</h3></div><span>{periods.length} period{periods.length === 1 ? "" : "s"}</span></div>
          {periods.length ? periods.map((period) => (
            <button key={period.id} className={`periodRow ${period.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(period.id)}>
              <div><b>{period.period_name}</b><small>{period.period_type}</small></div>
              <span>{formatDate(period.start_date)} — {formatDate(period.end_date)}</span>
              <i>{period.status}</i>
              <i>{period.data_quality_status}</i>
            </button>
          )) : <div className="empty">No reporting periods are available for this client.</div>}
        </section>
      </section>
    </main>
  );
}

const styles = `
*{box-sizing:border-box}body{margin:0;background:#00140f;color:#f5fff9;font-family:Inter,Arial,sans-serif}.shell{min-height:100vh;background:radial-gradient(circle at 75% 5%,rgba(0,255,153,.08),transparent 30%),#00140f;display:flex}.sidebar{width:260px;position:fixed;inset:0 auto 0 0;padding:28px 20px;background:linear-gradient(180deg,#00251c,#001711);border-right:1px solid #0c4637;display:flex;flex-direction:column}.brand{display:flex;align-items:center;gap:14px;margin-bottom:35px}.brand>span{width:50px;height:50px;border:1px solid #c9a73b;border-radius:50%;display:grid;place-items:center;color:#e5c45c;font-family:Georgia;font-weight:800}.brand strong{display:block;color:#e5c45c;font-family:Georgia;font-size:27px}.brand small{font-size:9px;letter-spacing:2px;color:#8da99f}.sidebar nav{display:grid;gap:8px}.sidebar nav a{color:#a9beb7;text-decoration:none;padding:13px 15px;border-radius:12px}.sidebar nav a:hover,.sidebar nav .active{color:white;background:#074c39;border:1px solid #0a8a61}.secure{margin-top:auto;border:1px solid #155b47;border-radius:14px;padding:16px;display:grid;gap:7px;color:#90afa4}.secure b{color:#4df5a3}.secure span{font-size:12px}.sidebar button{margin-top:14px;background:transparent;border:1px solid #21473c;color:white;border-radius:12px;padding:13px;cursor:pointer}.content{margin-left:260px;width:calc(100% - 260px);padding:38px 42px 70px}header{display:flex;justify-content:space-between;gap:25px;align-items:center;margin-bottom:28px}.eyebrow{color:#45efa1;font-size:11px;letter-spacing:2px;font-weight:800}h1{font-size:42px;margin:8px 0}h1 em{font-style:normal;color:#42e89b}header p,.hero p,.intelligence p{color:#8da99f;line-height:1.6}.identity{border:1px solid #175b47;border-radius:40px;padding:10px 18px 10px 10px;display:flex;align-items:center;gap:12px}.identity>span{width:42px;height:42px;border:1px solid #d0aa37;color:#e3bf4f;border-radius:50%;display:grid;place-items:center;font-weight:800}.identity small{display:block;color:#78988d;margin-top:3px}.hero{border:1px solid #11684d;border-radius:22px;padding:28px;background:linear-gradient(135deg,rgba(0,111,78,.22),rgba(1,28,21,.8));display:flex;justify-content:space-between;align-items:center;gap:25px}.hero h2{font-size:36px;margin:7px 0}.selectorWrap{min-width:270px}.selectorWrap label{display:block;font-size:11px;color:#79a595;margin-bottom:8px}.selectorWrap select{width:100%;background:#00291f;color:white;border:1px solid #17a875;border-radius:12px;padding:14px;font-weight:700}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:18px 0}.cards article,.panel,.periodList{border:1px solid #14533f;border-radius:18px;background:rgba(2,37,28,.7);padding:21px}.cards span{display:block;color:#8ba89e;font-size:13px}.cards strong{display:block;font-size:23px;margin:12px 0}.cards small{color:#67877c}.green{color:#42efa0!important}.gold{color:#e5bd4c!important}.muted{color:#94a39e!important}.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px}.panelHead{display:flex;justify-content:space-between;align-items:center}.panel h3,.periodList h3{font-size:24px;margin:6px 0}.live{font-size:11px;color:#45efa1;border:1px solid #176249;border-radius:20px;padding:7px 10px}.timeline{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;margin:35px 0}.timeline span{display:block;color:#78998e;font-size:12px;margin-bottom:7px}.line{height:2px;background:#17533f;position:relative}.line i{position:absolute;width:10px;height:10px;background:#43eca0;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);box-shadow:0 0 18px #43eca0}.detailRows{display:grid;gap:0}.detailRows div{display:flex;justify-content:space-between;padding:13px 0;border-top:1px solid #103d31}.detailRows span{color:#78998e}.detailRows b{text-transform:capitalize}.flow{display:flex;flex-wrap:wrap;gap:8px;margin:25px 0}.flow span{padding:9px 11px;border:1px solid #176048;border-radius:20px;color:#a8d6c5;font-size:12px}.next{padding:17px;border-left:3px solid #d3aa38;background:#09291f;display:grid;gap:7px}.next b{color:#e4bd4e}.next span{color:#8fac9f;font-size:13px;line-height:1.5}.periodList{margin-top:18px}.periodRow{width:100%;display:grid;grid-template-columns:1fr 1.5fr .6fr .6fr;align-items:center;text-align:left;gap:15px;padding:16px;margin-top:10px;border:1px solid #123f33;border-radius:13px;background:#00231a;color:white;cursor:pointer}.periodRow.selected{border-color:#21b77e;background:#06372a}.periodRow div{display:grid;gap:4px}.periodRow small,.periodRow>span{color:#7e9d91}.periodRow i{font-style:normal;text-transform:uppercase;color:#48e99f;font-size:11px}.empty,.error{padding:18px;border-radius:12px;margin-top:12px}.empty{color:#829e94}.error{background:#3a1717;border:1px solid #8d3838;color:#ffbcbc}.loading{min-height:100vh;background:#00140f;color:white;display:grid;place-content:center;text-align:center}.loaderOrb{width:85px;height:85px;border:1px solid #36e89a;border-radius:50%;display:grid;place-items:center;margin:auto;color:#e0b94a;font:700 25px Georgia;box-shadow:0 0 35px rgba(54,232,154,.25)}.loading p{color:#77998c}@media(max-width:1000px){.sidebar{position:static;width:100%;min-height:auto}.shell{display:block}.content{margin:0;width:100%;padding:25px}.sidebar nav{grid-template-columns:repeat(2,1fr)}.secure{margin-top:20px}.cards{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}}@media(max-width:650px){header,.hero{align-items:flex-start;flex-direction:column}.identity,.selectorWrap{width:100%}.cards{grid-template-columns:1fr}.periodRow{grid-template-columns:1fr 1fr}.content{padding:18px}h1{font-size:34px}}
`;
