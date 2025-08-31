export default function AiLoader({ size = 28 }: { size?: number }) {
  return (
    <div aria-live="polite" aria-label="AI status" role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-nexa.png"
        alt=""
        width={size}
        height={size}
        className="ai-loader-n"
      />
      <span className="text-muted" style={{ fontSize: 12 }}>Working…</span>
    </div>
  )
}


