"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AdminSidebar from "./../../components/AdminSideBar";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersData = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);

      const productsSnapshot = await getDocs(collection(db, "scarves"));
      setProducts(productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const usersSnapshot = await getDocs(collection(db, "users"));
      setUsers(
        usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          const [firstName = "", lastName = ""] = (data.name || "").split(" ");
          return { uid: doc.id, firstName, lastName, ...data };
        })
      );
    };

    fetchData();
  }, []);

  // ---------------- Analytics Computations ----------------

  // Top selling products (from orders)
  const productSales = {};
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      if (!productSales[item.title]) productSales[item.title] = 0;
      productSales[item.title] += item.quantity || 0;
    });
  });

  const topSelling = Object.entries(productSales)
    .map(([title, sold]) => ({ title, sold }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const leastSelling = Object.entries(productSales)
    .map(([title, sold]) => ({ title, sold }))
    .sort((a, b) => a.sold - b.sold)
    .slice(0, 5);

  // Avg spending per user
  const avgSpending = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.uid);
    const total = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      name: `${u.firstName} ${u.lastName}`,
      avgSpent: userOrders.length ? total / userOrders.length : 0,
    };
  });

  // Orders per user
  const ordersCount = users.map((u) => ({
    name: `${u.firstName} ${u.lastName}`,
    orders: orders.filter((o) => o.userId === u.uid).length,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  // ---------------- Render ----------------
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Top Selling Products */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
            {topSelling.length === 0 ? (
              <p className="text-gray-600">No products sold yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSelling}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} pcs`} />
                  <Bar dataKey="sold" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Least Selling Products */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Least Selling Products</h2>
            {leastSelling.length === 0 ? (
              <p className="text-gray-600">No products sold yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leastSelling}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} pcs`} />
                  <Bar dataKey="sold" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Average Spending per User */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Average Spending per User</h2>
            {avgSpending.length === 0 ? (
              <p className="text-gray-600">No user spending data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgSpending}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toFixed(2)} EGP`} />
                  <Bar dataKey="avgSpent" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Orders per User */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Orders per User</h2>
            {ordersCount.length === 0 ? (
              <p className="text-gray-600">No orders placed yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersCount}
                    dataKey="orders"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {ordersCount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => `${value} orders`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
