"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Box, ShoppingCart, ChartBar, Tag, Percent, Menu } from "lucide-react";

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

  return (
    <>
      {/* Hamburger for mobile */}
      <div className="md:hidden p-2 bg-blue-950 text-white flex items-center justify-between">
        <h2 className="font-bold">Qamar Admin</h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 top-0 left-0 h-screen w-60 bg-blue-950 text-white p-4 shadow transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-xl font-bold mb-6 hidden md:block">Qamar Scarves Admin</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 p-2 rounded transition ${
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "bg-white text-blue-950 font-bold"
                  : "hover:bg-gray-200 hover:text-black"
              }`}
              onClick={() => setIsOpen(false)} // Close sidebar on mobile after click
            >
              {link.icon}
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
