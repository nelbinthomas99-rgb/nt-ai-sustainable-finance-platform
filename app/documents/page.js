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
  const [userId, setUserId] = useState("");
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadDocuments(currentUserId) {
    const { data, error } = await supabase.storage
      .from("client-documents")
      .list(currentUserId, {
        limit: 100,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error(error);
      return;
    }

    setDocuments(data || []);
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      if (!mounted) return;

      setUserId(user.id);

      await loadDocuments(user.id);

      if (mounted) {
        setLoading(false);
      }
    }

    loadPage();

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

  async function uploadDocument() {
    if (!file || !userId) {
      setMessage("Please choose a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${userId}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from("client-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(error);
      setMessage("Unable to upload document.");
    } else {
      setMessage("Document uploaded successfully.");
      setFile(null);

      const input = document.getElementById("document-upload");
      if (input) {
        input.value = "";
      }

      await loadDocuments(userId);
    }

    setUploading(false);
  }

  async function openDocument(fileName) {
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      console.error(error);
      setMessage("Unable to open document.");
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Loading secure documents...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7f6",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
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

      <p>
        Securely upload and access documents linked to your client account.
      </p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "30px",
        }}
      >
        <h2>Upload Document</h2>

        <input
          id="document-upload"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{
            marginTop: "10px",
            marginBottom: "20px",
          }}
        />

        <br />

        <button
          onClick={uploadDocument}
          disabled={uploading}
          style={{
            background: "#0b5d4b",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "20px",
              fontWeight: "bold",
              color: message.includes("successfully")
                ? "#0b5d4b"
                : "#b42318",
            }}
          >
            {message}
          </p>
        )}

        <hr style={{ margin: "30px 0" }} />

        <h2>Your Documents</h2>

        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <div>
            {documents.map((document) => (
              <div
                key={document.id || document.name}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <span
                  style={{
                    overflowWrap: "anywhere",
                  }}
                >
                  {document.name}
                </span>

                <button
                  onClick={() => openDocument(document.name)}
                  style={{
                    background: "#0b5d4b",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 14px",
                    cursor: "pointer",
                  }}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
