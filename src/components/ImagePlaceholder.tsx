"use client";

import { useState, useRef, useEffect } from "react";

interface ImagePlaceholderProps {
  category: string;
  name?: string;
  imageUrl?: string;
  className?: string;
  aspectRatio?: string;
}

const fallbackConfig: Record<
  string,
  { gradient: string; paths: string[]; accent: string }
> = {
  skincare: {
    gradient: "from-pink-200 to-rose-100",
    accent: "#fda4af",
    paths: [
      "M12 2C9 2 7 5 7 8c0 3 2 6 5 8l-1 4h-2v2h6v-2h-2l-1-4c3-2 5-5 5-8 0-3-2-6-5-6zm0 2c1.5 0 3 1.8 3 4s-1.5 4-3 4-3-1.8-3-4 1.5-4 3-4z",
      "M8 12l-2 3h12l-2-3",
    ],
  },
  makeup: {
    gradient: "from-purple-200 to-pink-100",
    accent: "#c084fc",
    paths: [
      "M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z",
      "M8 16h8v2H8zM10 18h4v3h-4z",
    ],
  },
  haircare: {
    gradient: "from-yellow-200 to-orange-100",
    accent: "#fbbf24",
    paths: [
      "M12 2C9 2 7 5 7 9c0 5 4 8 5 11v2h-2v2h4v-2h-2v-2c1-3 5-6 5-11 0-4-2-7-5-7zm0 2c1.7 0 3 2.2 3 5s-1.3 5-3 5-3-2.2-3-5 1.3-5 3-5z",
      "M9 10l-3 1 3 1",
      "M15 10l3 1-3 1",
    ],
  },
  fragrances: {
    gradient: "from-indigo-200 to-purple-100",
    accent: "#a78bfa",
    paths: [
      "M12 2L3 9l2 11h14l2-11-9-7zm0 3l5 4-1.5 7h-7L7 9l5-4z",
      "M9 20h6v2H9z",
    ],
  },
  "beauty-tools": {
    gradient: "from-teal-200 to-cyan-100",
    accent: "#2dd4bf",
    paths: [
      "M12 2a4 4 0 00-4 4v3H6v4h2v3a4 4 0 008 0v-3h2V9h-2V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v3h-4V6a2 2 0 012-2z",
      "M10 19a2 2 0 104 0v-1h-4v1z",
    ],
  },
  "bath-body": {
    gradient: "from-blue-200 to-sky-100",
    accent: "#60a5fa",
    paths: [
      "M7 4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7zm0 2h10v4H7V6zm0 6h10v4H7v-4z",
      "M12 19v-3M9 21h6",
    ],
  },
  wellness: {
    gradient: "from-green-200 to-emerald-100",
    accent: "#34d399",
    paths: [
      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z",
    ],
  },
  "gifts-sets": {
    gradient: "from-red-200 to-rose-100",
    accent: "#fb7185",
    paths: [
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    ],
  },
};

function getConfig(category: string) {
  return (
    fallbackConfig[category] || {
      gradient: "from-primary/30 to-secondary/30",
      accent: "#f8c8dc",
      paths: ["M12 2l10 10-10 10L2 12z"],
    }
  );
}

export default function ImagePlaceholder({
  category,
  name,
  imageUrl,
  className = "",
  aspectRatio = "aspect-square",
}: ImagePlaceholderProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const config = getConfig(category);
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  const showImage = imageUrl && !errored;
  const showFallback = !imageUrl || errored;

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${className}`}>
      {showImage && (
        <>
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              loaded ? "opacity-0" : "opacity-100"
            }`}
            style={{
              background: `linear-gradient(135deg, ${config.accent}22, ${config.accent}11)`,
            }}
          />
          <img
            ref={imgRef}
            src={`https://images.unsplash.com/${imageUrl}?w=600&h=600&fit=crop&auto=format`}
            alt={name || category}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </>
      )}

      {showFallback && (
        <div className="absolute inset-0">
          <svg
            viewBox="0 0 24 24"
            className="absolute inset-0 w-full h-full opacity-[0.07]"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            {config.paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>

          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${config.accent}33, ${config.accent}11)`,
            }}
          >
            <span className="text-[clamp(2rem,10vw,6rem)] font-bold select-none leading-none text-foreground">
              {initial}
            </span>
          </div>

          <svg
            viewBox="0 0 24 24"
            className="absolute top-3 left-3 w-5 h-5 text-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {config.paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>

          <svg
            viewBox="0 0 24 24"
            className="absolute bottom-3 right-3 w-4 h-4 text-foreground rotate-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            {config.paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
