"use client";
import React from "react";
import AdminSidebar from "./components/AdminSideBar";
import { User, Box, ShoppingCart, ChartBar, Tag, Percent } from "lucide-react";

export default function AdminHome() {
  const cards = [
    { title: "Users", description: "View and manage all registered users.", icon: <User className="w-8 h-8 text-blue-500" />, bg: "bg-blue-50", hover: "hover:bg-blue-100" },
    { title: "Products", description: "Add, edit, and remove products from the catalog.", icon: <Box className="w-8 h-8 text-green-500" />, bg: "bg-green-50", hover: "hover:bg-green-100" },
    { title: "Orders", description: "Track all orders and update their status.", icon: <ShoppingCart className="w-8 h-8 text-purple-500" />, bg: "bg-purple-50", hover: "hover:bg-purple-100" },
    { title: "Promo Codes", description: "Manage promo codes and discounts.", icon: <Tag className="w-8 h-8 text-pink-500" />, bg: "bg-pink-50", hover: "hover:bg-pink-100" },
    { title: "Analytics", description: "View charts and metrics for products and sales.", icon: <ChartBar className="w-8 h-8 text-yellow-500" />, bg: "bg-yellow-50", hover: "hover:bg-yellow-100" },
    { title: "Sale Settings", description: "Manage Sale Bar and Pop-Up.", icon: <Percent className="w-8 h-8 text-red-500" />, bg: "bg-red-50", hover: "hover:bg-red-100" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 md:ml-60">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            Qamar Scarves Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to your dashboard! Use the sidebar to manage users, products, orders, promo codes, and analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Card key={card.title} {...card} />
          ))}
        </div>
      </main>
    </div>
  );
}

const Card = ({ title, description, icon, bg, hover }: { title: string; description: string; icon: React.ReactNode; bg?: string; hover?: string }) => (
  <div className={`flex flex-col justify-between p-6 rounded-xl shadow-md transition-all duration-300 ${bg} ${hover} cursor-pointer hover:shadow-xl`}>
    <div className="flex items-center mb-4 space-x-4">{icon}<h2 className="text-xl font-semibold text-gray-800">{title}</h2></div>
    <p className="text-gray-600">{description}</p>
  </div>
);
