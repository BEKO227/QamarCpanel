"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/promocodes", label: "Promo Codes" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/Sale", label: "Sale" },

  ];

  return (
    <aside className="w-60 bg-blue-950 text-white p-4 h-screen shadow">
      <h2 className="text-xl font-bold mb-6">Qamar Scarves Admin</h2>
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`p-2 rounded transition ${
              pathname.startsWith(link.href)
                ? "bg-white text-blue-950 font-bold"
                : "hover:bg-gray-200 hover:text-black"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
