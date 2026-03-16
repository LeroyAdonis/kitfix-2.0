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
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          backgroundColor: "#fafafa",
          color: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: "24rem", textAlign: "center" }}>
          {/* Logo text */}
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#a3a3a3",
              marginBottom: "2.5rem",
            }}
          >
            ✂ KitFix
          </p>

          {/* Icon circle */}
          <div
            style={{
              display: "inline-flex",
              width: "3.5rem",
              height: "3.5rem",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
              marginBottom: "1.5rem",
              fontSize: "1.25rem",
            }}
            aria-hidden="true"
          >
            🔧
          </div>

          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Something Went Wrong
          </h1>

          <div role="alert">
            <p
              style={{
                marginTop: "0.75rem",
                fontSize: "0.875rem",
                color: "#737373",
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
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.6875rem",
                  color: "#a3a3a380",
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
              borderRadius: "0.5rem",
              backgroundColor: "#0a0a0a",
              paddingLeft: "1.25rem",
              paddingRight: "1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fafafa",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
