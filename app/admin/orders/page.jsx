"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import AdminSidebar from "./../../components/AdminSideBar";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // import router


export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const router = useRouter(); // initialize router


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
    } catch {
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
    return (
      order.id.toLowerCase().includes(term) ||
      order.firstName?.toLowerCase().includes(term) ||
      order.lastName?.toLowerCase().includes(term) ||
      order.user?.email?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-8 bg-gray-100">
        <h2 className="text-3xl font-bold mb-6">Orders</h2>

        <input
          type="text"
          placeholder="Search by Order ID, Name, Email, or Phone..."
          className="w-full p-3 mb-6 border rounded-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredOrders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl shadow border"
              >
                {/* Header */}
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      <b>Order ID:</b> {order.id}
                    </p>
                    <h3 className="font-semibold text-lg">
                      {order.firstName} {order.lastName}
                    </h3>
                    <p className="text-sm">{order.phone}</p>
                    {order.user?.email && (
                      <p className="text-sm">{order.user.email}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <select
                      className="border rounded px-3 py-1 text-sm"
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value)
                      }
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === order.id ? null : order.id
                        )
                      }
                      className="block mt-2 text-blue-600 text-sm"
                    >
                      {expandedId === order.id
                        ? "Hide Details"
                        : `View Details (${order.items.length})`}
                    </button>

                    {/* ✅ NEW: Redirect to full order page */}
                    <button
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                      className="block mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>

                {/* Items */}
                {expandedId === order.id && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-3 bg-gray-50 text-center"
                      >
                        {item.imageCover && (
                          <Image
                            src={item.imageCover}
                            alt={item.title}
                            width={90}
                            height={90}
                            className="mx-auto rounded mb-2"
                          />
                        )}

                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs">Qty: {item.quantity}</p>
                        <p className="text-xs">{item.price} EGP</p>

                        {item.selectedColor?.hex && (
                          <div className="flex justify-center items-center gap-2 mt-2">
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: item.selectedColor.hex,
                              }}
                            />
                            <span className="text-xs">
                              {item.selectedColor.name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
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