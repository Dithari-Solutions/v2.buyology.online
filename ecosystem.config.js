// PM2 process definition for the v2 storefront (output: 'standalone').
//
// Runs .next/standalone/server.js from INSIDE the standalone dir so it resolves its
// own .next/static and public/ assets. Next's standalone build does NOT include those
// two folders — the deploy copies them in after `next build` (same steps as the old
// storefront), or every asset 404s even though the server is up:
//
//   npm run build
//   rm -rf .next/standalone/.next/static && cp -r .next/static .next/standalone/.next/static
//   cp -r public .next/standalone/public
//   pm2 restart buyology-v2   (first time: pm2 start ecosystem.config.js)
const path = require("path");

module.exports = {
  apps: [
    {
      name: "buyology-v2",
      cwd: path.join(__dirname, ".next", "standalone"),
      script: "server.js",
      env: {
        NODE_ENV: "production",
        // Override with PORT in the environment when cutting over to the old app's port.
        PORT: process.env.PORT || "3000",
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
