"use client";

import { usePathname } from "next/navigation";
import CustomerNavbar from "./CustomerNavbar";

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return null;
  return <CustomerNavbar />;
}
