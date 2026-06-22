const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function uploadImage(file: File, path: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPG and PNG images are allowed");
  }
  const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { app: firebaseApp } = await import("@/lib/firebase");
  if (!firebaseApp) throw new Error("Firebase not configured");
  const storage = getStorage(firebaseApp);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(downloadUrl: string): Promise<void> {
  try {
    const url = new URL(downloadUrl);
    if (!url.hostname.includes("firebasestorage.googleapis.com")) return;

    const { getStorage, ref, deleteObject } = await import("firebase/storage");
    const { app: firebaseApp } = await import("@/lib/firebase");
    if (!firebaseApp) return;
    const storage = getStorage(firebaseApp);

    const pathMatch = url.pathname.match(/\/o\/(.+)/);
    if (!pathMatch) return;

    const decodedPath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, decodedPath);
    await deleteObject(storageRef);
  } catch {
    // Old image deletion is best-effort
  }
}
