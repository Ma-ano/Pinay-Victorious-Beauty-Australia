import type { Metadata } from "next";
import WishlistPage from "./WishlistPage";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <WishlistPage />;
}
