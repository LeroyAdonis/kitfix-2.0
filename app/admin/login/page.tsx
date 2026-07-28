"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#00E859] flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-lg">KF</span>
          </div>
          <h1 className="text-2xl font-bold text-white">KitFix Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage repairs</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2b2b44] space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2.5 rounded-lg bg-[#2b2b44] text-white border border-[#333] focus:border-[#00E859] outline-none transition-colors placeholder:text-gray-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <span>✕</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-lg bg-[#00E859] text-black font-semibold hover:bg-[#00c94d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
