import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fce4ec, #f3e5f5, #e8eaf6)",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: 60,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#1a1a2e",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {site.name}
        </h1>
        <p
          style={{
            fontSize: 32,
            color: "#e91e63",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {site.tagline}
        </p>
        <p
          style={{
            fontSize: 20,
            color: "#555",
            textAlign: "center",
            marginTop: 24,
            maxWidth: 800,
          }}
        >
          {site.description}
        </p>
      </div>
    ),
    { ...size },
  );
}
