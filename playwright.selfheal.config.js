const base = {};
module.exports = {
  ...base,
  timeout: 30000,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/playwright.json" }],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || process.env.PROD_URL || "https://example.com",
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },
};
