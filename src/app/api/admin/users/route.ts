import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const allowedAdminEmail = (process.env.ADMIN_EMAIL || "admin@glowmuse.com").toLowerCase();

    const auth = getAdminAuth();
    const listResult = await auth.listUsers(1000);

    const db = getAdminDb();
    const usersSnapshot = await db.collection("users").get();
    const userMap = new Map<string, Record<string, unknown>>();
    usersSnapshot.docs.forEach((doc) => {
      userMap.set(doc.id, { id: doc.id, ...doc.data() } as Record<string, unknown>);
    });

    const allUsers = listResult.users.map((u) => {
      const firestoreData = userMap.get(u.uid) || {};
      return {
        uid: u.uid,
        email: u.email || "",
        name: (firestoreData.name as string) || u.displayName || "",
        role: (firestoreData.role as string) || "customer",
        status: (firestoreData.status as string) || (u.disabled ? "disabled" : "active"),
        createdAt: (firestoreData.createdAt as string) || u.metadata.creationTime || "",
        isMaster: (u.email || "").toLowerCase() === allowedAdminEmail,
        disabled: u.disabled,
        emailVerified: u.emailVerified,
        ...firestoreData,
      };
    });

    let filtered = allUsers;
    if (search) {
      filtered = filtered.filter((u) =>
        u.email.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search)
      );
    }
    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const users = filtered.slice(start, start + limit);

    return NextResponse.json({ users, total, totalPages, page });
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
