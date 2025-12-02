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
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Products</h2>

        {/* Add Product Form */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Title"
            className="p-2 border rounded"
            value={newProduct.title}
            onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            className="p-2 border rounded"
            value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Stock"
            className="p-2 border rounded"
            value={newProduct.stock}
            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            className="p-2 border rounded"
            value={newProduct.imageCover}
            onChange={e => setNewProduct({ ...newProduct, imageCover: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="p-2 border rounded"
            value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Style Video URL"
            className="p-2 border rounded"
            value={newProduct.styleVideo}
            onChange={e => setNewProduct({ ...newProduct, styleVideo: e.target.value })}
          />
          <input
            type="text"
            placeholder="Slug"
            className="p-2 border rounded"
            value={newProduct.slug}
            onChange={e => setNewProduct({ ...newProduct, slug: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newProduct.isNewArrival}
              onChange={e => setNewProduct({ ...newProduct, isNewArrival: e.target.checked })}
            />
            New Arrival
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newProduct.isOnSale}
              onChange={e => setNewProduct({ ...newProduct, isOnSale: e.target.checked })}
            />
            On Sale
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newProduct.isTopSeller}
              onChange={e => setNewProduct({ ...newProduct, isTopSeller: e.target.checked })}
            />
            Top Seller
          </label>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded col-span-full shadow"
            onClick={handleAdd}
          >
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Image</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">New Arrival</th>
              <th className="border p-2">On Sale</th>
              <th className="border p-2">Top Seller</th>
              <th className="border p-2">Slug</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="text-center">
                <td className="border p-2">
                  {p.imageCover && <Image src={p.imageCover} alt={p.title} width={50} height={50} />}
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input value={editingProduct.title} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} className="p-1 border rounded w-full" />
                    : p.title
                  }
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="p-1 border rounded w-full" />
                    : p.price
                  }
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} className="p-1 border rounded w-full" />
                    : p.stock
                  }
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input type="checkbox" checked={editingProduct.isNewArrival} onChange={e => setEditingProduct({...editingProduct, isNewArrival: e.target.checked})} />
                    : p.isNewArrival ? "Yes" : "No"
                  }
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input type="checkbox" checked={editingProduct.isOnSale} onChange={e => setEditingProduct({...editingProduct, isOnSale: e.target.checked})} />
                    : p.isOnSale ? "Yes" : "No"
                  }
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input type="checkbox" checked={editingProduct.isTopSeller} onChange={e => setEditingProduct({...editingProduct, isTopSeller: e.target.checked})} />
                    : p.isTopSeller ? "Yes" : "No"
                  }
                </td>
                <td className="border p-2">
                  {editingId === p.id
                    ? <input value={editingProduct.slug} onChange={e => setEditingProduct({...editingProduct, slug: e.target.value})} className="p-1 border rounded w-full" />
                    : p.slug
                  }
                </td>
                <td className="border p-2 flex gap-1 justify-center">
                  {editingId === p.id
                    ? <>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded shadow" onClick={() => handleSave(p.id)}>Save</button>
                        <button className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded shadow" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    : <>
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded shadow" onClick={() => handleEdit(p)}>Edit</button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow" onClick={() => handleDelete(p.id)}>Delete</button>
                      </>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
