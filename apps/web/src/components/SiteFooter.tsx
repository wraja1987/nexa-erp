export default function SiteFooter(){
  return (
    <footer role="contentinfo" style={{marginTop:24}}>
      <div className="site-nav-fixed" style={{padding:"16px",borderTop:"1px solid #E5E7EB",color:"#334155",fontSize:14,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div>© {new Date().getFullYear()} Nexa ERP</div>
        <nav aria-label="Footer">
          <a href="/privacy" style={{marginRight:12,textDecoration:'none',color:'#0B1424'}}>Privacy</a>
          <a href="/cookies" style={{marginRight:12,textDecoration:'none',color:'#0B1424'}}>Cookies</a>
          <a href="/accessibility" style={{textDecoration:'none',color:'#0B1424'}}>Accessibility</a>
        </nav>
      </div>
    </footer>
  )
}










