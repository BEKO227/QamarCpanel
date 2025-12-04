"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function OrderDetailsClient({ id }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) return;

      const orderData = orderSnap.data();

      // 🔥 Fetch user email if userId exists
      if (orderData.userId) {
        const userRef = doc(db, "users", orderData.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          orderData.user = userSnap.data(); // contains email
        }
      }

      setOrder(orderData);
    };

    fetchOrder();
  }, [id]);

  if (!order)
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading order...
      </p>
    );

  const printInvoice = () => window.print();

  const timelineStages = [
    "pending",
    "waiting_for_payment",
    "processing",
    "shipped",
    "delivered",
  ];
  const stageIndex = timelineStages.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Order Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-2xl font-bold">Order #{id}</h2>
        <p className="text-gray-600">
          Placed on{" "}
          {order.createdAt?.seconds
            ? new Date(order.createdAt.seconds * 1000).toLocaleString()
            : "N/A"}
        </p>

        <button
          onClick={printInvoice}
          className="mt-4 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900"
        >
          🧾 Print Invoice
        </button>
      </div>

      {/* Customer Info */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">Customer Info</h3>

        <div className="space-y-1 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span>{" "}
            {order.firstName} {order.lastName}
          </p>

          <p>
            <span className="font-semibold">Phone:</span> {order.phone}
          </p>

          <p>
            <span className="font-semibold">Address:</span> {order.address}
          </p>

          {/* 🔥 Show fetched user email */}
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {order.user?.email || "—"}
          </p>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">Order Status Timeline</h3>
        <div className="flex items-center justify-between">
          {timelineStages.map((stage, index) => (
            <div
              key={stage}
              className={`flex-1 text-center ${
                index <= stageIndex ? "text-green-600" : "text-gray-400"
              }`}
            >
              ●
              <p className="text-sm capitalize">
                {stage.replace(/_/g, " ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-3">Items</h3>

        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border p-3 rounded-lg"
            >
              <Image
                src={item.imageCover}
                width={80}
                height={80}
                alt={item.title}
                className="rounded"
              />

              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                <p className="text-gray-600">
                  {item.price} EGP × {item.quantity}
                </p>
              </div>

              <p className="font-bold">
                {(item.quantity * item.price).toFixed(2)} EGP
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white p-5 rounded-xl shadow text-right">
        <p>
          <span className="font-semibold">Subtotal:</span>{" "}
          {order.subtotal} EGP
        </p>

        <p>
          <span className="font-semibold">Delivery Fee:</span>{" "}
          {order.deliveryFee} EGP
        </p>

        {/* Promo Code */}
        {order.promoCode || order.promocode ? (
          <p>
            <span className="font-semibold">Promo Code:</span>{" "}
            {order.promoCode || order.promocode}
          </p>
        ) : null}

        <p>
          <span className="font-semibold">Discount:</span>{" "}
          {order.discount || 0} EGP
        </p>

        <p className="text-2xl font-bold mt-3">
          Total: {order.total} EGP
        </p>
      </div>
    </div>
  );
}
