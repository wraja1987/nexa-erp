// Robust stub creator for @nexa/registry on CI/Vercel
const fs = require("fs");
const path = require("path");

const dest = path.join(process.cwd(), "node_modules", "@nexa", "registry", "index.js");

try {
  fs.mkdirSync(path.dirname(dest), { recursive: true }); // ensure parents
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, "module.exports = {};\n");
    console.log("Stubbed @nexa/registry");
  } else {
    console.log("Stub already exists");
  }
} catch (e) {
  console.warn("Skipping registry stub:", e.code || e.message);
  // Don’t fail the build for this helper
  process.exit(0);
}
