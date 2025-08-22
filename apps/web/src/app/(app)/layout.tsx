import ThemeToggle from '../../components/ThemeToggle'
import Header from '../../components/Header'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div style={{padding:12, display:'flex', justifyContent:'flex-end'}}>
        <ThemeToggle />
      </div>
      <Header />
      {children}
    </div>
  )
}


