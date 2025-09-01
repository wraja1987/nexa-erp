import ThemeToggle from '../../components/ThemeToggle'
import Header from '../../components/Header'
import RecommendationsPanel from '../../components/ai/RecommendationsPanel'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div style={{padding:12, display:'flex', justifyContent:'flex-end'}}>
        <ThemeToggle />
      </div>
      <Header />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16, alignItems:'start' }}>
        <div>{children}</div>
        <RecommendationsPanel />
      </div>
    </div>
  )
}



