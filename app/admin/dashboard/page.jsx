"use client";
import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/AdminSideBar";
import { FaUsers, FaBoxOpen, FaShoppingCart, FaTag, FaChartLine } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

export default function AdminHome() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, promocodes: 0, analytics: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersCount = (await getDocs(collection(db, "users"))).size;
        const productsCount = (await getDocs(collection(db, "products"))).size;
        const ordersCount = (await getDocs(collection(db, "orders"))).size;
        const promocodesCount = (await getDocs(collection(db, "promocodes"))).size;

        setStats({
          users: usersCount,
          products: productsCount,
          orders: ordersCount,
          promocodes: promocodesCount,
          analytics: ordersCount,
        });

        const recentUsersSnap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"), limit(2)));
        const recentOrdersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(2)));
        const recentPromoSnap = await getDocs(query(collection(db, "promocodes"), orderBy("createdAt", "desc"), limit(1)));

        const activities = [];
        recentUsersSnap.forEach((doc) => activities.push({ type: "New User", detail: doc.data().email }));
        recentOrdersSnap.forEach((doc) => activities.push({ type: "New Order", detail: `Order #${doc.id}` }));
        recentPromoSnap.forEach((doc) => activities.push({ type: "Promo Code", detail: doc.data().code }));

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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg font-medium">Loading dashboard...</p>
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
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          Welcome to Qamar Scarves Admin Dashboard
        </h1>

        <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base">
          Use the sidebar to manage Users, Products, Orders, Promo Codes, and view Analytics.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {dashboardCards.map((card) => (
            <div
              key={card.title}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center">
                <div className="mr-4">{card.icon}</div>
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 sm:mt-10 bg-white p-5 sm:p-6 rounded-xl shadow">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Recent Activity</h2>

          <ul className="space-y-2">
            {recentActivity.length === 0 ? (
              <li className="text-gray-500 text-sm">No recent activity</li>
            ) : (
              recentActivity.map((act, idx) => (
                <li
                  key={idx}
                  className="p-2 border-b border-gray-200 text-sm sm:text-base flex justify-between"
                >
                  <span className="font-semibold">{act.type}:</span>
                  <span className="ml-2">{act.detail}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
