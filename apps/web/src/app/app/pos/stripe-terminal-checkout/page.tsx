import UiShell from "../../../../components/UiShell"

export default function Page(){
  const items = ["Headphones","Mouse","T-shirt","Keyboard","Smartwatch","Smartphone","Laptop","Membership"]
  return (
    <UiShell>
      <div className="nx-crumb">POS › Quick checkout</div>
      <h1 style={{fontSize:30,margin:"6px 0 16px"}}>Quick checkout</h1>

      <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:16}}>
        <div className="nx-pos-grid">
          {items.map(n => (
            <div key={n} className="nx-pos-item nx-card">{n}</div>
          ))}
        </div>
        <div className="nx-card nx-pos-side pad">
          <strong>Gift card</strong>
          <div style={{marginTop:10}}>Total <span style={{fontSize:24,marginLeft:6}}>£100.00</span></div>
          <button className="nx-btn primary" style={{marginTop:14,width:"100%"}}>Pay</button>
          <div style={{marginTop:12,display:"grid",gap:8}}>
            <label>Customer name<input className="nx-ai-input" placeholder="Name"/></label>
            <label>Email<input className="nx-ai-input" placeholder="name@example.com"/></label>
          </div>
        </div>
      </div>
    </UiShell>
  )
}







