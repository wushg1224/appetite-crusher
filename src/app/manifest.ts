import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "食欲粉碎机",
    short_name: "食欲粉碎机",
    description: "像素风虚拟注射娱乐体验",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8e8",
    theme_color: "#ffd8e6",
    icons: [
      {
        src: "/icons/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
