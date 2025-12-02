import OrderDetailsClient from "./OrderDetailsClient";
import AdminSidebar from "./../../../components/AdminSideBar";

export default async function OrderDetailsPage({ params }) {
  const { id } = await params; // safe in server component

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <OrderDetailsClient id={id} />
      </main>
    </div>
  );
}
