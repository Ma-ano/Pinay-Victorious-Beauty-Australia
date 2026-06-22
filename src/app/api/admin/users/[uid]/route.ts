import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const body = await request.json();
    const { role, status } = body;

    const auth = getAdminAuth();

    if (role) {
      const validRoles = ["customer", "admin"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      if (role === "admin") {
        const userRecord = await auth.getUser(uid);
        if (!userRecord.emailVerified) {
          return NextResponse.json({ error: "User must verify their email before becoming an admin" }, { status: 400 });
        }
        await auth.setCustomUserClaims(uid, { isAdmin: true });
      } else {
        await auth.setCustomUserClaims(uid, { isAdmin: false });
      }
    }

    if (status) {
      const validStatuses = ["active", "disabled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      await auth.updateUser(uid, { disabled: status === "disabled" });
    }

    const db = getAdminDb();
    const updateData: Record<string, string> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (Object.keys(updateData).length > 0) {
      await db.collection("users").doc(uid).update(updateData);
    }

    return NextResponse.json({ success: true, uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;

    const auth = getAdminAuth();
    await auth.deleteUser(uid);

    const db = getAdminDb();
    await db.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true, uid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
