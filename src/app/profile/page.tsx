import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/lib/firebase-admin";
import ProfilePage from "./ProfilePage";

export default async function Page() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  try {
    const claims = await getAdminAuth().verifySessionCookie(sessionCookie);
    if (!claims.email_verified) {
      redirect("/verify-email");
    }
  } catch {
    redirect("/login");
  }

  return <ProfilePage />;
}
