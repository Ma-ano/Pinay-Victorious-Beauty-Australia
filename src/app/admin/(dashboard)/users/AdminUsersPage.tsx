"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/Toast";

interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: string;
}

interface ListResponse {
  users: AdminUser[];
  total: number;
  totalPages: number;
  page: number;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/users?${params}`);
      const data: ListResponse = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleRoleChange(uid: string, role: string) {
    setProcessing(uid);
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      showToast(`Role changed to ${role}`, "success");
      fetchUsers();
    } catch {
      showToast("Failed to update role", "error");
    } finally {
      setProcessing(null);
    }
  }

  async function handleStatusToggle(uid: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    setProcessing(uid);
    try {
      const res = await fetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(`User ${newStatus === "active" ? "enabled" : "disabled"}`, "success");
      fetchUsers();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setProcessing(null);
    }
  }

  async function handleDelete(uid: string) {
    setProcessing(uid);
    try {
      const res = await fetch(`/api/admin/users/${uid}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("User deleted", "success");
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      showToast("Failed to delete user", "error");
    } finally {
      setProcessing(null);
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Users</h1>
          <p className="text-sm text-foreground mt-1">{total} users</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email or name..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/80 transition-colors"
          >
            Search
          </button>
        </form>
        {(search || roleFilter || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setSearchInput(""); setRoleFilter(""); setStatusFilter(""); setPage(1); }}
            className="px-4 py-2.5 bg-primary/10 text-dark rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl border border-card-border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-card-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-dark">User</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Status</th>
              <th className="text-left px-4 py-3 font-medium text-dark hidden lg:table-cell">Created</th>
              <th className="text-left px-4 py-3 font-medium text-dark">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.uid} className="hover:bg-primary/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-dark font-medium truncate max-w-[120px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      disabled={processing === u.uid}
                      className="text-xs px-2 py-1 rounded-lg border border-card-border bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden lg:table-cell text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(u.uid, u.status)}
                        disabled={processing === u.uid}
                        className="text-xs font-medium text-accent hover:text-accent/80 disabled:opacity-50"
                      >
                        {u.status === "active" ? "Disable" : "Enable"}
                      </button>
                      {deleteConfirm === u.uid ? (
                        <span className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(u.uid)}
                            disabled={processing === u.uid}
                            className="text-red-500 hover:text-red-600 text-xs font-medium disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-foreground hover:text-dark text-xs">
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(u.uid)} className="text-red-400 hover:text-red-500 text-xs font-medium">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-xl border border-card-border text-sm font-medium text-foreground hover:text-dark hover:border-accent/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-sm font-medium transition-all ${
                p === page ? "bg-accent text-white" : "text-foreground hover:bg-primary/10 hover:text-dark"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-xl border border-card-border text-sm font-medium text-foreground hover:text-dark hover:border-accent/50 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
