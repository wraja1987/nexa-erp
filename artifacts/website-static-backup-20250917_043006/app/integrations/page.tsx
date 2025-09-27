export const metadata = { title:"Integrations • Nexa ERP" };
export default function Integrations(){
  return (
    <main className="container">
      <h1>Integrations</h1>
      <p>Only live and available connections are shown here.</p>
      <div className="grid grid-3" style={{alignItems:"center"}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="card" style={{textAlign:"center"}}><img src="/images/integrations/stripe.svg" alt="Stripe"/></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="card" style={{textAlign:"center"}}><img src="/images/integrations/truelayer.svg" alt="TrueLayer"/></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="card" style={{textAlign:"center"}}><img src="/images/integrations/hmrc.svg" alt="HMRC"/></div>
      </div>
      <p className="small" style={{opacity:.75, marginTop:12}}>HMRC VAT (MTD) & TrueLayer require live keys.</p>
    </main>
  );
}
