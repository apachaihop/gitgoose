/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
      // Enables the styled-components SWC transform
      styledComponents: true
    },
    // Add this section
    experimental: {
      // This will allow Apollo Client to work properly with App Router
      appDir: true,
    }
  }
  
  module.exports = nextConfig