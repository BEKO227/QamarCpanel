"use client";
import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderDetailsClient({ id }) {
  const [order, setOrder] = useState(null);
  const invoiceRef = useRef();

  // Safely handle hex colors for color dots
  const safeColor = (color) => {
    if (!color) return "#ccc";
    if (color.includes("lab") || color.includes("oklch") || color.includes("lch")) return "#000000";
    return color;
  };

  // Recursively override any unsupported colors in the DOM
  const overrideColors = (root) => {
    const elements = root.querySelectorAll("*");
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.color && /(lab|oklch|lch)/.test(style.color)) el.style.color = "#000";
      if (style.backgroundColor && /(lab|oklch|lch)/.test(style.backgroundColor)) el.style.backgroundColor = "#fff";
      if (style.borderColor && /(lab|oklch|lch)/.test(style.borderColor)) el.style.borderColor = "#000";
    });
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    // Clone the invoice to avoid modifying the live DOM
    const clone = invoiceRef.current.cloneNode(true);

    // Override unsupported colors
    overrideColors(clone);

    // Dynamically import html2pdf
    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0.5,
      filename: `Invoice-${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.classList?.contains("exclude-from-pdf"),
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(clone).save();
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) return;

      const orderData = { id: orderSnap.id, ...orderSnap.data() };

      if (orderData.userId) {
        const userRef = doc(db, "users", orderData.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) orderData.user = userSnap.data();
      }

      setOrder(orderData);
    };

    fetchOrder();
  }, [id]);

  if (!id || !order)
    return <p className="text-center mt-20 text-gray-500">Loading order...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Invoice container */}
      <div
        ref={invoiceRef}
        className="p-8 bg-white text-black"
        style={{ color: "#000", backgroundColor: "#fff" }} // enforce safe base colors
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div>
            <h2 className="text-3xl font-bold">INVOICE</h2>
            <p className="text-sm text-gray-500">#{order.id}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Order Details</p>
            <p className="text-sm">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer info */}
        <div className="mb-8">
          <p className="text-xs uppercase font-bold mb-1 text-gray-400">Customer</p>
          <p className="font-medium">{order.firstName} {order.lastName}</p>
          <p className="text-sm">{order.address}</p>
          <p className="text-sm">{order.phone}</p>
        </div>

        {/* Items table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              <th className="px-3 py-2 text-left text-sm">Product</th>
              <th className="px-3 py-2 text-center text-sm">Color</th>
              <th className="px-3 py-2 text-center text-sm">Qty</th>
              <th className="px-3 py-2 text-right text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => {
              const imageSrc = item.selectedColor?.image || item.imageCover || item.images?.[0] || "";
              return (
                <tr key={i} className="border-b">
                  <td className="px-3 py-4 flex items-center gap-3">
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                        crossOrigin="anonymous"
                      />
                    )}
                    <span className="font-medium text-sm">{item.title}</span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: safeColor(item.selectedColor?.hex) }}
                      />
                      <span className="text-[10px] text-gray-500">{item.selectedColor?.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center text-sm">{item.quantity}</td>
                  <td className="px-3 py-4 text-right text-sm">{(item.price * item.quantity).toFixed(2)} EGP</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{order.subtotal} EGP</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{order.total} EGP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download PDF button */}
      <button
        onClick={generatePDF}
        className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        🧾 Download PDF Invoice
      </button>
    </div>
  );
}
