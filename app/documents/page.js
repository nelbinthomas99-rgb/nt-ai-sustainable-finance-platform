"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function DocumentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkLogin() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setLoading(false);
      }
    }

    checkLogin();

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

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Checking secure login...
      </main>
    );
  }

  return (
    <main
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f4f7f6",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#0b5d4b",
          textDecoration: "none",
          fontWeight: "bold",
        }}
      >
        ← Back to Dashboard
      </Link>

      <h1
        style={{
          color: "#0b5d4b",
          marginTop: "30px",
        }}
      >
        Documents
      </h1>

      <p>Secure area for client financial and sustainability documents.</p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Document Categories</h2>

        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "25px",
          }}
        >
          <div
            style={{
              background: "#f0f7f5",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Financial Documents</h3>
            <p>
              Accounts, invoices, statements and other financial records.
            </p>
          </div>

          <div
            style={{
              background: "#f0f7f5",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>ESG Documents</h3>
            <p>
              Environmental, Social and Governance reports and supporting
              records.
            </p>
          </div>

          <div
            style={{
              background: "#f0f7f5",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Carbon & Energy Documents</h3>
            <p>
              Energy bills, carbon data and sustainability evidence.
            </p>
          </div>

          <div
            style={{
              background: "#f0f7f5",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>Sustainable Finance Documents</h3>
            <p>
              Green finance, sustainable loans and ESG-linked finance records.
            </p>
          </div>
        </div>

        <p
          style={{
            marginTop: "25px",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Secure document upload and storage will be added in the next
          development stage.
        </p>
      </div>
    </main>
  );
}
