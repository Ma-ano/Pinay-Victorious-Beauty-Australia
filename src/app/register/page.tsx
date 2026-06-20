import type { Metadata } from "next";
import RegisterPage from "./RegisterPage";

export const metadata: Metadata = {
  title: "Register",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RegisterPage />;
}
