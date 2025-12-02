"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "../../components/AdminSideBar";

export default function SaleSettingsPage() {
  const [saleBar, setSaleBar] = useState({ description: "" });
  const [salePopUp, setSalePopUp] = useState({ title: "", description: "" });

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const barSnap = await getDoc(doc(db, "Sale", "SaleBar"));
      const popSnap = await getDoc(doc(db, "Sale", "SalePopUp"));

      if (barSnap.exists()) setSaleBar(barSnap.data());
      if (popSnap.exists()) setSalePopUp(popSnap.data());
    };

    fetchData();
  }, []);

  // UPDATE SALE BAR
  const updateSaleBar = async () => {
    await updateDoc(doc(db, "Sale", "SaleBar"), {
      description: saleBar.description,
    });
    alert("Sale Bar updated successfully!");
  };

  // UPDATE SALE POPUP
  const updateSalePopUp = async () => {
    await updateDoc(doc(db, "Sale", "SalePopUp"), {
      title: salePopUp.title,
      description: salePopUp.description,
    });
    alert("Sale Pop-Up updated successfully!");
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Sale Settings</h1>

        {/* SALE BAR */}
        <div className="mb-8 p-5 bg-white border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Sale Bar (Top Banner)</h2>

          <label className="block font-medium mb-1">Description</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={saleBar.description}
            onChange={(e) =>
              setSaleBar({ ...saleBar, description: e.target.value })
            }
            placeholder="Enter sale bar description"
          />

          <button
            onClick={updateSaleBar}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Sale Bar
          </button>
        </div>

        {/* SALE POPUP */}
        <div className="p-5 bg-white border rounded shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Sale Pop-Up</h2>

          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            className="border p-2 rounded w-full mb-3"
            value={salePopUp.title}
            onChange={(e) =>
              setSalePopUp({ ...salePopUp, title: e.target.value })
            }
            placeholder="Enter popup title"
          />

          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="border p-2 rounded w-full h-24"
            value={salePopUp.description}
            onChange={(e) =>
              setSalePopUp({ ...salePopUp, description: e.target.value })
            }
            placeholder="Enter popup description"
          />

          <button
            onClick={updateSalePopUp}
            className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Save Pop-Up
          </button>
        </div>
      </main>
    </div>
  );
}
