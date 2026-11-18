import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vegvisir",
    short_name: "Vegvisir",
    start_url: "/",
    display: "standalone",
    background_color: "#e8e4d3",
    theme_color: "#e8e4d3",
  };
}
