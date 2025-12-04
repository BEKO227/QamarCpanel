"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "./../../components/AdminSideBar";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCol = collection(db, "users");
      const snapshot = await getDocs(usersCol);
      setUsers(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          const [firstName = "", lastName = ""] = (data.name || "").split(" ");
          return { id: doc.id, firstName, lastName, ...data };
        })
      );
    };

    const fetchOrders = async () => {
      const ordersCol = collection(db, "orders");
      const snapshot = await getDocs(ordersCol);
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
    fetchOrders();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const getOrdersForUser = (userId) => {
    return orders.filter((order) => order.userId === userId);
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-auto">
        <AdminSidebar />
      </div>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 bg-gray-100 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-center md:text-left">
          Users
        </h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className="w-full p-3 mb-6 border rounded-lg shadow-sm text-sm sm:text-base"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No users found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const userOrders = getOrdersForUser(user.id);

              return (
                <div
                  key={user.id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border"
                >
                  <h3 className="text-xl font-bold mb-1 wrap-break-words">
                    {user.firstName} {user.lastName}
                  </h3>

                  <p className="text-gray-600 text-sm break-all">{user.email}</p>
                  <p className="text-gray-600 text-sm mb-3">{user.phone}</p>

                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <strong>Gender:</strong> {user.gender || "—"}
                    </p>
                    <p>
                      <strong>Age:</strong> {user.age || "—"}
                    </p>
                    <p className="wrap-break-words">
                      <strong>Location:</strong> {user.location || "—"}
                    </p>
                    <p>
                      <strong>Products Bought:</strong>{" "}
                      {user.productsBoughtCount ?? 0}
                    </p>
                    <p>
                      <strong>Avg Spent:</strong>{" "}
                      {user.avgSpent?.toFixed?.(2) ?? "0"} EGP
                    </p>
                    <p>
                      <strong>Coupons Used:</strong>{" "}
                      {user.couponsUsedCount ?? 0}
                    </p>
                    <p>
                      <strong>Purchases Without Sale:</strong>{" "}
                      {user.purchasesWithoutSale ?? 0}
                    </p>

                    <p className="text-gray-500 text-xs mt-2">
                      Joined:{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  {/* Expand / Collapse Orders */}
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        setExpandedUser(
                          expandedUser === user.id ? null : user.id
                        )
                      }
                      className="text-blue-600 text-sm underline hover:text-blue-800"
                    >
                      {expandedUser === user.id ? "Hide Orders" : "Show Orders"}
                    </button>

                    {expandedUser === user.id && (
                      <div className="mt-3 max-h-32 overflow-y-auto border p-3 rounded bg-gray-50">
                        {userOrders.length > 0 ? (
                          userOrders.map((order) => (
                            <Link
                              key={order.id}
                              href={`/admin/orders/${order.id}`}
                              className="block text-blue-700 hover:underline text-sm mb-1"
                            >
                              Order #{order.id} —{" "}
                              {order.total?.toFixed(2) ?? 0} EGP
                            </Link>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No orders found
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
