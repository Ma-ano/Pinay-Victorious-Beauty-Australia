import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/lib/firebase-admin";
import AdminLayoutContent from "./AdminLayoutContent";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/admin/login");
  }

  try {
    const claims = await getAdminAuth().verifySessionCookie(sessionCookie);
    if (!claims.email_verified) {
      redirect("/admin/login");
    }
    if (!claims.isAdmin) {
      redirect("/");
    }
  } catch {
    redirect("/admin/login");
  }

  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
