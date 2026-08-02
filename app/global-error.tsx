"use client";

import { useEffect } from "react";

const IS_DEV = process.env.NODE_ENV === "development";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalErrorBoundary]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily:
            "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif",
          backgroundColor: "#17351a",
          color: "#efe9d8",
        }}
      >
        <div style={{ maxWidth: "24rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
              color: "#f2b01e",
              marginBottom: "2.5rem",
            }}
          >
            ✂ KitFix — Repair Sheet
          </p>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              margin: 0,
              color: "#efe9d8",
              fontFamily: "'Archivo Black', system-ui, sans-serif",
            }}
          >
            Something Went Wrong
          </h1>

          <div role="alert">
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.875rem",
                color: "#c4bca8",
                lineHeight: 1.6,
              }}
            >
              {IS_DEV
                ? error.message || "A critical error occurred."
                : "A critical error occurred. Please try refreshing the page."}
            </p>
            {error.digest && (
              <p
                style={{
                  marginTop: "0.5rem",
                  fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                  fontSize: "0.6875rem",
                  color: "#c4bca8",
                }}
              >
                Ref: {error.digest}
              </p>
            )}
          </div>

          <button
            onClick={reset}
            aria-label="Retry loading the application"
            style={{
              marginTop: "2rem",
              display: "inline-flex",
              height: "2.5rem",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f2b01e",
              paddingLeft: "1.25rem",
              paddingRight: "1.25rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#0f1c10",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>

          <div
            style={{
              marginTop: "2rem",
              height: "4px",
              width: "100%",
              background:
                "repeating-linear-gradient(90deg, #f2b01e 0 10px, transparent 10px 16px)",
            }}
          />
        </div>
      </body>
    </html>
  );
}
