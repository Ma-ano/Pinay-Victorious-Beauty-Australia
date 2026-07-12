import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/shop",
        "/category/",
        "/sale",
        "/about",
        "/contact",
        "/privacy",
        "/terms",
        "/_next/static/",
        "/_next/image*",
      ],
      disallow: [
        "/admin/",
        "/api/",
        "/auth/",
        "/checkout/",
        "/profile/",
        "/orders/",
        "/wishlist/",
        "/login/",
        "/register/",
        "/verify-email/",
        "/_next/",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
