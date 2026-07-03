import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "firebase/storage";
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
