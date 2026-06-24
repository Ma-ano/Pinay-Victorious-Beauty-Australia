"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth, type Address } from "@/components/AuthContext";
import { uploadImage, deleteImage } from "@/lib/storage";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export default function ProfilePage() {
  const { user, loading, updateProfile, changePassword } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<Address>({ street: "", city: "", state: "", postcode: "", country: "Australia" });
  const [editing, setEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const currentUser = user;

  function startEditing() {
    setName(currentUser.name);
    setPhone(currentUser.phone || "");
    setAddress(currentUser.address || { street: "", city: "", state: "", postcode: "", country: "Australia" });
    setEditing(true);
    setProfileSuccess(false);
    setProfileError("");
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError("Name is required");
      return;
    }
    if (!phone.trim()) {
      setProfileError("Phone number is required");
      return;
    }
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), address });
      setEditing(false);
      setProfileSuccess(true);
    } catch {
      setProfileError("Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  }

  function cancelEditing() {
    setEditing(false);
    setProfileError("");
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPwError("Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPwSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPwError("Current password is incorrect");
      } else if (code === "auth/weak-password") {
        setPwError("New password is too weak");
      } else if (code === "auth/requires-recent-login") {
        setPwError("Please log out and log back in before changing your password");
      } else {
        setPwError("Failed to change password");
      }
    } finally {
      setPwSaving(false);
    }
  }

  const addr = user.address || { street: "", city: "", state: "", postcode: "", country: "Australia" };

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPhotoUploading(true);
    try {
      const path = `profiles/${currentUser.uid}/${Date.now()}_${file.name}`;
      const url = await uploadImage(file, path);
      if (currentUser.photoURL) {
        await deleteImage(currentUser.photoURL);
      }
      await updateProfile({ photoURL: url });
    } catch {
      setProfileError("Failed to upload photo");
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="relative w-20 h-20 mx-auto mb-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoUploading}
            className="w-full h-full rounded-full bg-accent/20 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-accent transition-all"
          >
            {user.photoURL ? (
              <Image src={user.photoURL} alt={user.name} width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
            )}
            {photoUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhotoUpload} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent text-white rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors shadow-md"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-foreground mb-3">
          1:1 ratio recommended — upload a square image (e.g. 400×400px) for best results.
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-dark">My Profile</h1>
      </div>

      {profileSuccess && (
        <div className="flex items-center gap-2 bg-green-100 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Profile updated successfully.
        </div>
      )}

      {!editing ? (
        <div className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark">Account Details</h2>
            <button
              onClick={startEditing}
              className="text-sm text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-foreground/60 block mb-0.5">Name</span>
              <span className="text-dark font-medium">{user.name}</span>
            </div>
            <div>
              <span className="text-foreground/60 block mb-0.5">Email</span>
              <span className="text-dark font-medium">{user.email}</span>
            </div>
            <div>
              <span className="text-foreground/60 block mb-0.5">Phone</span>
              <span className="text-dark font-medium">{user.phone || "—"}</span>
            </div>
          </div>
          <hr className="border-primary/10" />
          <div>
            <h3 className="text-sm font-semibold text-dark mb-3">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="md:col-span-2">
                <span className="text-foreground/60 block mb-0.5">Street</span>
                <span className="text-dark font-medium">{addr.street || "—"}</span>
              </div>
              <div>
                <span className="text-foreground/60 block mb-0.5">City</span>
                <span className="text-dark font-medium">{addr.city || "—"}</span>
              </div>
              <div>
                <span className="text-foreground/60 block mb-0.5">State</span>
                <span className="text-dark font-medium">{addr.state || "—"}</span>
              </div>
              <div>
                <span className="text-foreground/60 block mb-0.5">Postcode</span>
                <span className="text-dark font-medium">{addr.postcode || "—"}</span>
              </div>
              <div>
                <span className="text-foreground/60 block mb-0.5">Country</span>
                <span className="text-dark font-medium">{addr.country || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleProfileSave} className="bg-card border border-primary/10 rounded-2xl p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark">Edit Details</h2>
            <button
              type="button"
              onClick={cancelEditing}
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="profile-name" className="block text-sm font-medium text-foreground mb-1">Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="profile-email" className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/10 text-foreground/60 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-foreground/50 mt-1">Email cannot be changed here.</p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="profile-phone" className="block text-sm font-medium text-foreground mb-1">Phone <span className="text-red-400">*</span></label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="+61 400 000 000"
              />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-dark mb-3 mt-1">Address</h3>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="profile-street" className="block text-sm font-medium text-foreground mb-1">Street</label>
              <input
                id="profile-street"
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="123 Beauty Lane"
              />
            </div>
            <div>
              <label htmlFor="profile-city" className="block text-sm font-medium text-foreground mb-1">City</label>
              <input
                id="profile-city"
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Sydney"
              />
            </div>
            <div>
              <label htmlFor="profile-state" className="block text-sm font-medium text-foreground mb-1">State</label>
              <input
                id="profile-state"
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="NSW"
              />
            </div>
            <div>
              <label htmlFor="profile-postcode" className="block text-sm font-medium text-foreground mb-1">Postcode</label>
              <input
                id="profile-postcode"
                type="text"
                value={address.postcode}
                onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="2000"
              />
            </div>
            <div>
              <label htmlFor="profile-country" className="block text-sm font-medium text-foreground mb-1">Country</label>
              <input
                id="profile-country"
                type="text"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="Australia"
              />
            </div>
          </div>
          {profileError && <p className="text-sm text-red-400">{profileError}</p>}
          <button
            type="submit"
            disabled={profileSaving}
            className="w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm disabled:opacity-50"
          >
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      <div className="mt-8 bg-card border border-primary/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-semibold text-dark mb-4">Change Password</h2>
        {pwSuccess && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Password changed successfully.
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="current-pw" className="block text-sm font-medium text-foreground mb-1">Current Password</label>
            <div className="relative">
              <input
                id="current-pw"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-dark transition-colors"
                tabIndex={-1}
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showCurrent} />
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="new-pw" className="block text-sm font-medium text-foreground mb-1">New Password</label>
            <div className="relative">
              <input
                id="new-pw"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-dark transition-colors"
                tabIndex={-1}
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showNew} />
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirm-new-pw" className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                id="confirm-new-pw"
                type={showConfirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-primary/20 bg-transparent text-dark text-sm focus:outline-none focus:border-accent transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-dark transition-colors"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>
          {pwError && <p className="text-sm text-red-400">{pwError}</p>}
          <button
            type="submit"
            disabled={pwSaving}
            className="w-full bg-accent text-white py-2.5 rounded-xl font-medium hover:bg-accent/80 transition-all text-sm disabled:opacity-50"
          >
            {pwSaving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
