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

  const emptyProduct = {
    title: "",
    brand: "",
    category: "",
    subCategory: "",
    description: "",
    price: 0,
    stock: 0,
    images: [],
    colors: [],
    styleVideo: "",
    isNewArrival: false,
    isOnSale: false,
    isTopSeller: false,
    slug: "",
  };

  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [imageInput, setImageInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({});
  const [editingImageInput, setEditingImageInput] = useState("");

  // 🔎 FILTER STATES
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");

  // 🔎 CATEGORY STRUCTURE (EDIT FREELY)
  const categoryOptions = {
    cotton: ["modal", "printed modal", "jel", "packet"],
    chiffon: [],
    silk: [],
    bandana: [],
    kuwaiti: ["woven", "breezy"],
    thailand: [],
  };

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "scarves"));
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchProducts();
  }, []);

  /* ================= ADD PRODUCT ================= */
  const handleAdd = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category) return;

    const cleanProduct = {
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock || 0),
      images: Array.isArray(newProduct.images) ? newProduct.images : [],
      colors: Array.isArray(newProduct.colors) ? newProduct.colors : [],
    };

    const docRef = await addDoc(collection(db, "scarves"), cleanProduct);
    setProducts([...products, { id: docRef.id, ...cleanProduct }]);
    setNewProduct(emptyProduct);
    setImageInput("");
  };

  /* ================= DELETE PRODUCT ================= */
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "scarves", id));
    setProducts(products.filter((p) => p.id !== id));
  };

  /* ================= EDIT PRODUCT ================= */
  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditingProduct({
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
    });
    setEditingImageInput("");
  };

  /* ================= SAVE EDIT ================= */
  const handleSave = async () => {
    if (!editingId) return;

    const cleanProduct = {
      title: editingProduct.title || "",
      brand: editingProduct.brand || "",
      category: editingProduct.category || "",
      subCategory: editingProduct.subCategory || "",
      description: editingProduct.description || "",
      price: Number(editingProduct.price) || 0,
      stock: Number(editingProduct.stock) || 0,
      images: Array.isArray(editingProduct.images)
        ? editingProduct.images.filter((i) => typeof i === "string")
        : [],
      colors: Array.isArray(editingProduct.colors)
        ? editingProduct.colors.filter((c) => c.name && c.image && c.hex)
        : [],
      styleVideo: editingProduct.styleVideo || "",
      isNewArrival: Boolean(editingProduct.isNewArrival),
      isOnSale: Boolean(editingProduct.isOnSale),
      isTopSeller: Boolean(editingProduct.isTopSeller),
      slug: editingProduct.slug || "",
    };

    await updateDoc(doc(db, "scarves", editingId), cleanProduct);

    setProducts(
      products.map((p) =>
        p.id === editingId ? { ...cleanProduct, id: editingId } : p
      )
    );

    setEditingId(null);
    setEditingProduct({});
  };

  /* ================= IMAGES ================= */
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
    const imgs = editing ? [...editingProduct.images] : [...newProduct.images];
    imgs.splice(index, 1);
    editing
      ? setEditingProduct({ ...editingProduct, images: imgs })
      : setNewProduct({ ...newProduct, images: imgs });
  };

  /* ================= COLORS ================= */
  const addColor = (editing = false) => {
    const colorObj = { name: "", image: "", hex: "#ffffff" };
    if (editing) {
      setEditingProduct({
        ...editingProduct,
        colors: [...editingProduct.colors, colorObj],
      });
    } else {
      setNewProduct({ ...newProduct, colors: [...newProduct.colors, colorObj] });
    }
  };

  const updateColor = (index, field, value, editing = false) => {
    const arr = editing ? [...editingProduct.colors] : [...newProduct.colors];
    arr[index][field] = value;
    editing
      ? setEditingProduct({ ...editingProduct, colors: arr })
      : setNewProduct({ ...newProduct, colors: arr });
  };

  const removeColor = (index, editing = false) => {
    const arr = editing ? [...editingProduct.colors] : [...newProduct.colors];
    arr.splice(index, 1);
    editing
      ? setEditingProduct({ ...editingProduct, colors: arr })
      : setNewProduct({ ...newProduct, colors: arr });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Products</h2>

        {/* ================= ADD PRODUCT ================= */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {["title", "brand", "category", "subCategory", "slug"].map((f) => (
            <input
              key={f}
              className="input"
              placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
              value={newProduct[f]}
              onChange={(e) =>
                setNewProduct({ ...newProduct, [f]: e.target.value })
              }
            />
          ))}

          <textarea
            className="input"
            placeholder="Description"
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
          />

          <input
            type="number"
            className="input"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
          />

          <input
            type="number"
            className="input"
            placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) =>
              setNewProduct({ ...newProduct, stock: e.target.value })
            }
          />

          {/* ================= CHECKBOXES ================= */}
          <div className="flex gap-4 col-span-full">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newProduct.isNewArrival}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    isNewArrival: e.target.checked,
                  })
                }
              />
              New Arrival
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newProduct.isOnSale}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, isOnSale: e.target.checked })
                }
              />
              On Sale
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newProduct.isTopSeller}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    isTopSeller: e.target.checked,
                  })
                }
              />
              Top Seller
            </label>
          </div>

          {/* ================= IMAGES ================= */}
          <div className="col-span-full">
            <div className="flex gap-2 mb-2">
              <input
                className="input flex-1"
                placeholder="Image URL"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
              />
              <button
                onClick={addImage}
                className="bg-blue-600 text-white px-4 rounded"
              >
                Add
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {newProduct.images.map((img, i) => (
                <div key={i} className="relative w-16 h-16">
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover rounded"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ================= COLORS ================= */}
          <div className="col-span-full">
            <button
              onClick={() => addColor(false)}
              className="mb-2 bg-purple-600 text-white px-4 py-1 rounded"
            >
              Add Color
            </button>

            {newProduct.colors.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input
                  className="input flex-1"
                  placeholder="Name"
                  value={c.name}
                  onChange={(e) => updateColor(i, "name", e.target.value)}
                />
                <input
                  className="input flex-1"
                  placeholder="Image URL"
                  value={c.image}
                  onChange={(e) => updateColor(i, "image", e.target.value)}
                />
                <input
                  type="color"
                  className="w-12 h-12 p-0 border-none"
                  value={c.hex}
                  onChange={(e) => updateColor(i, "hex", e.target.value)}
                />
                <button
                  onClick={() => removeColor(i)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAdd}
            className="col-span-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Add Product
          </button>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4 flex-wrap">
          <select
            className="input"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubCategory("all");
            }}
          >
            <option value="all">All Categories</option>

            {Object.keys(categoryOptions).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            disabled={selectedCategory === "all"}
          >
            <option value="all">All Sub Categories</option>

            {selectedCategory !== "all" &&
              categoryOptions[selectedCategory]?.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
        </div>

        {/* ================= PRODUCT LIST ================= */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products
            .filter((p) =>
              selectedCategory === "all"
                ? true
                : (p.category || "").toLowerCase() === selectedCategory
            )
            .filter((p) =>
              selectedSubCategory === "all"
                ? true
                : (p.subCategory || "").toLowerCase() === selectedSubCategory
            )
            .map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl shadow">
                {editingId === p.id ? (
                  <>
                    {["title", "brand", "category", "subCategory", "slug"].map(
                      (f) => (
                        <input
                          key={f}
                          className="input mb-2"
                          value={editingProduct[f] || ""}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              [f]: e.target.value,
                            })
                          }
                        />
                      )
                    )}

                    <textarea
                      className="input mb-2"
                      value={editingProduct.description || ""}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input mb-2"
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input mb-2"
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: e.target.value,
                        })
                      }
                    />

                    {/* CHECKBOXES */}
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.isNewArrival}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isNewArrival: e.target.checked,
                            })
                          }
                        />
                        New Arrival
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.isOnSale}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isOnSale: e.target.checked,
                            })
                          }
                        />
                        On Sale
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.isTopSeller}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              isTopSeller: e.target.checked,
                            })
                          }
                        />
                        Top Seller
                      </label>
                    </div>

                    {/* COLORS */}
                    <div className="col-span-full mb-2">
                      <button
                        onClick={() => addColor(true)}
                        className="mb-2 bg-purple-600 text-white px-4 py-1 rounded"
                      >
                        Add Color
                      </button>

                      {editingProduct.colors?.map((c, i) => (
                        <div
                          key={i}
                          className="flex gap-2 mb-2 items-center"
                        >
                          <input
                            className="input flex-1"
                            placeholder="Name"
                            value={c.name}
                            onChange={(e) =>
                              updateColor(i, "name", e.target.value, true)
                            }
                          />
                          <input
                            className="input flex-1"
                            placeholder="Image URL"
                            value={c.image}
                            onChange={(e) =>
                              updateColor(i, "image", e.target.value, true)
                            }
                          />
                          <input
                            type="color"
                            className="w-12 h-12 p-0 border-none"
                            value={c.hex}
                            onChange={(e) =>
                              updateColor(i, "hex", e.target.value, true)
                            }
                          />
                          <button
                            onClick={() => removeColor(i, true)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-4 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg">{p.title}</h3>

                    <p className="text-sm text-gray-500">{p.brand}</p>

                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {p.description}
                    </p>

                    {/* IMAGES */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {p.images?.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded overflow-hidden border"
                        >
                          <Image
                            src={img}
                            alt={p.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <p className="text-gray-600 mt-2">{p.price} EGP</p>

                    <p className="text-sm">Stock: {p.stock}</p>

                    <p className="text-sm">
                      Category: {p.category} / {p.subCategory}
                    </p>

                    <p className="text-sm">
                      New: {p.isNewArrival ? "Yes" : "No"}, On Sale:{" "}
                      {p.isOnSale ? "Yes" : "No"}, Top Seller:{" "}
                      {p.isTopSeller ? "Yes" : "No"}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-500 text-white px-4 py-1 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded"
                      >
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
