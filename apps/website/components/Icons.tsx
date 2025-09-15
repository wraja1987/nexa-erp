export function NexaGradientDefs() {
  return (
    <defs>
      <linearGradient id="nexaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2E6BFF" />
        <stop offset="100%" stopColor="#7A4DFF" />
      </linearGradient>
    </defs>
  );
}

function BaseIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden>
      <NexaGradientDefs />
      <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#nexaGrad)" opacity="0.12" />
      <g fill="none" stroke="url(#nexaGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

// Core feature icons
export function FinanceIcon() {
  return (
    <BaseIcon>
      <rect x="12" y="14" width="24" height="18" rx="2" />
      <line x1="16" y1="20" x2="28" y2="20" />
      <line x1="16" y1="26" x2="24" y2="26" />
      <circle cx="33" cy="27" r="3" />
    </BaseIcon>
  );
}

export function WmsIcon() {
  return (
    <BaseIcon>
      <rect x="10" y="16" width="28" height="18" rx="3" />
      <rect x="16" y="12" width="16" height="8" rx="2" />
      <line x1="16" y1="26" x2="32" y2="26" />
    </BaseIcon>
  );
}

export function ManufacturingIcon() {
  return (
    <BaseIcon>
      <circle cx="18" cy="28" r="5" />
      <path d="M28 22h10v12H22l6-6v-6z" />
    </BaseIcon>
  );
}

export function AiIcon() {
  return (
    <BaseIcon>
      <path d="M14 24c0-6 4-10 10-10s10 4 10 10-4 10-10 10S14 30 14 24z" />
      <circle cx="24" cy="24" r="3" />
      <path d="M24 14v-2M24 36v-2M34 24h2M12 24h2M31 17l1-1M17 31l-1 1M31 31l1 1M17 17l-1-1" />
    </BaseIcon>
  );
}

export function AnalyticsIcon() {
  return (
    <BaseIcon>
      <path d="M14 32h20" />
      <rect x="16" y="22" width="4" height="8" />
      <rect x="22" y="18" width="4" height="12" />
      <rect x="28" y="24" width="4" height="6" />
    </BaseIcon>
  );
}

export function ConnectorsIcon() {
  return (
    <BaseIcon>
      <path d="M18 18h6a4 4 0 010 8h-6a4 4 0 010-8z" />
      <path d="M30 22h4" />
      <path d="M14 22h-4" />
    </BaseIcon>
  );
}

// Add-in brand icons (simple wordmarks/shapes)
function BrandBase({ label }: { label: string }) {
  return (
    <svg width="88" height="24" viewBox="0 0 88 24" aria-hidden>
      <NexaGradientDefs />
      <rect x="0" y="0" width="88" height="24" rx="6" fill="url(#nexaGrad)" opacity="0.12" />
      <text x="44" y="16" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="12" fill="#0B1424">{label}</text>
    </svg>
  );
}

export const StripeIcon = () => <BrandBase label="Stripe" />;
export const TrueLayerIcon = () => <BrandBase label="TrueLayer" />;
export const HmrcMtdIcon = () => <BrandBase label="HMRC" />;
export const ShopifyIcon = () => <BrandBase label="Shopify" />;
export const AmazonIcon = () => <BrandBase label="Amazon" />;
export const TwilioIcon = () => <BrandBase label="Twilio" />;

// Footer social placeholders (non-clickable)
export function Socials() {
  return (
    <div className="flex gap-3" aria-label="Social icons">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300" aria-hidden title="Instagram" />
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300" aria-hidden title="X" />
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300" aria-hidden title="LinkedIn" />
    </div>
  );
}


