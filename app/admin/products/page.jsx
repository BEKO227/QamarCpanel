"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import AdminSidebar from './../../components/AdminSideBar';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    imageCover: "",
    styleVideo: "",
    isNewArrival: false,
    isOnSale: false,
    isTopSeller: false,
    slug: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({});

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const col = collection(db, "scarves");
      const snapshot = await getDocs(col);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  // Add new product
  const handleAdd = async () => {
    if (!newProduct.title || !newProduct.price) return;
    const docRef = await addDoc(collection(db, "scarves"), {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock || "0"),
      isNewArrival: Boolean(newProduct.isNewArrival),
      isOnSale: Boolean(newProduct.isOnSale),
      isTopSeller: Boolean(newProduct.isTopSeller),
    });
    setProducts([...products, { id: docRef.id, ...newProduct }]);
    setNewProduct({
      title: "",
      price: "",
      stock: "",
      description: "",
      imageCover: "",
      styleVideo: "",
      isNewArrival: false,
      isOnSale: false,
      isTopSeller: false,
      slug: "",
    });
  };

  // Delete product
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "scarves", id));
    setProducts(products.filter(p => p.id !== id));
  };

  // Start editing
  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditingProduct(product);
  };

  // Save edited product
  const handleSave = async (id) => {
    const docRef = doc(db, "scarves", id);
    await updateDoc(docRef, {
      ...editingProduct,
      price: parseFloat(editingProduct.price),
      stock: parseInt(editingProduct.stock)
    });
    setProducts(products.map(p => (p.id === id ? editingProduct : p)));
    setEditingId(null);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
  
      <main className="flex-1 p-4 sm:p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Products</h2>
  
        {/* Add Product Form */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input type="text" placeholder="Title" className="input" value={newProduct.title}
            onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} />
  
          <input type="number" placeholder="Price" className="input" value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
  
          <input type="number" placeholder="Stock" className="input" value={newProduct.stock}
            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
  
          <input type="text" placeholder="Image URL" className="input" value={newProduct.imageCover}
            onChange={e => setNewProduct({ ...newProduct, imageCover: e.target.value })} />
  
          <input type="text" placeholder="Description" className="input" value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
  
          <input type="text" placeholder="Style Video URL" className="input" value={newProduct.styleVideo}
            onChange={e => setNewProduct({ ...newProduct, styleVideo: e.target.value })} />
  
          <input type="text" placeholder="Slug" className="input" value={newProduct.slug}
            onChange={e => setNewProduct({ ...newProduct, slug: e.target.value })} />
  
          {/* Checkboxes */}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={newProduct.isNewArrival}
              onChange={e => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })} />
            <span>New Arrival</span>
          </div>
  
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={newProduct.isOnSale}
              onChange={e => setNewProduct({ ...newProduct, isOnSale: e.target.checked })} />
            <span>On Sale</span>
          </div>
  
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={newProduct.isTopSeller}
              onChange={e => setNewProduct({ ...newProduct, isTopSeller: e.target.checked })} />
            <span>Top Seller</span>
          </div>
  
          <button
            className="col-span-full bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700"
            onClick={handleAdd}
          >
            Add Product
          </button>
        </div>
  
        {/* ---------- MOBILE (CARD VIEW) ---------- */}
        <div className="grid sm:hidden gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex gap-3">
                <Image src={p.imageCover} alt={p.title} width={80} height={80} className="rounded" />
                <div className="flex-1">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="text-gray-600">{p.price} EGP</p>
                  <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                </div>
              </div>
  
              <div className="mt-3 flex gap-2">
                <button
                  className="flex-1 bg-yellow-500 text-white py-1 rounded"
                  onClick={() => handleEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 bg-red-500 text-white py-1 rounded"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {/* ---------- DESKTOP (TABLE VIEW) ---------- */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 bg-white rounded-xl shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="th">Image</th>
                <th className="th">Title</th>
                <th className="th">Price</th>
                <th className="th">Stock</th>
                <th className="th">New Arrival</th>
                <th className="th">On Sale</th>
                <th className="th">Top Seller</th>
                <th className="th">Slug</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
  
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="text-center border-t">
                  <td className="td">
                    {p.imageCover && <Image src={p.imageCover} alt={p.title} width={50} height={50} />}
                  </td>
  
                  <td className="td">
                    {editingId === p.id ? (
                      <input value={editingProduct.title} onChange={(e) =>
                        setEditingProduct({ ...editingProduct, title: e.target.value })} className="input-sm" />
                    ) : p.title}
                  </td>
  
                  <td className="td">
                    {editingId === p.id ? (
                      <input type="number" value={editingProduct.price} onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: e.target.value })} className="input-sm" />
                    ) : p.price}
                  </td>
  
                  <td className="td">
                    {editingId === p.id ? (
                      <input type="number" value={editingProduct.stock} onChange={(e) =>
                        setEditingProduct({ ...editingProduct, stock: e.target.value })} className="input-sm" />
                    ) : p.stock}
                  </td>
  
                  <td className="td">{p.isNewArrival ? "Yes" : "No"}</td>
                  <td className="td">{p.isOnSale ? "Yes" : "No"}</td>
                  <td className="td">{p.isTopSeller ? "Yes" : "No"}</td>
                  <td className="td">{p.slug}</td>
  
                  <td className="td">
                    {editingId === p.id ? (
                      <div className="flex gap-2 justify-center">
                        <button className="btn-blue" onClick={() => handleSave(p.id)}>Save</button>
                        <button className="btn-gray" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button className="btn-yellow" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="btn-red" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );  
}
