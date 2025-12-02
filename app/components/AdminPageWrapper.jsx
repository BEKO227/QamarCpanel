"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPageWrapper({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin-token="))
      ?.split("=")[1];

    if (!token) {
      router.push("/admin/login");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}
