"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminSidebar from "./../../components/AdminSideBar";

export default function PromoCodesPage() {
  const [codes, setCodes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState(initialState());
  const [editCode, setEditCode] = useState(null);

  function initialState() {
    return {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      usageLimit: "",
      firstOrderOnly: false,
      active: true,
      expiresAt: "",
    };
  }

  // Fetch promo codes
  useEffect(() => {
    const fetchCodes = async () => {
      const snapshot = await getDocs(collection(db, "promocodes"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCodes(data);
      setFiltered(data);
    };
    fetchCodes();
  }, []);

  // Search & Filter
  useEffect(() => {
    let list = [...codes];

    if (search.trim() !== "") {
      list = list.filter((c) =>
        c.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      list = list.filter((c) => (filterStatus === "active" ? c.active : !c.active));
    }

    setFiltered(list);
  }, [search, filterStatus, codes]);

  // Add promo code
  const handleAdd = async () => {
    if (!newCode.code) return;

    const ref = doc(db, "promocodes", newCode.code.toUpperCase());

    await setDoc(ref, {
      ...newCode,
      code: newCode.code.toUpperCase(),
      discountValue: Number(newCode.discountValue),
      minPurchase: Number(newCode.minPurchase),
      maxDiscount: Number(newCode.maxDiscount),
      usageLimit: Number(newCode.usageLimit),
      active: Boolean(newCode.active),
      firstOrderOnly: Boolean(newCode.firstOrderOnly),
      expiresAt: new Date(newCode.expiresAt),
      usedCount: 0,
    });

    setCodes([...codes, { id: newCode.code.toUpperCase(), ...newCode }]);
    setNewCode(initialState());
    setShowAddModal(false);
  };

  // Delete
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "promocodes", id));
    setCodes(codes.filter((c) => c.id !== id));
  };

  // Update
  const handleUpdate = async () => {
    if (!editCode) return;
    const ref = doc(db, "promocodes", editCode.id);

    await updateDoc(ref, {
      ...editCode,
      discountValue: Number(editCode.discountValue),
      minPurchase: Number(editCode.minPurchase),
      maxDiscount: Number(editCode.maxDiscount),
      usageLimit: Number(editCode.usageLimit),
      active: Boolean(editCode.active),
      firstOrderOnly: Boolean(editCode.firstOrderOnly),
      expiresAt: new Date(editCode.expiresAt),
    });

    setCodes(codes.map((c) => (c.id === editCode.id ? editCode : c)));
    setEditCode(null);
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Promo Codes</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            onClick={() => setShowAddModal(true)}
          >
            + Add Promo Code
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search promo code..."
            className="p-2 border rounded w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-2 border rounded"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full table-auto border-collapse border">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border p-2">Code</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Value</th>
              <th className="border p-2">Min</th>
              <th className="border p-2">Max</th>
              <th className="border p-2">Usage</th>
              <th className="border p-2">Used</th>
              <th className="border p-2">First Order</th>
              <th className="border p-2">Expires</th>
              <th className="border p-2">Active</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="text-center bg-white">
                <td className="border p-2 font-bold">{c.id}</td>
                <td className="border p-2">{c.description}</td>
                <td className="border p-2">
                  {c.discountValue}
                  {c.discountType === "percentage" ? "%" : " EGP"}
                </td>
                <td className="border p-2">{c.minPurchase}</td>
                <td className="border p-2">{c.maxDiscount}</td>
                <td className="border p-2">{c.usageLimit}</td>
                <td className="border p-2">{c.usedCount || 0}</td>
                <td className="border p-2">{c.firstOrderOnly ? "Yes" : "No"}</td>
                <td className="border p-2">
                  {c.expiresAt?.seconds
                    ? new Date(c.expiresAt.seconds * 1000).toLocaleString()
                    : ""}
                </td>
                <td className="border p-2">{c.active ? "Yes" : "No"}</td>

                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    className="bg-yellow-500 px-3 py-1 rounded"
                    onClick={() =>
                      setEditCode({
                        ...c,
                        expiresAt: new Date(c.expiresAt.seconds * 1000)
                          .toISOString()
                          .slice(0, 16),
                      })
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-600 px-3 py-1 rounded"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add Modal */}
        {showAddModal && (
          <PromoModal
            title="Add Promo Code"
            data={newCode}
            setData={setNewCode}
            onClose={() => setShowAddModal(false)}
            onSave={handleAdd}
          />
        )}

        {/* Edit Modal */}
        {editCode && (
          <PromoModal
            title="Edit Promo Code"
            data={editCode}
            setData={setEditCode}
            onClose={() => setEditCode(null)}
            onSave={handleUpdate}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------------- Modal Component ---------------------- */

function PromoModal({ title, data, setData, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-xl w-full max-w-lg">
        <h3 className="text-xl font-bold mb-4">{title}</h3>

        <div className="grid grid-cols-1 gap-2">
          {renderInputs(data, setData)}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Inputs Renderer ---------------------- */

function renderInputs(state, setState) {
  return (
    <>
      <input
        className="p-2 border rounded"
        placeholder="Code"
        value={state.code}
        onChange={(e) => setState({ ...state, code: e.target.value })}
      />

      <input
        className="p-2 border rounded"
        placeholder="Description"
        value={state.description}
        onChange={(e) => setState({ ...state, description: e.target.value })}
      />

      <select
        className="p-2 border rounded"
        value={state.discountType}
        onChange={(e) => setState({ ...state, discountType: e.target.value })}
      >
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed (EGP)</option>
      </select>

      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Discount Value"
        value={state.discountValue}
        onChange={(e) => setState({ ...state, discountValue: e.target.value })}
      />

      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Min Purchase"
        value={state.minPurchase}
        onChange={(e) => setState({ ...state, minPurchase: e.target.value })}
      />

      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Max Discount"
        value={state.maxDiscount}
        onChange={(e) => setState({ ...state, maxDiscount: e.target.value })}
      />

      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Usage Limit"
        value={state.usageLimit}
        onChange={(e) => setState({ ...state, usageLimit: e.target.value })}
      />

      <input
        type="datetime-local"
        className="p-2 border rounded"
        value={state.expiresAt}
        onChange={(e) => setState({ ...state, expiresAt: e.target.value })}
      />

      {/* First Order Only */}
      <label className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={state.firstOrderOnly}
          onChange={(e) => setState({ ...state, firstOrderOnly: e.target.checked })}
        />
        First Order Only
      </label>

      {/* Active */}
      <label className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          checked={state.active}
          onChange={(e) => setState({ ...state, active: e.target.checked })}
        />
        Active
      </label>
    </>
  );
}
