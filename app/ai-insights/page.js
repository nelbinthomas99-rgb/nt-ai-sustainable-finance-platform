"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function AIInsightsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    expenses: 0,
    cashBalance: 0,
    esgScore: 0,
    carbon: 0,
    sustainablePercentage: 0,
  });

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
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
      const cashBalance = Number(financial.data?.cash_balance || 0);

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
        environmental > 0 || social > 0 || governance > 0
          ? (environmental + social + governance) / 3
          : 0;

      const carbonTotal = Number(
        carbon.data?.carbon_emissions_kg ?? 0
      );

      const greenInvestment = Number(
        sustainable.data?.green_investment || 0
      );

      const sustainableLoans = Number(
        sustainable.data?.sustainable_loans || 0
      );

      const esgFunds = Number(
        sustainable.data?.esg_funds || 0
      );

      const totalFinance = Number(
        sustainable.data?.total_finance || 0
      );

      const sustainableTotal =
        greenInvestment + sustainableLoans + esgFunds;

      const sustainablePercentage =
        totalFinance > 0
          ? (sustainableTotal / totalFinance) * 100
          : 0;

      const profit = revenue - expenses;

      const generatedInsights = [];

      if (revenue > 0) {
        if (profit > 0) {
          generatedInsights.push(
            `Financial performance is positive with an estimated profit of £${profit.toFixed(
              2
            )}.`
          );
        } else if (profit < 0) {
          generatedInsights.push(
            `Expenses currently exceed revenue by £${Math.abs(
              profit
            ).toFixed(2)}. Review costs and cash-flow planning.`
          );
        } else {
          generatedInsights.push(
            "Revenue and expenses are currently equal."
          );
        }
      }

      if (cashBalance > 0 && revenue > 0) {
        if (cashBalance < revenue * 0.2) {
          generatedInsights.push(
            "Cash reserves appear relatively low compared with recorded revenue. Consider reviewing liquidity requirements."
          );
        } else {
          generatedInsights.push(
            "The current cash position appears reasonably healthy compared with recorded revenue."
          );
        }
      }

      if (esgScore > 0) {
        if (esgScore >= 80) {
          generatedInsights.push(
            `ESG performance is strong with an overall score of ${esgScore.toFixed(
              1
            )}/100.`
          );
        } else if (esgScore >= 60) {
          generatedInsights.push(
            `ESG performance is moderate at ${esgScore.toFixed(
              1
            )}/100. There is scope for further improvement.`
          );
        } else {
          generatedInsights.push(
            `ESG performance requires attention. The current overall score is ${esgScore.toFixed(
              1
            )}/100.`
          );
        }
      }

      if (carbonTotal > 0) {
        generatedInsights.push(
          `Recorded carbon emissions are approximately ${carbonTotal.toFixed(
            2
          )} kg CO₂e. Review energy use and business travel for potential reduction opportunities.`
        );
      }

      if (totalFinance > 0) {
        if (sustainablePercentage >= 50) {
          generatedInsights.push(
            `Sustainable finance represents ${sustainablePercentage.toFixed(
              1
            )}% of total finance, indicating a strong sustainability allocation.`
          );
        } else {
          generatedInsights.push(
            `Sustainable finance represents ${sustainablePercentage.toFixed(
              1
            )}% of total finance. Increasing sustainability-linked allocation may strengthen the sustainability profile.`
          );
        }
      }

      if (generatedInsights.length === 0) {
        generatedInsights.push(
          "Add data to the Financial, ESG, Carbon & Energy and Sustainable Finance modules to generate automated insights."
        );
      }

      setSummary({
        revenue,
        expenses,
        cashBalance,
        esgScore,
        carbon: carbonTotal,
        sustainablePercentage,
      });

      setInsights(generatedInsights);
      setLoading(false);
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <main
        style={{
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Loading AI Insights...</h2>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px",
        background: "#f4f7f6",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#006b57",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        ← Back to Dashboard
      </Link>

      <h1
        style={{
          color: "#006b57",
          marginTop: "30px",
        }}
      >
        AI Insights
      </h1>

      <p>
        Automated insights based on your latest financial and sustainability
        data.
      </p>

      <section
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Business Data Overview</h2>

        <p>
          Revenue: <strong>£{summary.revenue.toFixed(2)}</strong>
        </p>

        <p>
          Expenses: <strong>£{summary.expenses.toFixed(2)}</strong>
        </p>

        <p>
          Cash Balance: <strong>£{summary.cashBalance.toFixed(2)}</strong>
        </p>

        <p>
          ESG Score: <strong>{summary.esgScore.toFixed(1)}/100</strong>
        </p>

        <p>
          Carbon Emissions:{" "}
          <strong>{summary.carbon.toFixed(2)} kg CO₂e</strong>
        </p>

        <p>
          Sustainable Finance:{" "}
          <strong>{summary.sustainablePercentage.toFixed(1)}%</strong>
        </p>
      </section>

      <section
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "25px",
        }}
      >
        <h2>AI-Powered Insights</h2>

        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              padding: "18px",
              marginTop: "15px",
              background: "#eef8f5",
              borderLeft: "5px solid #006b57",
              borderRadius: "6px",
            }}
          >
            {insight}
          </div>
        ))}

        <p
          style={{
            marginTop: "25px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          Prototype automated decision-support insights based on the latest
          saved client data. These insights are not professional financial,
          investment or sustainability advice.
        </p>
      </section>
    </main>
  );
}
