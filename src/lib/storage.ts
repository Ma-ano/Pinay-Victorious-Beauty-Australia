import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata, updateMetadata } from "firebase/storage";
import { getStorageClient } from "@/lib/firebase";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPG and PNG images are allowed");
  }
  const storage = getStorageClient();
  if (!storage) throw new Error("Firebase Storage not configured");
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadOptimizedImage(
  file: File,
  slug: string,
): Promise<{ url: string; variants: Record<string, string> }> {
  const sanitizedSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  const path = `products/${sanitizedSlug}/original.${file.name.split(".").pop()}`;
  const url = await uploadImage(file, path);

  let variants: Record<string, string> = {};
  try {
    const res = await fetch("/api/admin/optimize-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloadUrl: url, slug: sanitizedSlug }),
    });
    if (res.ok) {
      const data = await res.json();
      variants = data.variants || {};
    }
  } catch {
    // Variant generation is best-effort; original URL still works
  }

  return { url, variants };
}

export async function deleteImage(downloadUrl: string): Promise<void> {
  try {
    const url = new URL(downloadUrl);
    if (!url.hostname.includes("firebasestorage.googleapis.com")) return;

    const storage = getStorageClient();
    if (!storage) return;

    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    if (!pathMatch) return;

    const decodedPath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, decodedPath);
    try {
      await getMetadata(storageRef);
    } catch {
      return;
    }

    await deleteObject(storageRef);
  } catch {
    // Old image deletion is best-effort
  }
}

export async function deleteImageWithVariants(downloadUrl: string, variants?: Record<string, string>): Promise<void> {
  await deleteImage(downloadUrl);
  if (variants) {
    await Promise.allSettled(Object.values(variants).map(deleteImage));
  }
}

export async function setImageCacheControl(downloadUrl: string): Promise<void> {
  try {
    const url = new URL(downloadUrl);
    if (!url.hostname.includes("firebasestorage.googleapis.com")) return;

    const storage = getStorageClient();
    if (!storage) return;

    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    if (!pathMatch) return;

    const decodedPath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, decodedPath);
    await updateMetadata(storageRef, {
      cacheControl: "public, max-age=31536000, immutable",
    });
  } catch {
    // Best-effort
  }
}
