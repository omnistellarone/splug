"use client";

import { useEffect } from "react";

export default function MobileCallbackPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const payload = hash || search;

      // Forward directly into the native mobile app deep link
      window.location.href = `slurge://auth/callback${payload}`;
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#070709",
        color: "#ffffff",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "3px solid #7928CA",
          borderTopColor: "transparent",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      />
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
        Connecting to Slurge Mobile...
      </h2>
      <p style={{ color: "#9ca3af", fontSize: "14px" }}>
        Completing secure Google Authentication. If you are not redirected automatically, tap below.
      </p>
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            const payload = window.location.hash || window.location.search || "";
            window.location.href = `slurge://auth/callback${payload}`;
          }
        }}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: "#3525cd",
          color: "#ffffff",
          borderRadius: "8px",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
        }}
      >
        Open Slurge App
      </button>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
