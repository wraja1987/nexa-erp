import "../styles/nexa-v2.css"
export const dynamic = "force-dynamic";
import SidebarNav from "components/SidebarNav"
import Topbar from "components/Topbar"
import AiEngine from "components/AiEngine"
export const metadata={title:"Nexa ERP"}
export default function AppLayout({children}:{children:React.ReactNode}){
  return (
    <div className="nx-app">
      <SidebarNav/>
      <div className="nx-main">
        <Topbar/>
        <div className="nx-container">
          {children}
          <AiEngine/>
          <footer className="nx">Privacy · Cookies · Accessibility · Security</footer>
        </div>
      </div>
    </div>
  )
}
