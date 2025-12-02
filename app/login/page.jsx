"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    console.log("Login button clicked");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        console.error("API returned non-200 status:", res.status);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Login response:", data);

      setLoading(false);

      if (data.success) {
        localStorage.setItem("admin-token", "admin");
        router.replace("/admin");
      } else {
        alert("Invalid admin email");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="email"
          placeholder="Admin Email"
          className="w-full p-2 border mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Checking admin credentials..." : "Login"}
        </button>
      </div>
    </div>
  );
}
