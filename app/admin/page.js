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
  const [message, setMessage] = useState("");

  const [showAddClient, setShowAddClient] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newClient, setNewClient] = useState({
    client_code: "",
    client_name: "",
    owner_user_id: "",
  });

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  async function loadAdminDashboard() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      return;
    }

    setUserEmail(user.email || "");

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

    if (!adminRecord) {
      router.replace("/");
      return;
    }

    await refreshClients();
    setLoading(false);
  }

  async function refreshClients() {
    const { data, error: clientError } = await supabase
      .from("clients")
      .select("id, client_code, client_name, owner_user_id, status, created_at")
      .order("client_code", { ascending: true });

    if (clientError) {
      setError(clientError.message);
      return;
    }

    setClients(data || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function addClient(e) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !newClient.client_code.trim() ||
      !newClient.client_name.trim() ||
      !newClient.owner_user_id.trim()
    ) {
      setError("Please complete all client fields.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("clients")
      .insert({
        client_code: newClient.client_code.trim().toUpperCase(),
        client_name: newClient.client_name.trim(),
        owner_user_id: newClient.owner_user_id.trim(),
        status: "active",
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setNewClient({
      client_code: "",
      client_name: "",
      owner_user_id: "",
    });

    setShowAddClient(false);
    setMessage("Client created successfully.");

    await refreshClients();

    setSaving(false);
  }

  async function editClientName(client) {
    const updatedName = window.prompt(
      "Enter the new client name:",
      client.client_name
    );

    if (!updatedName || updatedName.trim() === "") {
      return;
    }

    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("clients")
      .update({
        client_name: updatedName.trim(),
      })
      .eq("id", client.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(`${client.client_code} name updated.`);
    await refreshClients();
  }

  async function toggleClientStatus(client) {
    const nextStatus =
      client.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Change ${client.client_code} to ${nextStatus}?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("clients")
      .update({
        status: nextStatus,
      })
      .eq("id", client.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage(
      `${client.client_code} is now ${nextStatus}.`
    );

    await refreshClients();
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
        <style>{animationStyles}</style>

        <div style={styles.loader}></div>

        <h2 style={{ marginTop: 20 }}>
          Loading N&T Admin Intelligence...
        </h2>

        <p style={styles.muted}>
          Verifying administrator access
        </p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{animationStyles}</style>

      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brandRow}>
            <div style={styles.logo}>NT</div>

            <div>
              <div style={styles.brand}>N&T</div>

              <div style={styles.brandSub}>
                ADMIN INTELLIGENCE
              </div>
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

            <Link
              href="/carbon-energy"
              style={styles.menuLink}
            >
              <span>○</span>
              Carbon & Energy
            </Link>

            <Link
              href="/sustainable-finance"
              style={styles.menuLink}
            >
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
            <div style={styles.securityTitle}>
              ADMIN SESSION
            </div>

            <div style={styles.securityLive}>
              <span style={styles.greenDot}></span>
              Secure
            </div>

            <div style={styles.securityText}>
              Administrator permissions verified
            </div>
          </div>

          <button
            onClick={logout}
            style={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </aside>

      <section style={styles.content}>
        <header style={styles.header}>
          <div>
            <div style={styles.smallLabel}>
              N&T CONTROL CENTRE
            </div>

            <h1 style={styles.title}>
              Admin{" "}
              <span style={styles.green}>
                Intelligence
              </span>
            </h1>

            <p style={styles.subtitle}>
              Multi-client management and platform
              monitoring.
            </p>
          </div>

          <div style={styles.adminProfile}>
            <div style={styles.adminCircle}>A</div>

            <div>
              <div style={styles.adminText}>
                Administrator
              </div>

              <div style={styles.email}>
                {userEmail}
              </div>
            </div>
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

        <section style={styles.kpiGrid}>
          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>◫</span>
              Total Clients
            </div>

            <div style={styles.bigNumber}>
              {clients.length}
            </div>

            <div style={styles.cardText}>
              Registered client organisations
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.greenIcon}>●</span>
              Active Clients
            </div>

            <div style={styles.bigNumber}>
              {activeClients}
            </div>

            <div style={styles.cardText}>
              Currently active client accounts
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.goldIcon}>◆</span>
              Inactive Clients
            </div>

            <div style={styles.bigNumber}>
              {inactiveClients}
            </div>

            <div style={styles.cardText}>
              Accounts requiring attention
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.greenIcon}>✓</span>
              Platform Status
            </div>

            <div style={styles.liveStatus}>
              LIVE
            </div>

            <div style={styles.cardText}>
              Supabase client database connected
            </div>

            <div style={styles.connected}>
              <span style={styles.greenDot}></span>
              Connected
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.smallLabel}>
                CLIENT MANAGEMENT
              </div>

              <h2 style={styles.panelTitle}>
                Client Portfolio
              </h2>
            </div>

            <div style={styles.actionsRow}>
              <div style={styles.liveBadge}>
                <span style={styles.greenDot}></span>
                LIVE DATA
              </div>

              <button
                style={styles.addButton}
                onClick={() =>
                  setShowAddClient((value) => !value)
                }
              >
                + Add Client
              </button>
            </div>
          </div>

          {showAddClient && (
            <form
              onSubmit={addClient}
              style={styles.addForm}
            >
              <div style={styles.formHeader}>
                Add New Client
              </div>

              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>
                    Client Code
                  </label>

                  <input
                    value={newClient.client_code}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        client_code: e.target.value,
                      })
                    }
                    placeholder="NT-003"
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Client Name
                  </label>

                  <input
                    value={newClient.client_name}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        client_name: e.target.value,
                      })
                    }
                    placeholder="Example Ltd"
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>
                    Supabase User UID
                  </label>

                  <input
                    value={newClient.owner_user_id}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        owner_user_id: e.target.value,
                      })
                    }
                    placeholder="Paste user UID"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formButtons}>
                <button
                  type="submit"
                  disabled={saving}
                  style={styles.saveButton}
                >
                  {saving
                    ? "Creating..."
                    : "Create Client"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowAddClient(false)
                  }
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {clients.length === 0 ? (
            <div style={styles.emptyState}>
              No clients are currently registered.
            </div>
          ) : (
            <div style={styles.clientGrid}>
              {clients.map((client) => (
                <article
                  key={client.id}
                  style={styles.clientCard}
                >
                  <div style={styles.clientTop}>
                    <div style={styles.clientAvatar}>
                      {client.client_code
                        ?.replace("NT-", "")
                        .slice(0, 3) || "NT"}
                    </div>

                    <div
                      style={
                        client.status === "active"
                          ? styles.activeBadge
                          : styles.inactiveBadge
                      }
                    >
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
                    <span style={styles.detailLabel}>
                      Client ID
                    </span>

                    <strong>
                      {client.client_code}
                    </strong>
                  </div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>
                      Status
                    </span>

                    <strong>
                      {client.status}
                    </strong>
                  </div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>
                      Data Isolation
                    </span>

                    <strong style={styles.green}>
                      Enabled
                    </strong>
                  </div>

                  <div style={styles.clientDetail}>
                    <span style={styles.detailLabel}>
                      Owner Linked
                    </span>

                    <strong style={styles.green}>
                      Yes
                    </strong>
                  </div>

                  <div style={styles.clientActions}>
                    <button
                      onClick={() =>
                        editClientName(client)
                      }
                      style={styles.editButton}
                    >
                      Edit Name
                    </button>

                    <button
                      onClick={() =>
                        toggleClientStatus(client)
                      }
                      style={
                        client.status === "active"
                          ? styles.deactivateButton
                          : styles.activateButton
                      }
                    >
                      {client.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={styles.bottomGrid}>
          <div style={styles.bottomPanel}>
            <div style={styles.smallLabel}>
              ADMIN CAPABILITIES
            </div>

            <h2 style={styles.panelTitle}>
              Client Management Engine
            </h2>

            <div style={styles.securityRow}>
              <span>Create clients</span>

              <strong style={styles.green}>
                ENABLED
              </strong>
            </div>

            <div style={styles.securityRow}>
              <span>Edit client name</span>

              <strong style={styles.green}>
                ENABLED
              </strong>
            </div>

            <div style={styles.securityRow}>
              <span>Activate / deactivate</span>

              <strong style={styles.green}>
                ENABLED
              </strong>
            </div>

            <div style={styles.securityRow}>
              <span>Client data isolation</span>

              <strong style={styles.green}>
                ACTIVE
              </strong>
            </div>
          </div>

          <div style={styles.bottomPanel}>
            <div style={styles.smallLabel}>
              SECURITY
            </div>

            <h2 style={styles.panelTitle}>
              Access Control
            </h2>

            <div style={styles.securityRow}>
              <span>
                Administrator verification
              </span>

              <strong style={styles.green}>
                ACTIVE
              </strong>
            </div>

            <div style={styles.securityRow}>
              <span>
                Row Level Security
              </span>

              <strong style={styles.green}>
                ENABLED
              </strong>
            </div>

            <div style={styles.securityRow}>
              <span>
                Authenticated session
              </span>

              <strong style={styles.green}>
                SECURE
              </strong>
            </div>
          </div>
        </section>

        <footer style={styles.footer}>
          N&T AI-Powered Sustainable Finance &
          Accounting Ltd
          <span style={styles.footerDot}>•</span>
          Admin Intelligence Platform
        </footer>
      </section>
    </main>
  );
}

const animationStyles = `
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;

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

  success: {
    padding: 15,
    border: "1px solid rgba(66,245,135,.45)",
    borderRadius: 10,
    color: "#71f7aa",
    background: "rgba(66,245,135,.08)",
    marginBottom: 20,
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },

  card: {
    border: "1px solid rgba(66,245,135,.18)",
    borderRadius: 16,
    padding: 20,
    minHeight: 145,
    background:
      "linear-gradient(145deg, rgba(0,48,37,.92), rgba(0,25,20,.92))",
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

  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
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

  addButton: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #42f587",
    background: "#087a4f",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },

  addForm: {
    padding: 18,
    borderRadius: 14,
    border: "1px solid rgba(66,245,135,.25)",
    background: "rgba(0,20,16,.75)",
    marginBottom: 20,
  },

  formHeader: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 15,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 15,
  },

  label: {
    display: "block",
    fontSize: 11,
    color: "#91aaa0",
    marginBottom: 7,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    borderRadius: 9,
    border: "1px solid rgba(66,245,135,.2)",
    background: "#001b15",
    color: "white",
    outline: "none",
  },

  formButtons: {
    display: "flex",
    gap: 10,
    marginTop: 16,
  },

  saveButton: {
    padding: "10px 14px",
    borderRadius: 9,
    border: "1px solid #42f587",
    background: "#087a4f",
    color: "white",
    cursor: "pointer",
  },

  cancelButton: {
    padding: "10px 14px",
    borderRadius: 9,
    border: "1px solid rgba(255,255,255,.15)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },

  clientGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",
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

  clientActions: {
    display: "flex",
    gap: 10,
    marginTop: 16,
  },

  editButton: {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid rgba(66,245,135,.35)",
    background: "rgba(66,245,135,.08)",
    color: "#8cf7b7",
    cursor: "pointer",
  },

  deactivateButton: {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid rgba(215,174,88,.4)",
    background: "rgba(215,174,88,.08)",
    color: "#e3bd6b",
    cursor: "pointer",
  },

  activateButton: {
    flex: 1,
    padding: "9px 10px",
    borderRadius: 8,
    border: "1px solid rgba(66,245,135,.4)",
    background: "rgba(66,245,135,.08)",
    color: "#8cf7b7",
    cursor: "pointer",
  },

  emptyState: {
    padding: 30,
    textAlign: "center",
    color: "#789187",
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(300px,1fr))",
    gap: 20,
  },

  bottomPanel: {
    border: "1px solid rgba(66,245,135,.16)",
    borderRadius: 18,
    padding: 23,
    background: "rgba(0,32,25,.8)",
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
