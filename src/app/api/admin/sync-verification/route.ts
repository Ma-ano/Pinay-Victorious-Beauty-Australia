import { NextResponse } from "next/server";
import { getAdminAuth, getAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const auth = getAdminAuth();
    const db = getFirestore(getAdminApp());

    let updated = 0;
    let nextPageToken: string | undefined;

    do {
      const listResult = await auth.listUsers(1000, nextPageToken);

      const batch = db.batch();
      let batchCount = 0;

      for (const user of listResult.users) {
        const ref = db.collection("users").doc(user.uid);
        batch.update(ref, { emailVerified: user.emailVerified });
        batchCount++;
        updated++;
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      nextPageToken = listResult.pageToken;
    } while (nextPageToken);

    return NextResponse.json({ success: true, updated });
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
