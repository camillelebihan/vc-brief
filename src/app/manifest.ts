import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VC Brief",
    short_name: "VC Brief",
    description: "Venture, deeptech and markets, explained and sourced.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4352d6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
