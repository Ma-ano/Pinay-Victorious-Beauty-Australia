import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/lib/firebase-admin";
import AdminUsersPage from "./AdminUsersPage";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/admin/login");
  }

  try {
    const claims = await getAdminAuth().verifySessionCookie(sessionCookie);
    if (!claims.isMasterAdmin) {
      redirect("/admin");
    }
  } catch {
    redirect("/admin/login");
  }

  return <AdminUsersPage />;
}
