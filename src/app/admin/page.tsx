import AdminApp from "@/src/components/admin/admin-app";
import "./admin.css";

export const metadata = {
  title: "bram.admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
