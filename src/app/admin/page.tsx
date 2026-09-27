import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import { AdminApp } from "@/components/admin/admin-app";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default async function AdminPage() {
  const session = await readSession();
  if (!session) redirect("/sign-in");
  if (!["admin", "editor"].includes(session.role)) redirect("/account");
  return <AdminApp user={session} />;
}
