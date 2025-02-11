module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://localhost:8000",
  },
  async rewrites() {
    return [
      {
        source: '/share/:link_id',
        destination: '/api/share/:link_id',
      },
    ];
  },

}

