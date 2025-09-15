export const metadata={title:"Documentation • Nexa ERP",description:"Key guides for new visitors."};
const links=[
  {slug:"getting-started",title:"Getting Started"},
  {slug:"finance",title:"Finance"},
  {slug:"wms",title:"WMS (Inventory & Warehousing)"},
  {slug:"manufacturing",title:"Manufacturing"},
  {slug:"sales-crm",title:"Sales & CRM"},
  {slug:"purchasing",title:"Purchasing"},
  {slug:"projects",title:"Projects"},
  {slug:"pos",title:"Point of Sale (POS)"}
];
export default function DocsHome(){
  return (<main className="container">
    <h1>Documentation</h1>
    <div className="grid grid-3">
      {links.map(l=>(
        <a key={l.slug} className="card" href={"/docs/"+l.slug+"/"}>
          <h3>{l.title}</h3>
          <p className="small">Open the guide for {l.title}.</p>
        </a>
      ))}
    </div>
  </main>);
}
