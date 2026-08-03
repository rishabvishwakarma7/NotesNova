/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Skip static prerendering for all dashboard pages since they require Clerk auth
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    domains: ['img.clerk.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
