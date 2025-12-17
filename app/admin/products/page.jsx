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
    category: "",
    description: "",
    price: "",
    stock: "",
    images: [], // array of image URLs
    styleVideo: "",
    isNewArrival: false,
    isOnSale: false,
    isTopSeller: false,
    slug: "",
  });
  const [imageInput, setImageInput] = useState(""); // temporary input for new image

  const [editingId, setEditingId] = useState(null);
  const [editingProduct, setEditingProduct] = useState({});
  const [editingImageInput, setEditingImageInput] = useState("");

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "scarves"));
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

  // Delete product
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "scarves", id));
    setProducts(products.filter(p => p.id !== id));
  };

  // Edit product
  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditingProduct({ ...product });
    setEditingImageInput("");
  };

  const handleSave = async (id) => {
    const docRef = doc(db, "scarves", id);
    await updateDoc(docRef, {
      ...editingProduct,
      price: parseFloat(editingProduct.price),
      stock: parseInt(editingProduct.stock),
    });

    setProducts(products.map(p => p.id === id ? editingProduct : p));
    setEditingId(null);
  };

  // Add image to new product
  const addImage = () => {
    if (imageInput.trim() === "") return;
    setNewProduct({ ...newProduct, images: [...newProduct.images, imageInput] });
    setImageInput("");
  };

  // Add image while editing
  const addEditingImage = () => {
    if (editingImageInput.trim() === "") return;
    setEditingProduct({ ...editingProduct, images: [...editingProduct.images, editingImageInput] });
    setEditingImageInput("");
  };

  // Remove image
  const removeImage = (index, editing = false) => {
    if (editing) {
      const updatedImages = [...editingProduct.images];
      updatedImages.splice(index, 1);
      setEditingProduct({ ...editingProduct, images: updatedImages });
    } else {
      const updatedImages = [...newProduct.images];
      updatedImages.splice(index, 1);
      setNewProduct({ ...newProduct, images: updatedImages });
    }
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
          <input type="text" placeholder="Category" className="input" value={newProduct.category}
            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
          <input type="text" placeholder="Description" className="input" value={newProduct.description}
            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
          <input type="number" placeholder="Price" className="input" value={newProduct.price}
            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input type="number" placeholder="Stock" className="input" value={newProduct.stock}
            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
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

          {/* Images */}
          <div className="col-span-full">
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="Image URL" className="flex-1 input"
                value={imageInput} onChange={e => setImageInput(e.target.value)} />
              <button onClick={addImage} className="bg-blue-600 text-white px-4 rounded">Add Image</button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {newProduct.images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16">
                  <Image src={img} alt={`img-${idx}`} fill className="object-cover rounded" />
                  <button onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">x</button>
                </div>
              ))}
            </div>
          </div>

          <button
            className="col-span-full bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700"
            onClick={handleAdd}
          >
            Add Product
          </button>
        </div>

        {/* Product List */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow">
              {editingId === p.id ? (
                <>
                  <input type="text" value={editingProduct.title} onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })} className="input mb-2" />
                  <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} className="input mb-2" />
                  <textarea value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="input mb-2" placeholder="Description" />
                  <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} className="input mb-2" />
                  <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="input mb-2" />
                  <input type="text" value={editingProduct.styleVideo || ""} onChange={e => setEditingProduct({ ...editingProduct, styleVideo: e.target.value })} className="input mb-2" placeholder="Style Video URL" />
                  <input type="text" value={editingProduct.slug} onChange={e => setEditingProduct({ ...editingProduct, slug: e.target.value })} className="input mb-2" placeholder="Slug" />

                  {/* Editing images */}
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={editingImageInput} onChange={e => setEditingImageInput(e.target.value)} placeholder="Image URL" className="flex-1 input" />
                    <button onClick={addEditingImage} className="bg-blue-600 text-white px-4 rounded">Add</button>
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {editingProduct.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <Image src={img} alt={`img-${idx}`} fill className="object-cover rounded" />
                        <button onClick={() => removeImage(idx, true)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs">x</button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => handleSave(p.id)} className="bg-green-600 text-white px-4 py-1 rounded">Save</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg">{p.title}</h3>
                  <p className="text-gray-600">{p.price} EGP</p>
                  <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                  <div className="flex gap-2 flex-wrap my-2">
                    {Array.isArray(p.images) && p.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <Image src={img} alt={`img-${idx}`} fill className="object-cover rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-4 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-500 text-white px-4 py-1 rounded">Delete</button>
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
