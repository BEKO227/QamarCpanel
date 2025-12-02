"use client";
import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSideBar";
import { FaUsers, FaBoxOpen, FaShoppingCart, FaTag, FaChartLine } from "react-icons/fa";
import { db } from "@/lib/firebase"; // adjust to your backend import
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function AdminHome() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, promocodes: 0, analytics: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const usersCount = (await getDocs(collection(db, "users"))).size;
        const productsCount = (await getDocs(collection(db, "products"))).size;
        const ordersCount = (await getDocs(collection(db, "orders"))).size;
        const promocodesCount = (await getDocs(collection(db, "promocodes"))).size;
        const analyticsCount = ordersCount; // example metric

        setStats({ users: usersCount, products: productsCount, orders: ordersCount, promocodes: promocodesCount, analytics: analyticsCount });

        // Fetch recent activity: latest 5 orders, users, and promo codes
        const recentUsersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(2)));
        const recentOrdersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(2)));
        const recentPromoSnap = await getDocs(query(collection(db, "promocodes"), orderBy("createdAt", "desc"), limit(1)));

        const activities = [];

        recentUsersSnap.forEach((doc) => activities.push({ type: "New User", detail: doc.data().email }));
        recentOrdersSnap.forEach((doc) => activities.push({ type: "New Order", detail: `Order #${doc.id}` }));
        recentPromoSnap.forEach((doc) => activities.push({ type: "Promo Code", detail: doc.data().code }));

        // Sort by createdAt descending if available (optional)
        setRecentActivity(activities);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg">Loading dashboard...</p>
      </div>
    );

  const dashboardCards = [
    { title: "Users", value: stats.users, icon: <FaUsers className="text-4xl text-blue-500" /> },
    { title: "Products", value: stats.products, icon: <FaBoxOpen className="text-4xl text-green-500" /> },
    { title: "Orders", value: stats.orders, icon: <FaShoppingCart className="text-4xl text-yellow-500" /> },
    { title: "Promo Codes", value: stats.promocodes, icon: <FaTag className="text-4xl text-purple-500" /> },
    { title: "Analytics", value: stats.analytics, icon: <FaChartLine className="text-4xl text-red-500" /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Qamar Scarves Admin Dashboard</h1>
        <p className="text-gray-700 mb-8">Use the sidebar to manage Users, Products, Orders, Promo Codes, and view Analytics.</p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {dashboardCards.map((card) => (
            <div key={card.title} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center">
                <div className="mr-4">{card.icon}</div>
                <div>
                  <p className="text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            {recentActivity.length === 0 ? (
              <li className="text-gray-500">No recent activity</li>
            ) : (
              recentActivity.map((act, idx) => (
                <li key={idx} className="p-2 border-b border-gray-200">
                  <span className="font-semibold">{act.type}:</span> {act.detail}
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
