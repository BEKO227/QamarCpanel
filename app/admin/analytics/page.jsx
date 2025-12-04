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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const avgSpending = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.uid);
    const total = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      name: `${u.firstName} ${u.lastName}`,
      avgSpent: userOrders.length ? total / userOrders.length : 0,
    };
  });

  const ordersCount = users.map((u) => ({
    name: `${u.firstName} ${u.lastName}`,
    orders: orders.filter((o) => o.userId === u.uid).length,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">

      {/* Mobile Menu */}
      <button
        className="md:hidden p-3 m-3 bg-black text-white rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        Menu
      </button>

      {/* Sidebar */}
      {sidebarOpen && <AdminSidebar />}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      <main className="flex-1 p-4 md:p-8 bg-gray-100">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Charts (unchanged but mobile-fix added) */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>

            {topSelling.length === 0 ? (
              <p className="text-gray-600">No products sold yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSelling}>
                  <XAxis dataKey="title" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} pcs`} />
                  <Bar dataKey="sold">
                    {topSelling.map((_, i) => (
                      <Cell key={i} fill="#82ca9d" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Least selling */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Least Selling Products</h2>

            {leastSelling.length === 0 ? (
              <p className="text-gray-600">No products sold yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leastSelling}>
                  <XAxis dataKey="title" interval={0} tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} pcs`} />
                  <Bar dataKey="sold">
                    {leastSelling.map((_, i) => (
                      <Cell key={i} fill="#ff8042" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Avg Spending */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Average Spending per User</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgSpending}>
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(2)} EGP`} />
                <Bar dataKey="avgSpent" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders per user */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Orders per User</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersCount}
                  dataKey="orders"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {ordersCount.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => `${value} orders`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>
      </main>
    </div>
  );
}
