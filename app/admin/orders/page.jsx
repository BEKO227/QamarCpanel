"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import AdminSidebar from './../../components/AdminSideBar';
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

        const ordersData = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const order = { id: docSnap.id, ...docSnap.data() };

          // Optional: fetch user data for email
          if (order.userId) {
            const userRef = doc(db, "users", order.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              order.user = userSnap.data(); // only for email or other info
            }
          }

          return order;
        }));

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
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success("Order status updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  const statuses = ["pending", "waiting_for_payment", "processing", "shipped", "delivered", "cancelled"];

  // Filter orders by firstName, lastName, email, phone, or order ID
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    const firstName = order.firstName?.toLowerCase() || "";
    const lastName = order.lastName?.toLowerCase() || "";
    const email = order.user?.email?.toLowerCase() || "";
    const phone = order.phone?.toLowerCase() || "";
    const orderId = order.id.toLowerCase?.() || order.id.toString().toLowerCase();

    return (
      orderId.includes(term) ||
      firstName.includes(term) ||
      lastName.includes(term) ||
      email.includes(term) ||
      phone.includes(term)
    );
  });

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Orders</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Order ID, First Name, Last Name, Email, or Phone..."
          className="w-full p-2 mb-4 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredOrders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded shadow border border-gray-200">
                <div className="flex justify-between items-start flex-wrap mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-semibold">Order ID:</span> {order.id}
                    </p>
                    <h3 className="font-semibold">
                      {order.firstName} {order.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{order.address}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                    {order.user && order.user.email && (
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Email:</span> {order.user.email}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm mb-2">
                      <span className="font-semibold">Status:</span>
                      <select
                        className="ml-2 border rounded px-2 py-1 text-sm"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </p>

                    <button
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="mt-1 bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 text-sm"
                    >
                      {expandedId === order.id ? "Hide Details" : `View Details (${order.items.length})`}
                    </button>
                  </div>
                </div>

                {/* Expanded Order Items */}
                {expandedId === order.id && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="border p-2 rounded flex flex-col items-center">
                          {item.imageCover && (
                            <Image src={item.imageCover} alt={item.title} width={80} height={80} className="mb-2" />
                          )}
                          <p className="font-semibold text-sm text-center">{item.title}</p>
                          <p className="text-xs text-gray-600">Price: {item.price.toFixed(2)} EGP</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                          <p className="text-xs text-gray-600 font-semibold">
                            Subtotal: {(item.price * item.quantity).toFixed(2)} EGP
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-right text-gray-700 space-y-1">
                      <p><span className="font-semibold">Subtotal:</span> {(order.subtotal ?? 0).toFixed(2)} EGP</p>
                      <p><span className="font-semibold">Delivery Fee:</span> {(order.deliveryFee ?? 0).toFixed(2)} EGP</p>
                      <p><span className="font-semibold">Discount:</span> {(order.discount ?? 0).toFixed(2)} EGP</p>
                      <p className="font-semibold">Total: {(order.total ?? 0).toFixed(2)} EGP</p>
                      <p className="text-sm">
                        <span className="font-semibold">Payment Method:</span> {order.paymentMethod || "—"}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Created At:</span>{" "}
                        {order.createdAt?.seconds
                          ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                          : order.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
                      </p>
                      {order.promoCode && (
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">Promo:</span> {order.promoCode} (Discount: {(order.discount ?? 0).toFixed(2)} EGP)
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
