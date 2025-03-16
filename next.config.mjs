/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // This is to handle the canvas dependency for konva
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
};

export default nextConfig;
