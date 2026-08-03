/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.clerk.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Compress responses
  compress: true,
  // Aggressive package import optimization — tree-shake large libs
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'react-markdown',
      'recharts',
      '@tiptap/react',
      '@tiptap/starter-kit',
    ],
  },
};

export default nextConfig;
