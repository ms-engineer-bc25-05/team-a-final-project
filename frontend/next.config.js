/** @type {import('next').NextConfig} */
const nextConfig = {
    // NOTE: Vercelがルートを誤認識しないように追記
    outputFileTracingRoot: __dirname,
  };
  
  export default nextConfig;
  