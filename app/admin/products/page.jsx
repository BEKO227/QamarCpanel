"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import AdminSidebar from "./../../components/AdminSideBar";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    title: "",
    brand: "", // ✅ NEW
    category: "",
    description: "",
    price: "",
    stock: "",
    images: [],
    styleVideo: "",
    isNewArrival: false,
    isOnSale: false,
    isTopSeller: false,
    slug: "",
  });

  const [imageInput, setImageInput] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({});
  const [editingImageInput, setEditingImageInput] = useState("");

  /* Fetch products */
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "scarves"));
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchProducts();
  }, []);

  /* Add product */
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
      brand: "",
      category: "",
      description: "",
      price: "",
      stock: "",
      images: [],
      styleVideo: "",
      isNewArrival: false,
      isOnSale: false,
      isTopSeller: false,
      slug: "",
    });

    setImageInput("");
  };

  /* Delete */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "scarves", id));
    setProducts(products.filter((p) => p.id !== id));
  };

  /* Edit */
  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditingProduct({ ...product });
    setEditingImageInput("");
  };

  const handleSave = async (id) => {
    await updateDoc(doc(db, "scarves", id), {
      ...editingProduct,
      price: parseFloat(editingProduct.price),
      stock: parseInt(editingProduct.stock),
    });

    setProducts(products.map((p) => (p.id === id ? editingProduct : p)));
    setEditingId(null);
  };

  /* Images */
  const addImage = () => {
    if (!imageInput.trim()) return;
    setNewProduct({
      ...newProduct,
      images: [...newProduct.images, imageInput],
    });
    setImageInput("");
  };

  const addEditingImage = () => {
    if (!editingImageInput.trim()) return;
    setEditingProduct({
      ...editingProduct,
      images: [...editingProduct.images, editingImageInput],
    });
    setEditingImageInput("");
  };

  const removeImage = (index, editing = false) => {
    const imgs = editing
      ? [...editingProduct.images]
      : [...newProduct.images];
    imgs.splice(index, 1);
    editing
      ? setEditingProduct({ ...editingProduct, images: imgs })
      : setNewProduct({ ...newProduct, images: imgs });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Products</h2>

        {/* ADD PRODUCT */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input className="input" placeholder="Title"
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          />

          <input className="input" placeholder="Brand"
            value={newProduct.brand}
            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
          />

          <input className="input" placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />

          <input className="input" placeholder="Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />

          <input type="number" className="input" placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />

          <input type="number" className="input" placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
          />

          <input className="input" placeholder="Style Video URL"
            value={newProduct.styleVideo}
            onChange={(e) => setNewProduct({ ...newProduct, styleVideo: e.target.value })}
          />

          <input className="input" placeholder="Slug"
            value={newProduct.slug}
            onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
          />

          {/* Images */}
          <div className="col-span-full">
            <div className="flex gap-2 mb-2">
              <input className="input flex-1" placeholder="Image URL"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
              />
              <button onClick={addImage} className="bg-blue-600 text-white px-4 rounded">
                Add Image
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {newProduct.images.map((img, i) => (
                <div key={i} className="relative w-16 h-16">
                  <Image src={img} alt="" fill className="object-cover rounded" />
                  <button onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleAdd}
            className="col-span-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Add Product
          </button>
        </div>

        {/* PRODUCT LIST */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow">
              {editingId === p.id ? (
                <>
                  <input className="input mb-2" value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  />
                  <input className="input mb-2" value={editingProduct.brand || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="Brand"
                  />

                  <input className="input mb-2" value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  />

                  <input className="input mb-2" type="number" value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                  />

                  <input className="input mb-2" type="number" value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <button onClick={() => handleSave(p.id)} className="bg-green-600 text-white px-4 py-1 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-1 rounded">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  {p.brand && <p className="text-sm text-gray-500">{p.brand}</p>}
                  <p className="text-gray-600">{p.price} EGP</p>
                  <p className="text-sm">Stock: {p.stock}</p>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-4 py-1 rounded">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-4 py-1 rounded">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
