import OrderDetailsClient from "./OrderDetailsClient";
import AdminSidebar from "./../../../components/AdminSideBar";

export default async function OrderDetailsPage({ params }) {
  const { id } = await params; // ✅ REQUIRED in Next 16

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <OrderDetailsClient id={id} />
      </main>
    </div>
  );
}
