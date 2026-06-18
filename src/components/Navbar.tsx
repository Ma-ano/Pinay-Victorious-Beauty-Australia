"use client";

import { usePathname } from "next/navigation";
import CustomerNavbar from "./CustomerNavbar";
import AdminNavbar from "./AdminNavbar";

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  return isAdmin ? <AdminNavbar /> : <CustomerNavbar />;
}
