const path = require("path");
const co = (v, fb="") => (v == null || v === "null" || v === "undefined" || v === "") ? fb : String(v);

module.exports = {
  distDir: co(process.env.NEXT_DIST_DIR, ".next"),
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
