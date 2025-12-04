"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import AdminSidebar from "./../../components/AdminSideBar";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const col = collection(db, "orders");
        const snapshot = await getDocs(col);

        const ordersData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const order = { id: docSnap.id, ...docSnap.data() };

            if (order.userId) {
              const userRef = doc(db, "users", order.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) order.user = userSnap.data();
            }
            return order;
          })
        );

        setOrders(ordersData);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Order status updated!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const statuses = [
    "pending",
    "waiting_for_payment",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const firstName = order.firstName?.toLowerCase() || "";
    const lastName = order.lastName?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    const phone = order.phone?.toLowerCase() || "";
    const orderId = order.id.toLowerCase();

    return (
      orderId.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      email.includes(term) ||
      phone.includes(term)
    );
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-gray-100">
        <h2 className="text-3xl font-bold mb-6">Orders</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by Order ID, Name, Email, or Phone..."
          className="w-full p-3 mb-6 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredOrders.length === 0 ? (
          <p className="text-gray-600 text-lg">No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition border border-gray-200"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Order ID:</span> {order.id}
                    </p>

                    <h3 className="font-semibold text-lg">
                      {order.firstName} {order.lastName}
                    </h3>

                    <p className="text-sm text-gray-600">{order.address}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>

                    {order.user?.email && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Email:</span>{" "}
                        {order.user.email}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    <p className="text-sm font-semibold mb-1">Status</p>
                    <select
                      className="border rounded-lg px-3 py-1 text-sm bg-gray-50"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() =>
                        setExpandedId(expandedId === order.id ? null : order.id)
                      }
                      className="block mt-3 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200"
                    >
                      {expandedId === order.id
                        ? "Hide Details"
                        : `View Details (${order.items.length})`}
                    </button>
                  </div>
                </div>

                {/* Expanded Items */}
                {expandedId === order.id && (
                  <div className="mt-5">
                    <div className="grid grid-cols-2 gap-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="border p-3 rounded-xl bg-gray-50 flex flex-col items-center"
                        >
                          {item.imageCover && (
                            <Image
                              src={item.imageCover}
                              alt={item.title}
                              width={90}
                              height={90}
                              className="rounded mb-2"
                            />
                          )}
                          <p className="font-semibold text-sm text-center">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            Price: {item.price} EGP
                          </p>
                          <p className="text-xs">Qty: {item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="mt-6 text-right space-y-1 text-gray-700">
                      <p>
                        <span className="font-bold">Subtotal:</span>{" "}
                        {order.subtotal?.toFixed(2)} EGP
                      </p>
                      <p>
                        <span className="font-bold">Delivery:</span>{" "}
                        {order.deliveryFee?.toFixed(2)} EGP
                      </p>
                      <p>
                        <span className="font-bold">Discount:</span>{" "}
                        {order.discount?.toFixed(2)} EGP
                      </p>
                      <p className="font-bold text-lg">
                        Total: {order.total?.toFixed(2)} EGP
                      </p>

                      <p className="text-sm">
                        <span className="font-semibold">Payment:</span>{" "}
                        {order.paymentMethod}
                      </p>

                      <p className="text-sm">
                        <span className="font-semibold">Created:</span>{" "}
                        {order.createdAt?.seconds
                          ? new Date(
                              order.createdAt.seconds * 1000
                            ).toLocaleString()
                          : "N/A"}
                      </p>

                      {order.promoCode && (
                        <p className="text-green-700 text-sm font-semibold">
                          Promo: {order.promoCode}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
