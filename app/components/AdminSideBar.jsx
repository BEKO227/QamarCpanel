"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Box,
  ShoppingCart,
  ChartBar,
  Tag,
  Percent,
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <ChartBar className="w-5 h-5" /> },
    { href: "/admin/users", label: "Users", icon: <User className="w-5 h-5" /> },
    { href: "/admin/products", label: "Products", icon: <Box className="w-5 h-5" /> },
    { href: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-5 h-5" /> },
    { href: "/admin/promocodes", label: "Promo Codes", icon: <Tag className="w-5 h-5" /> },
    { href: "/admin/analytics", label: "Analytics", icon: <ChartBar className="w-5 h-5" /> },
    { href: "/admin/Sale", label: "Sale", icon: <Percent className="w-5 h-5" /> },
  ];

  /* Prevent background scroll on mobile when open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 p-3 bg-blue-950 text-white flex items-center justify-between">
        <button onClick={() => setIsOpen((prev) => !prev)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 top-0 left-0 h-screen w-64 md:w-60
        bg-blue-950 text-white p-4 shadow-lg
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between md:hidden mb-6">
          <h2 className="font-bold text-lg">Qamar Admin</h2>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Title */}
        <h2 className="text-xl font-bold mb-6 hidden md:block">
          Qamar Scarves Admin
        </h2>

        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition
                  ${
                    isActive
                      ? "bg-white text-blue-950 font-semibold shadow"
                      : "hover:bg-gray-200 hover:text-black"
                  }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
