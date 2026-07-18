import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminBucket, getAdminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SIZES = [200, 400, 800, 1200];
const QUALITY = 80;

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function POST(request: Request) {
  try {
    const session = getSessionCookie(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await getAdminAuth().verifySessionCookie(session, true);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const claims = decoded.customClaims || {};
    if (!claims.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { downloadUrl, slug } = await request.json();
    if (!downloadUrl || typeof downloadUrl !== "string") {
      return NextResponse.json({ error: "downloadUrl is required" }, { status: 400 });
    }
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch original image" }, { status: 502 });
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const bucket = getAdminBucket();
    const sanitizedSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
    const basePath = `products/${sanitizedSlug}`;
    const variants: Record<string, string> = {};

    await Promise.all(
      SIZES.map(async (size) => {
        const webpBuffer = await sharp(buffer)
          .resize(size, size, { fit: "cover", position: "centre" })
          .webp({ quality: QUALITY })
          .toBuffer();

        const filePath = `${basePath}/${size}.webp`;
        const file = bucket.file(filePath);

        await file.save(webpBuffer, {
          metadata: {
            contentType: "image/webp",
            cacheControl: "public, max-age=31536000, immutable",
          },
        });

        const [exists] = await file.exists();
        if (exists) {
          const bucketName = bucket.name;
          const encoded = encodeURIComponent(filePath);
          variants[String(size)] = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encoded}?alt=media`;
        }
      }),
    );

    return NextResponse.json({ variants });
  } catch (error) {
    console.error("Image optimization failed:", error);
    return NextResponse.json({ error: "Image optimization failed" }, { status: 500 });
  }
}
