export default function ThemeTest() {
  return (
    <div className="bg-fluid" style={{ minHeight: '60vh', padding: '24px', borderRadius: '12px' }}>
      <h1 style={{ marginBottom: 16 }}>Neo‑Fluid Intelligence — Theme Test</h1>
      <p style={{ marginBottom: 12 }}>
        This area uses the animated fluid gradient. Below is an AI chip:
        <span className="ai-chip" style={{ marginLeft: 8 }}>AI</span>
      </p>
      <div>
        <code className="number">123,456.78</code> — mono numeric sample
      </div>
    </div>
  )
}
