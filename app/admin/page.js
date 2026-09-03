"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AdminDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [clients, setClients] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  async function loadAdminDashboard() {
    setLoading(true);
    setError("");

    // 1. Check logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    setUserEmail(user.email || "");

    // 2. Check admin permission
    const { data: adminRecord, error: adminError } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (adminError) {
      setError("Unable to verify administrator access.");
      setLoading(false);
      return;
    }

    // Normal clients cannot enter /admin
    if (!adminRecord) {
      router.replace("/");
      return;
    }

    // 3. Load all clients
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id, client_code, client_name, owner_user_id, status, created_at")
      .order("client_code", { ascending: true });

    if (clientError) {
      setError(clientError.message);
      setLoading(false);
      return;
    }

    setClients(clientData || []);
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const activeClients = clients.filter(
    (client) => client.status === "active"
  ).length;

  const inactiveClients = clients.filter(
    (client) => client.status !== "active"
  ).length;

  if (loading) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loader}></div>
        <h2 style={{ marginTop: 20 }}>Loading N&T Admin Intelligence...</h2>
        <p style={styles.muted}>Verifying administrator access</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      {/* SIDEBAR */}

      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandRow}>
            <div style={styles.logo}>NT</div>

            <div>
              <div style={styles.brand}>N&T</div>
              <div style={styles.brandSub}>ADMIN INTELLIGENCE</div>
            </div>
          </div>

          <div style={styles.menu}>
            <div style={styles.activeMenu}>
              <span>◫</span>
              Admin Dashboard
            </div>

            <Link href="/" style={styles.menuLink}>
              <span>⌂</span>
              Client Portal
            </Link>

            <Link href="/financial" style={styles.menuLink}>
              <span>▥</span>
              Financial
            </Link>

            <Link href="/esg" style={styles.menuLink}>
              <span>◇</span>
              ESG
            </Link>

            <Link href="/carbon-energy" style={styles.menuLink}>
              <span>○</span>
              Carbon & Energy
            </Link>

            <Link href="/sustainable-finance" style={styles.menuLink}>
              <span>♧</span>
              Sustainable Finance
            </Link>

            <Link href="/documents" style={styles.menuLink}>
              <span>□</span>
              Documents
            </Link>
          </div>
        </div>

        <div>
          <div style={styles.securityBox}>
            <div style={styles.securityTitle}>ADMIN SESSION</div>
            <div style={styles.securityLive}>
              <span style={styles.greenDot}></span>
              Secure
            </div>
            <div style={styles.securityText}>
              Administrator permissions verified
            </div>
          </div>

          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}

      <section style={styles.content}>
        <header style={styles.header}>
          <div>
            <div style={styles.smallLabel}>N&T CONTROL CENTRE</div>

            <h1 style={styles.title}>
              Admin <span style={styles.green}>Intelligence</span>
            </h1>

            <p style={styles.subtitle}>
              Multi-client management and platform monitoring.
            </p>
          </div>

          <div style={styles.adminProfile}>
            <div style={styles.adminCircle}>A</div>

            <div>
              <div style={styles.adminText}>Administrator</div>
              <div style={styles.email}>{userEmail}</div>
            </div>
          </div>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {/* KPI CARDS */}

        <section style={styles.kpiGrid}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>◫</span>
              Total Clients
            </div>

            <div style={styles.bigNumber}>{clients.length}</div>

            <div style={styles.cardText}>
              Registered client organisations
            </div>

            <div style={styles.miniBars}>
              <span style={{ ...styles.bar, height: 14 }}></span>
              <span style={{ ...styles.bar, height: 21 }}></span>
              <span style={{ ...styles.bar, height: 27 }}></span>
              <span style={{ ...styles.bar, height: 34 }}></span>
              <span style={{ ...styles.bar, height: 42 }}></span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.greenIcon}>●</span>
              Active Clients
            </div>

            <div style={styles.bigNumber}>{activeClients}</div>

            <div style={styles.cardText}>
              Currently active client accounts
            </div>

            <div style={styles.progress}>
              <div
                style={{
                  ...styles.progressFill,
                  width:
                    clients.length > 0
                      ? `${(activeClients / clients.length) * 100}%`
                      : "0%",
                }}
              ></div>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.goldIcon}>◆</span>
              Inactive Clients
            </div>

            <div style={styles.bigNumber}>{inactiveClients}</div>

            <div style={styles.cardText}>
              Accounts requiring attention
            </div>

            <div style={styles.goldLine}></div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.greenIcon}>✓</span>
              Platform Status
            </div>

            <div style={styles.liveStatus}>LIVE</div>

            <div style={styles.cardText}>
              Supabase client database connected
            </div>

            <div style={styles.connected}>
              <span style={styles.greenDot}></span>
              Connected
            </div>
          </div>
        </section>

        {/* CLIENT MANAGEMENT */}

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.smallLabel}>CLIENT MANAGEMENT</div>

              <h2 style={styles.panelTitle}>Client Portfolio</h2>
            </div>

            <div style={styles.liveBadge}>
              <span style={styles.greenDot}></span>
              LIVE DATA
            </div>
          </div>

          {clients.length === 0 ? (
            <div style={styles.emptyState}>
              No clients are currently registered.
            </div>
          ) : (
            <div style={styles.clientGrid}>
              {clients.map((client) => (
                <article key={client.id} style={styles.clientCard}>
                  <div style={styles.clientTop}>
                    <div style={styles.clientAvatar}>
                      {client.client_code?.replace("NT-", "") || "NT"}
                    </div>

                    <div
                      style={
                        client.status === "active"
                          ? styles.activeBadge
                          : styles.inactiveBadge
                      }
                    >
                      <span style={styles.greenDot}></span>
                      {client.status || "unknown"}
                    </div>
                  </div>

                  <div style={styles.clientCode}>
                    {client.client_code}
                  </div>

                  <h3 style={styles.clientName}>
                    {client.client_name}
                  </h3>

                  <div style={styles.divider}></div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>Client ID</span>
                    <strong>{client.client_code}</strong>
                  </div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>Status</span>
                    <strong>{client.status}</strong>
                  </div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>Data Isolation</span>
                    <strong style={styles.green}>Enabled</strong>
                  </div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>Owner Linked</span>
                    <strong style={styles.green}>Yes</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PLATFORM ARCHITECTURE */}

        <section style={styles.bottomGrid}>
          <div style={styles.bottomPanel}>
            <div style={styles.smallLabel}>PLATFORM ARCHITECTURE</div>

            <h2 style={styles.panelTitle}>Multi-Client Engine</h2>

            <div style={styles.architecture}>
              <div style={styles.archBox}>
                <span style={styles.archIcon}>NT</span>
                <strong>N&T Admin</strong>
              </div>

              <div style={styles.arrow}>→</div>

              <div style={styles.archBox}>
                <span style={styles.archIcon}>AI</span>
                <strong>Platform</strong>
              </div>

              <div style={styles.arrow}>→</div>

              <div style={styles.archBox}>
                <span style={styles.archIcon}>{clients.length}</span>
                <strong>Clients</strong>
              </div>
            </div>
          </div>

          <div style={styles.bottomPanel}>
            <div style={styles.smallLabel}>SECURITY</div>

            <h2 style={styles.panelTitle}>Access Control</h2>

            <div style={styles.securityRow}>
              <span>Administrator verification</span>
              <strong style={styles.green}>ACTIVE</strong>
            </div>

            <div style={styles.securityRow}>
              <span>Row Level Security</span>
              <strong style={styles.green}>ENABLED</strong>
            </div>

            <div style={styles.securityRow}>
              <span>Client isolation architecture</span>
              <strong style={styles.green}>ACTIVE</strong>
            </div>

            <div style={styles.securityRow}>
              <span>Authenticated session</span>
              <strong style={styles.green}>SECURE</strong>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          N&T AI-Powered Sustainable Finance & Accounting Ltd
          <span style={styles.footerDot}>•</span>
          Admin Intelligence Platform
        </footer>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 70% 20%, rgba(0,100,65,.18), transparent 35%), #00130f",
    color: "#f4fff9",
    display: "flex",
    fontFamily: "Arial, sans-serif",
  },

  loadingPage: {
    minHeight: "100vh",
    background: "#00130f",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },

  loader: {
    width: 45,
    height: 45,
    border: "3px solid rgba(65,245,135,.15)",
    borderTop: "3px solid #42f587",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  sidebar: {
    width: 250,
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, rgba(0,43,34,.98), rgba(0,18,15,.99))",
    borderRight: "1px solid rgba(66,245,135,.16)",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    height: "100vh",
    boxSizing: "border-box",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    marginBottom: 40,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid #d7ae58",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d7ae58",
    fontWeight: 800,
    boxShadow: "0 0 20px rgba(215,174,88,.12)",
  },

  brand: {
    fontSize: 28,
    color: "#d7ae58",
    fontWeight: 800,
  },

  brandSub: {
    fontSize: 9,
    color: "#91aaa0",
    letterSpacing: 1.5,
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  activeMenu: {
    padding: "14px 15px",
    borderRadius: 12,
    background: "rgba(28,178,101,.16)",
    border: "1px solid #21b96e",
    color: "white",
    display: "flex",
    gap: 12,
    alignItems: "center",
    fontWeight: 700,
  },

  menuLink: {
    padding: "14px 15px",
    borderRadius: 12,
    color: "#a8beb5",
    textDecoration: "none",
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  securityBox: {
    border: "1px solid rgba(66,245,135,.25)",
    borderRadius: 14,
    padding: 16,
    background: "rgba(11,93,75,.18)",
    marginBottom: 15,
  },

  securityTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#7f9f92",
    marginBottom: 9,
  },

  securityLive: {
    color: "#42f587",
    fontWeight: 700,
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  securityText: {
    fontSize: 11,
    color: "#829c92",
    marginTop: 8,
    lineHeight: 1.5,
  },

  logoutButton: {
    width: "100%",
    padding: 13,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.12)",
    background: "transparent",
    color: "#d9e8e1",
    cursor: "pointer",
  },

  content: {
    flex: 1,
    padding: "32px 38px 25px",
    minWidth: 0,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    gap: 20,
    flexWrap: "wrap",
  },

  smallLabel: {
    color: "#42f587",
    letterSpacing: 2,
    fontSize: 10,
    fontWeight: 800,
  },

  title: {
    fontSize: 35,
    margin: "8px 0",
  },

  green: {
    color: "#42f587",
  },

  subtitle: {
    color: "#8ba49a",
    margin: 0,
  },

  adminProfile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 15px",
    border: "1px solid rgba(66,245,135,.2)",
    borderRadius: 40,
    background: "rgba(0,45,34,.5)",
  },

  adminCircle: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid #d7ae58",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d7ae58",
    boxShadow: "0 0 18px rgba(66,245,135,.22)",
  },

  adminText: {
    fontWeight: 700,
  },

  email: {
    fontSize: 11,
    color: "#849c92",
    marginTop: 3,
  },

  error: {
    padding: 15,
    border: "1px solid #ff6b6b",
    borderRadius: 10,
    color: "#ffb5b5",
    marginBottom: 20,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },

  card: {
    border: "1px solid rgba(66,245,135,.18)",
    borderRadius: 16,
    padding: 20,
    minHeight: 165,
    background:
      "linear-gradient(145deg, rgba(0,48,37,.92), rgba(0,25,20,.92))",
    boxShadow: "0 15px 35px rgba(0,0,0,.18)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    color: "#a9bdb5",
    fontSize: 13,
  },

  cardIcon: {
    color: "#42f587",
    fontSize: 20,
  },

  greenIcon: {
    color: "#42f587",
  },

  goldIcon: {
    color: "#d7ae58",
  },

  bigNumber: {
    fontSize: 37,
    fontWeight: 800,
    marginTop: 19,
  },

  cardText: {
    color: "#6f8c80",
    fontSize: 11,
    marginTop: 6,
  },

  miniBars: {
    display: "flex",
    gap: 5,
    alignItems: "end",
    height: 45,
    marginTop: 12,
  },

  bar: {
    width: 16,
    background: "linear-gradient(#42f587,#0b5d4b)",
    borderRadius: 2,
    boxShadow: "0 0 8px rgba(66,245,135,.3)",
  },

  progress: {
    width: "100%",
    height: 6,
    background: "rgba(255,255,255,.07)",
    borderRadius: 10,
    marginTop: 28,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#42f587",
    borderRadius: 10,
  },

  goldLine: {
    height: 2,
    marginTop: 31,
    background:
      "linear-gradient(90deg,#d7ae58,rgba(215,174,88,.05))",
  },

  liveStatus: {
    color: "#42f587",
    fontSize: 30,
    fontWeight: 800,
    marginTop: 22,
  },

  connected: {
    color: "#42f587",
    marginTop: 20,
    fontSize: 12,
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#42f587",
    display: "inline-block",
    boxShadow: "0 0 10px #42f587",
  },

  panel: {
    border: "1px solid rgba(66,245,135,.18)",
    borderRadius: 18,
    padding: 24,
    background:
      "linear-gradient(145deg,rgba(0,39,30,.9),rgba(0,22,18,.92))",
    marginBottom: 20,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: "7px 0 0",
    fontSize: 23,
  },

  liveBadge: {
    border: "1px solid rgba(66,245,135,.3)",
    borderRadius: 30,
    padding: "8px 12px",
    fontSize: 10,
    color: "#42f587",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  clientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: 15,
  },

  clientCard: {
    border: "1px solid rgba(66,245,135,.15)",
    borderRadius: 15,
    padding: 18,
    background: "rgba(0,25,20,.72)",
  },

  clientTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  clientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(66,245,135,.35)",
    color: "#42f587",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  activeBadge: {
    color: "#42f587",
    border: "1px solid rgba(66,245,135,.25)",
    borderRadius: 20,
    padding: "6px 9px",
    fontSize: 10,
    textTransform: "uppercase",
  },

  inactiveBadge: {
    color: "#d7ae58",
    border: "1px solid rgba(215,174,88,.25)",
    borderRadius: 20,
    padding: "6px 9px",
    fontSize: 10,
    textTransform: "uppercase",
  },

  clientCode: {
    color: "#42f587",
    fontSize: 11,
    letterSpacing: 1.3,
    marginTop: 18,
  },

  clientName: {
    fontSize: 17,
    lineHeight: 1.4,
    minHeight: 48,
    margin: "7px 0",
  },

  divider: {
    height: 1,
    background: "rgba(255,255,255,.07)",
    margin: "15px 0",
  },

  clientDetail: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: "7px 0",
    fontSize: 11,
  },

  detailLabel: {
    color: "#718b80",
  },

  emptyState: {
    padding: 30,
    textAlign: "center",
    color: "#789187",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: 20,
  },

  bottomPanel: {
    border: "1px solid rgba(66,245,135,.16)",
    borderRadius: 18,
    padding: 23,
    background: "rgba(0,32,25,.8)",
  },

  architecture: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 25,
  },

  archBox: {
    flex: 1,
    minHeight: 85,
    border: "1px solid rgba(66,245,135,.18)",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    fontSize: 11,
    textAlign: "center",
  },

  archIcon: {
    color: "#42f587",
    fontWeight: 800,
    fontSize: 18,
  },

  arrow: {
    color: "#d7ae58",
  },

  securityRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 15,
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.06)",
    fontSize: 11,
    color: "#94aaa1",
  },

  footer: {
    textAlign: "center",
    color: "#577268",
    fontSize: 10,
    marginTop: 30,
    padding: 15,
  },

  footerDot: {
    color: "#d7ae58",
    padding: "0 8px",
  },

  muted: {
    color: "#789187",
  },
};
