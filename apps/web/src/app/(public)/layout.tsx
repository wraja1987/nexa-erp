export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <img src="/logo-nexa.png" alt="Nexa" width={36} height={36} />
      </div>
      {children}
    </div>
  )
}



