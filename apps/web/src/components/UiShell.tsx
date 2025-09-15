import AiEngine from "./AiEngine"

export default function UiShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="nx-container">
        {children}
        <footer className="nx">Privacy · Cookies · Accessibility · Security</footer>
      </div>
      <AiEngine />
    </>
  )
}







