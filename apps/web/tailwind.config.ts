import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexa: {
          blue: "#1E40FF",
          blue2: "#274BFF",
          violet: "#7C3AED",
          sidebarBg: "#0E2B85",
          sidebarBg2: "#1A49C1",
          surface: "#FFFFFF",
          card: "#F8FAFC",
          border: "#E5E7EB",
          text: "#0F172A",
          subtext: "#475569",
          kpiGreen: "#10B981"
        }
      },
      boxShadow: { card: "0 2px 14px rgba(2, 6, 23, 0.06)" },
      borderRadius: { xl2: "1rem" }
    }
  },
  plugins: []
};
export default config;
