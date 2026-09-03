"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

const money = (v) => v == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Number(v));
const number = (v, digits=1) => v == null ? "—" : Number(v).toFixed(digits);
const change = (v, suffix="%") => v == null ? "Awaiting comparison data" : `${Number(v) > 0 ? "↑" : Number(v) < 0 ? "↓" : "→"} ${Math.abs(Number(v)).toFixed(2)}${suffix}`;

export default function HistoricalIntelligencePage() {
  const router = useRouter();
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [client,setClient]=useState(null);
  const [email,setEmail]=useState("");
  const [rows,setRows]=useState([]);
  const [selected,setSelected]=useState("Q3 2026");

  useEffect(()=>{
    let alive=true;
    async function load(){
      try{
        const {data:auth,error:authError}=await supabase.auth.getUser();
        if(authError || !auth?.user){router.replace("/login");return;}
        if(!alive)return;
        setEmail(auth.user.email||"");
        const {data:c,error:ce}=await supabase.from("clients").select("id,client_code,client_name,status").eq("owner_user_id",auth.user.id).eq("status","active").order("created_at",{ascending:true}).limit(1).maybeSingle();
        if(ce)throw ce;
        if(!c)throw new Error("No active client profile is linked to this account.");
        if(!alive)return;
        setClient(c);
        const {data:h,error:he}=await supabase.from("client_period_trends").select("*").eq("client_id",c.id).order("start_date",{ascending:true});
        if(he)throw he;
        if(!alive)return;
        setRows(h||[]);
        const latest=[...(h||[])].reverse().find(r=>r.revenue!=null||r.overall_esg_score!=null||r.carbon_emissions_kg!=null||r.sustainable_finance_percentage!=null);
        if(latest)setSelected(latest.period_name);
      }catch(e){console.error(e);if(alive)setError(e?.message||"Unable to load historical intelligence.");}
      finally{if(alive)setLoading(false);}
    }
    load();
    const {data}=supabase.auth.onAuthStateChange((_e,s)=>{if(!s)router.replace("/login");});
    return()=>{alive=false;data.subscription.unsubscribe();};
  },[router]);

  const current=useMemo(()=>rows.find(r=>r.period_name===selected)||rows[0]||null,[rows,selected]);
  const maxRevenue=Math.max(1,...rows.map(r=>Number(r.revenue)||0));
  const maxCarbon=Math.max(1,...rows.map(r=>Number(r.carbon_emissions_kg)||0));

  async function logout(){await supabase.auth.signOut();router.replace("/login");}

  if(loading)return <main className="loading"><style>{css}</style><div className="orb">NT</div><h2>Loading Historical Intelligence</h2><p>Building secure client trend history…</p></main>;

  return <main className="shell"><style>{css}</style>
    <aside className="side">
      <div className="brand"><span>NT</span><div><b>N&T</b><small>HISTORICAL INTELLIGENCE</small></div></div>
      <nav><Link href="/">← Dashboard</Link><Link href="/reporting-periods">Reporting Periods</Link><Link className="active" href="/historical-intelligence">Historical Intelligence</Link><Link href="/financial">Financial</Link><Link href="/esg">ESG</Link><Link href="/carbon-energy">Carbon & Energy</Link><Link href="/sustainable-finance">Sustainable Finance</Link><Link href="/ai-insights">AI Insights</Link></nav>
      <div className="secure"><b>● Secure Session</b><span>Client isolation enabled</span></div><button onClick={logout}>Logout</button>
    </aside>
    <section className="content">
      <header><div><div className="eye">N&T INTELLIGENCE ENGINE • DAY 6</div><h1>Historical <em>Intelligence</em></h1><p>Period-by-period financial and sustainability performance with evidence-aware trend analysis.</p></div><div className="id"><span>{client?.client_code}</span><div><b>{client?.client_name}</b><small>{email}</small></div></div></header>
      {error&&<div className="error">{error}</div>}
      <section className="hero"><div><div className="eye">PERIOD ANALYSIS</div><h2>{current?.period_name||"No period"}</h2><p>Only recorded client data is displayed. Missing periods remain clearly marked rather than estimated.</p></div><select value={selected} onChange={e=>setSelected(e.target.value)}>{rows.map(r=><option key={r.reporting_period_id} value={r.period_name}>{r.period_name}</option>)}</select></section>
      <section className="cards">
        <Metric title="Revenue" value={money(current?.revenue)} trend={change(current?.revenue_change_percent)} />
        <Metric title="Net Profit" value={money(current?.net_profit)} trend={change(current?.profit_change_percent)} />
        <Metric title="ESG Score" value={current?.overall_esg_score==null?"—":`${number(current.overall_esg_score,1)}/100`} trend={change(current?.esg_change_points," pts")} />
        <Metric title="Carbon" value={current?.carbon_emissions_kg==null?"—":`${number(current.carbon_emissions_kg,1)} kg CO₂e`} trend={change(current?.carbon_change_percent)} inverse />
        <Metric title="Sustainable Finance" value={current?.sustainable_finance_percentage==null?"—":`${number(current.sustainable_finance_percentage,1)}%`} trend={change(current?.sustainable_finance_change_points," pts")} />
      </section>
      <section className="grid">
        <article className="panel"><div className="panelHead"><div><div className="eye">FINANCIAL HISTORY</div><h3>Revenue by Reporting Period</h3></div><span>LIVE DATA</span></div><div className="chart">{rows.map(r=><div className="barCol" key={r.reporting_period_id}><div className="barArea"><div className={`bar ${r.revenue==null?"empty":""}`} style={{height:r.revenue==null?"5%":`${Math.max(12,(Number(r.revenue)/maxRevenue)*100)}%`}}><i>{r.revenue==null?"No data":money(r.revenue)}</i></div></div><b>{r.period_name}</b></div>)}</div></article>
        <article className="panel"><div className="panelHead"><div><div className="eye">CARBON HISTORY</div><h3>Emissions by Reporting Period</h3></div><span>LIVE DATA</span></div><div className="chart">{rows.map(r=><div className="barCol" key={r.reporting_period_id}><div className="barArea"><div className={`bar gold ${r.carbon_emissions_kg==null?"empty":""}`} style={{height:r.carbon_emissions_kg==null?"5%":`${Math.max(12,(Number(r.carbon_emissions_kg)/maxCarbon)*100)}%`}}><i>{r.carbon_emissions_kg==null?"No data":`${number(r.carbon_emissions_kg,1)} kg`}</i></div></div><b>{r.period_name}</b></div>)}</div></article>
      </section>
      <section className="panel history"><div className="panelHead"><div><div className="eye">MULTI-METRIC HISTORY</div><h3>Reporting Period Evidence Matrix</h3></div><span>{rows.length} PERIODS</span></div><div className="table"><div className="tr th"><b>Period</b><b>Quality</b><b>Revenue</b><b>Profit</b><b>ESG</b><b>Carbon</b><b>Sust. Finance</b></div>{rows.map(r=><button className={`tr ${r.period_name===selected?"selected":""}`} key={r.reporting_period_id} onClick={()=>setSelected(r.period_name)}><b>{r.period_name}</b><span className={`quality ${r.data_quality_status}`}>{r.data_quality_status}</span><span>{money(r.revenue)}</span><span>{money(r.net_profit)}</span><span>{r.overall_esg_score==null?"—":number(r.overall_esg_score,1)}</span><span>{r.carbon_emissions_kg==null?"—":number(r.carbon_emissions_kg,1)}</span><span>{r.sustainable_finance_percentage==null?"—":`${number(r.sustainable_finance_percentage,1)}%`}</span></button>)}</div></section>
      <section className="intelligence"><div><div className="eye">N&T TREND ENGINE</div><h3>Evidence before prediction.</h3><p>Trend percentages are generated only when a valid previous period contains comparable data. Q1, Q2 and Q4 currently remain missing where genuine records have not been entered.</p></div><div className="flow"><span>Historical Data</span><i>→</i><span>Period Comparison</span><i>→</i><span>Trend Signals</span><i>→</i><span>Future Forecasting</span></div></section>
    </section>
  </main>;
}

function Metric({title,value,trend}){return <article><span>{title}</span><strong>{value}</strong><small>{trend}</small></article>}

const css=`
*{box-sizing:border-box}body{margin:0;background:#00140f;color:#f6fff9;font-family:Inter,Arial,sans-serif}.shell{min-height:100vh;background:radial-gradient(circle at 80% 0,rgba(0,255,153,.08),transparent 30%),#00140f;display:flex}.side{position:fixed;inset:0 auto 0 0;width:270px;padding:28px 20px;background:linear-gradient(180deg,#00251c,#001711);border-right:1px solid #0c4637;display:flex;flex-direction:column}.brand{display:flex;align-items:center;gap:14px;margin-bottom:30px}.brand>span{width:50px;height:50px;border:1px solid #c9a73b;border-radius:50%;display:grid;place-items:center;color:#e5c45c;font:800 17px Georgia}.brand b{display:block;color:#e5c45c;font:700 28px Georgia}.brand small{font-size:8px;letter-spacing:2px;color:#8da99f}.side nav{display:grid;gap:7px}.side a{color:#abc0b8;text-decoration:none;padding:12px 14px;border-radius:11px}.side a.active,.side a:hover{background:#07513c;color:white;border:1px solid #0c9668}.secure{margin-top:auto;border:1px solid #155b47;border-radius:14px;padding:15px;display:grid;gap:6px}.secure b{color:#4df5a3}.secure span{font-size:12px;color:#82a397}.side button{margin-top:12px;padding:12px;border-radius:11px;border:1px solid #24473d;background:transparent;color:white;cursor:pointer}.content{margin-left:270px;width:calc(100% - 270px);padding:36px 40px 70px}header{display:flex;justify-content:space-between;align-items:center;gap:25px;margin-bottom:25px}.eye{color:#45efa1;font-size:11px;letter-spacing:2px;font-weight:800}h1{font-size:42px;margin:8px 0}h1 em{font-style:normal;color:#43e99d}header p,.hero p,.intelligence p{color:#8ba99e;line-height:1.6}.id{display:flex;align-items:center;gap:12px;border:1px solid #185b47;border-radius:40px;padding:9px 16px 9px 9px}.id>span{width:43px;height:43px;border:1px solid #d1aa38;color:#e1bc4a;border-radius:50%;display:grid;place-items:center;font-weight:800}.id small{display:block;color:#78988d;margin-top:3px}.hero{border:1px solid #12664d;border-radius:20px;padding:26px;background:linear-gradient(135deg,rgba(0,108,77,.22),rgba(1,28,21,.8));display:flex;justify-content:space-between;align-items:center}.hero h2{font-size:34px;margin:7px 0}.hero select{min-width:220px;padding:14px;background:#00291f;border:1px solid #19a977;border-radius:12px;color:white;font-weight:800}.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:13px;margin:17px 0}.cards article,.panel{border:1px solid #14533f;border-radius:17px;background:rgba(2,37,28,.72);padding:19px}.cards span{color:#86a499;font-size:13px}.cards strong{display:block;font-size:23px;margin:12px 0}.cards small{color:#43e99d}.grid{display:grid;grid-template-columns:1fr 1fr;gap:17px}.panelHead{display:flex;justify-content:space-between;align-items:center}.panelHead h3{font-size:22px;margin:6px 0}.panelHead>span{font-size:10px;color:#45efa1;border:1px solid #176249;border-radius:20px;padding:6px 9px}.chart{height:260px;display:flex;align-items:end;gap:14px;padding-top:40px}.barCol{height:100%;flex:1;display:flex;flex-direction:column;justify-content:end;text-align:center;gap:9px}.barArea{height:190px;display:flex;align-items:end;justify-content:center}.bar{position:relative;width:58%;min-width:28px;background:linear-gradient(180deg,#3df09b,#0a6f4c);border-radius:7px 7px 2px 2px;box-shadow:0 0 20px rgba(61,240,155,.15)}.bar.gold{background:linear-gradient(180deg,#e2bd4d,#6f5610)}.bar.empty{background:#174237;box-shadow:none}.bar i{position:absolute;top:-25px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;font-style:normal;color:#91aea3}.barCol>b{font-size:11px;color:#9ab2aa}.history{margin-top:17px}.table{margin-top:16px;overflow-x:auto}.tr{min-width:850px;width:100%;display:grid;grid-template-columns:1fr .8fr 1fr 1fr .7fr .8fr 1fr;gap:10px;align-items:center;padding:14px;border:0;border-top:1px solid #123f33;background:transparent;color:white;text-align:left}.tr:not(.th){cursor:pointer}.tr.selected{background:#07392b}.tr span{color:#a1b7af}.quality{text-transform:uppercase!important;font-size:10px;font-weight:800}.quality.partial{color:#e2ba49}.quality.missing{color:#81958e}.quality.complete{color:#45efa1}.intelligence{margin-top:17px;border:1px solid #12664d;border-radius:18px;padding:24px;background:linear-gradient(90deg,#043125,#09261e);display:flex;justify-content:space-between;align-items:center;gap:25px}.intelligence h3{font-size:25px;margin:7px 0}.flow{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.flow span{padding:9px 11px;border:1px solid #1a684f;border-radius:20px;color:#a7d3c3;font-size:11px}.flow i{color:#d9b343}.error{padding:15px;background:#3a1717;border:1px solid #8d3838;color:#ffbcbc;border-radius:12px;margin-bottom:15px}.loading{min-height:100vh;background:#00140f;color:white;display:grid;place-content:center;text-align:center}.orb{width:84px;height:84px;border:1px solid #39e99b;border-radius:50%;display:grid;place-items:center;margin:auto;color:#dfb94a;font:700 24px Georgia;box-shadow:0 0 35px rgba(57,233,155,.25)}.loading p{color:#78998d}@media(max-width:1150px){.cards{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}}@media(max-width:850px){.side{position:static;width:100%;min-height:auto}.shell{display:block}.content{margin:0;width:100%;padding:22px}.secure{margin-top:20px}header,.hero,.intelligence{align-items:flex-start;flex-direction:column}.id,.hero select{width:100%}.cards{grid-template-columns:1fr}}
`;
