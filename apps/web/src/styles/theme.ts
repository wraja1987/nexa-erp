/**
 * Nexa ERP Unified Design System Theme
 * 
 * Central source of truth for colors, typography, spacing, shadows, and other design tokens.
 */

export const nexaTheme = {
  colors: {
    // Primary colors
    nexaPrimary: "#2563eb",
    nexaPrimarySoft: "#3b82f6",
    nexaPrimaryDark: "#1d4ed8",
    nexaAccent: "#7c3aed",
    nexaGradient: "linear-gradient(180deg, #2E6BFF 0%, #7A4DFF 100%)",
    
    // Neutral colors
    nexaBg: "#ffffff",
    nexaSurface: "#f8fafc",
    nexaBorder: "#e5e7eb",
    nexaMutedText: "#6b7280",
    nexaText: "#0f172a",
    
    // Semantic colors
    nexaSuccess: "#10b981",
    nexaWarning: "#f59e0b",
    nexaDanger: "#ef4444",
    nexaInfo: "#3b82f6",
    
    // Sidebar gradient
    sidebarGradient: "linear-gradient(180deg, #2E6BFF 0%, #7A4DFF 100%)",
  },
  
  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "20px",
  },
  
  shadows: {
    card: "0 2px 14px rgba(2, 6, 23, 0.06)",
    popover: "0 10px 30px rgba(0, 0, 0, 0.15)",
    elevated: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },
  
  typography: {
    headingLg: {
      fontSize: "30px",
      fontWeight: 600,
      lineHeight: "1.2",
    },
    headingMd: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: "1.3",
    },
    headingSm: {
      fontSize: "18px",
      fontWeight: 500,
      lineHeight: "1.4",
    },
    body: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "1.5",
    },
    bodySm: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: "1.5",
    },
    caption: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "1.4",
    },
  },
  
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
} as const;

export type NexaTheme = typeof nexaTheme;

