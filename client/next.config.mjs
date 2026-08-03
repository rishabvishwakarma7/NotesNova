/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.clerk.com', 'images.unsplash.com'],
  },
  // Suppress prerender errors caused by Clerk during local builds.
  // On Vercel, the publishable key is available so this has no effect there.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
