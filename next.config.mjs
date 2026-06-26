/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // fhevmjs is published as CommonJS and references Node built-ins. The
  // transpilePackages flag lets Next App Router import it from client code.
  transpilePackages: ['fhevmjs'],
}

export default nextConfig
