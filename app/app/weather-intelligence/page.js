"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function WeatherIntelligence() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    setLoading(true);
    setError("");

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
      setError("No active client profile was found.");
      setLoading(false);
      return;
    }

    setClient(clientData);

    const { data: weatherRecord, error: weatherError } = await supabase
      .from("weather_intelligence")
      .select("*")
      .eq("client_id", clientData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (weatherError) {
      setError(weatherError.message);
      setLoading(false);
      return;
    }

    setLocation(weatherRecord || null);

    if (weatherRecord?.latitude && weatherRecord?.longitude) {
      await getWeather(weatherRecord);
    }

    setLoading(false);
  }

  async function getWeather(record) {
    try {
      setWeatherLoading(true);

      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${record.latitude}` +
        `&longitude=${record.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m` +
        `&timezone=auto`;

      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Weather service is currently unavailable.");
      }

      const result = await response.json();
      const current = result.current;

      if (!current) {
        throw new Error("No current weather observation was returned.");
      }

      setWeather({
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        windSpeed: current.wind_speed_10m,
        windGust: current.wind_gusts_10m,
        weatherCode: current.weather_code,
        observationTime: current.time,
        timezone: result.timezone,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  }

  function weatherDescription(code) {
    const descriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Severe thunderstorm with hail",
    };

    return descriptions[code] || "Weather observation";
  }

  function signal(value, type) {
    if (value === null || value === undefined) return "AWAITING DATA";

    if (type === "heat") {
      if (value >= 35) return "HIGH";
      if (value >= 28) return "ELEVATED";
      return "NORMAL";
    }

    if (type === "rain") {
      if (value >= 10) return "HIGH";
      if (value >= 2.5) return "ELEVATED";
      return "NORMAL";
    }

    if (type === "wind") {
      if (value >= 70) return "HIGH";
      if (value >= 40) return "ELEVATED";
      return "NORMAL";
    }

    return "NORMAL";
  }

  if (loading) {
    return (
      <main style={styles.loading}>
        <div style={styles.loader}></div>
        <h2>N&T Weather Intelligence</h2>
        <p>Loading client intelligence...</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.glowOne}></div>
      <div style={styles.glowTwo}></div>

      <div style={styles.container}>
        <button style={styles.back} onClick={() => router.push("/")}>
          ← Dashboard
        </button>

        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>
              N&T CLIMATE INTELLIGENCE ENGINE
            </div>

            <h1 style={styles.title}>
              Weather Intelligence
            </h1>

            <p style={styles.subtitle}>
              Location-aware weather signals for operational,
              climate and financial decision support.
            </p>
          </div>

          <div style={styles.liveBadge}>
            <span style={styles.liveDot}></span>
            LIVE DATA LAYER
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.clientCard}>
          <div>
            <div style={styles.label}>CLIENT</div>
            <div style={styles.clientName}>
              {client?.client_name || "Client"}
            </div>
            <div style={styles.muted}>
              {client?.client_code}
            </div>
          </div>

          <div>
            <div style={styles.label}>LOCATION</div>
            <div style={styles.value}>
              {location?.location_name || "Awaiting location"}
            </div>
            <div style={styles.muted}>
              {location?.country || "Country not recorded"}
            </div>
          </div>

          <div>
            <div style={styles.label}>COORDINATES</div>
            <div style={styles.value}>
              {location?.latitude ?? "—"},{" "}
              {location?.longitude ?? "—"}
            </div>
            <div style={styles.muted}>
              Location intelligence
            </div>
          </div>

          <div>
            <div style={styles.label}>METHODOLOGY</div>
            <div style={styles.value}>
              {location?.methodology_version || "NT-WI-v1"}
            </div>
            <div style={styles.muted}>
              Explainable signals
            </div>
          </div>
        </section>

        <div style={styles.sectionTitle}>
          CURRENT WEATHER OBSERVATION
        </div>

        <section style={styles.grid}>
          <Metric
            title="Temperature"
            value={
              weatherLoading
                ? "Loading..."
                : weather
                ? `${weather.temperature}°C`
                : "Awaiting data"
            }
            sub="Current air temperature"
          />

          <Metric
            title="Feels Like"
            value={
              weather
                ? `${weather.feelsLike}°C`
                : "Awaiting data"
            }
            sub="Apparent temperature"
          />

          <Metric
            title="Humidity"
            value={
              weather
                ? `${weather.humidity}%`
                : "Awaiting data"
            }
            sub="Relative humidity"
          />

          <Metric
            title="Precipitation"
            value={
              weather
                ? `${weather.precipitation} mm`
                : "Awaiting data"
            }
            sub="Current precipitation"
          />

          <Metric
            title="Wind Speed"
            value={
              weather
                ? `${weather.windSpeed} km/h`
                : "Awaiting data"
            }
            sub="10 metre wind speed"
          />

          <Metric
            title="Wind Gust"
            value={
              weather
                ? `${weather.windGust} km/h`
                : "Awaiting data"
            }
            sub="Current wind gust"
          />
        </section>

        <section style={styles.weatherHero}>
          <div>
            <div style={styles.label}>CURRENT CONDITION</div>

            <h2 style={styles.condition}>
              {weather
                ? weatherDescription(weather.weatherCode)
                : "Awaiting verified weather data"}
            </h2>

            <p style={styles.muted}>
              {weather?.observationTime
                ? `Observation: ${weather.observationTime} • ${weather.timezone}`
                : "No observation timestamp available."}
            </p>
          </div>

          <button
            style={styles.refresh}
            onClick={() => location && getWeather(location)}
          >
            Refresh Weather
          </button>
        </section>

        <div style={styles.sectionTitle}>
          OPERATIONAL HAZARD SIGNALS
        </div>

        <section style={styles.signalGrid}>
          <SignalCard
            title="Heat Signal"
            value={signal(weather?.temperature, "heat")}
            description="Temperature-based operational signal."
          />

          <SignalCard
            title="Heavy Rain Signal"
            value={signal(weather?.precipitation, "rain")}
            description="Current precipitation signal."
          />

          <SignalCard
            title="Wind / Storm Signal"
            value={signal(weather?.windGust, "wind")}
            description="Wind-gust operational signal."
          />

          <SignalCard
            title="Climate Risk"
            value="SEPARATE ASSESSMENT"
            description="Current weather is not presented as long-term climate risk."
          />
        </section>

        <section style={styles.flow}>
          <div style={styles.sectionTitle}>
            N&T DECISION INTELLIGENCE FLOW
          </div>

          <div style={styles.flowRow}>
            <Flow text="Client" />
            <Arrow />
            <Flow text="Location" />
            <Arrow />
            <Flow text="Weather" />
            <Arrow />
            <Flow text="Hazard Signal" />
            <Arrow />
            <Flow text="Business Impact" />
            <Arrow />
            <Flow text="Financial Action" />
          </div>
        </section>

        <section style={styles.integrity}>
          <div style={styles.integrityIcon}>✓</div>

          <div>
            <h3 style={{ margin: 0 }}>
              Data Integrity Control
            </h3>

            <p style={styles.muted}>
              N&T separates current weather observations from
              long-term climate-risk assessment. Missing information
              remains missing rather than being converted into
              fabricated climate scores.
            </p>
          </div>
        </section>

        <section style={styles.next}>
          <div style={styles.label}>NEXT INTELLIGENCE LAYERS</div>

          <h2 style={{ marginTop: 8 }}>
            Climate → Renewable Energy → Green Finance
          </h2>

          <p style={styles.muted}>
            This weather layer provides a foundation for location-aware
            climate analysis, renewable-energy opportunity assessment,
            carbon reduction, green finance, green bonds and
            sustainable-finance decision intelligence.
          </p>
        </section>
      </div>
    </main>
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

function SignalCard({ title, value, description }) {
  return (
    <div style={styles.signal}>
      <div style={styles.label}>{title}</div>
      <div style={styles.signalValue}>{value}</div>
      <p style={styles.muted}>{description}</p>
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
      "radial-gradient(circle at top right,#0d3b2e 0,#071712 35%,#030807 75%)",
    color: "#f2fff9",
    padding: "38px 20px 80px",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
  },

  container: {
    maxWidth: 1250,
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  glowOne: {
    position: "absolute",
    width: 450,
    height: 450,
    borderRadius: "50%",
    background: "rgba(44,255,157,.07)",
    filter: "blur(80px)",
    top: -120,
    right: -100,
  },

  glowTwo: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "rgba(0,160,255,.05)",
    filter: "blur(90px)",
    bottom: 100,
    left: -100,
  },

  loading: {
    minHeight: "100vh",
    background: "#030807",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  loader: {
    width: 45,
    height: 45,
    border: "4px solid #18382d",
    borderTop: "4px solid #42f59b",
    borderRadius: "50%",
    marginBottom: 20,
  },

  back: {
    background: "transparent",
    border: "1px solid #24513e",
    color: "#a8e9c9",
    padding: "10px 16px",
    borderRadius: 10,
    cursor: "pointer",
    marginBottom: 30,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 30,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 30,
  },

  eyebrow: {
    color: "#56e7a3",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
  },

  title: {
    fontSize: "clamp(36px,6vw,68px)",
    margin: "8px 0",
    letterSpacing: -2,
  },

  subtitle: {
    color: "#a2bdb1",
    maxWidth: 700,
    lineHeight: 1.7,
  },

  liveBadge: {
    border: "1px solid #226947",
    background: "rgba(32,154,96,.10)",
    color: "#63f2ad",
    padding: "10px 14px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 800,
  },

  liveDot: {
    width: 8,
    height: 8,
    display: "inline-block",
    borderRadius: "50%",
    background: "#49f59e",
    marginRight: 8,
  },

  clientCard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 16,
    padding: 24,
    border: "1px solid #17392d",
    background: "rgba(8,25,19,.78)",
    borderRadius: 18,
    marginBottom: 35,
  },

  label: {
    color: "#6edda9",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
  },

  clientName: {
    fontSize: 18,
    fontWeight: 800,
    marginTop: 8,
  },

  value: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 8,
  },

  muted: {
    color: "#829b90",
    lineHeight: 1.6,
    fontSize: 13,
  },

  sectionTitle: {
    margin: "34px 0 14px",
    color: "#75e6b1",
    fontWeight: 800,
    fontSize: 12,
    letterSpacing: 1.8,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 14,
  },

  metric: {
    minHeight: 125,
    padding: 20,
    borderRadius: 16,
    border: "1px solid #17392d",
    background: "linear-gradient(145deg,#091c15,#06100d)",
  },

  metricValue: {
    fontSize: 27,
    fontWeight: 800,
    margin: "13px 0 8px",
  },

  weatherHero: {
    marginTop: 18,
    padding: 26,
    borderRadius: 18,
    border: "1px solid #24533f",
    background:
      "linear-gradient(120deg,rgba(16,75,52,.65),rgba(5,16,13,.9))",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
  },

  condition: {
    fontSize: 30,
    margin: "10px 0",
  },

  refresh: {
    background: "#4be99b",
    color: "#03110b",
    border: 0,
    borderRadius: 10,
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
  },

  signalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: 15,
  },

  signal: {
    padding: 22,
    borderRadius: 16,
    border: "1px solid #17392d",
    background: "rgba(6,18,14,.86)",
  },

  signalValue: {
    fontSize: 18,
    fontWeight: 800,
    marginTop: 14,
    color: "#eafff4",
  },

  flow: {
    marginTop: 38,
    padding: 24,
    border: "1px solid #17392d",
    borderRadius: 18,
    background: "rgba(5,15,12,.8)",
  },

  flowRow: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    flexWrap: "wrap",
  },

  flowBox: {
    border: "1px solid #285d47",
    background: "#0a2119",
    padding: "12px 15px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
  },

  arrow: {
    color: "#4be99b",
    fontSize: 20,
  },

  integrity: {
    marginTop: 22,
    padding: 24,
    border: "1px solid #1d533b",
    background: "rgba(17,73,48,.14)",
    borderRadius: 18,
    display: "flex",
    gap: 18,
  },

  integrityIcon: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#46e695",
    color: "#021009",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 900,
  },

  next: {
    marginTop: 22,
    padding: 28,
    borderRadius: 18,
    border: "1px solid #22533f",
    background:
      "linear-gradient(120deg,rgba(10,49,35,.8),rgba(5,13,11,.9))",
  },

  error: {
    padding: 15,
    marginBottom: 20,
    border: "1px solid #914343",
    background: "rgba(130,30,30,.2)",
    borderRadius: 10,
  },
};
