import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com", 
            },
        ],
    },

    async headers() {
        return [
            {
                source: "/",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-store",
                    },
                ],
            },
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-store",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
