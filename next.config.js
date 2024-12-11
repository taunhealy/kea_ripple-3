/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.devtool = false;
    }
    config.watchOptions = {
      poll: 500,
      aggregateTimeout: 150,
    };
    config.output = {
      ...config.output,
      chunkLoadTimeout: 10000,
    };
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 70000,
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      },
    };
    return config;
  },
};

export default nextConfig;
