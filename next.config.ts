const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "i.pravatar.cc" },
      { hostname: "i.ibb.co.com" },
      { hostname: "ui-avatars.com" }
    ],
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
