export const metadata = { title:"Contact Us • Nexa ERP", description:"Get in touch with our team." };
export default function Contact(){
  return (<main className="container">
    <h1>Contact Us</h1>
    <p className="small">Tell us a little about your team and goals. We will get back to you shortly.</p>
    <form method="POST" action="/api/contact" style={{display:"grid",gap:12,maxWidth:780}}>
      <label> Name<input name="name" required style={{width:"100%",padding:10,border:"1px solid #D0D7E2",borderRadius:8}}/></label>
      <label> Email<input type="email" name="email" required style={{width:"100%",padding:10,border:"1px solid #D0D7E2",borderRadius:8}}/></label>
      <label> Company<input name="company" style={{width:"100%",padding:10,border:"1px solid #D0D7E2",borderRadius:8}}/></label>
      <label> Briefly describe your processes and what success looks like for you.<textarea name="message" rows={6} required style={{width:"100%",padding:10,border:"1px solid #D0D7E2",borderRadius:8}}/></label>
      <button className="btn primary" type="submit">Send</button>
      <p className="small">Prefer email? <a href="mailto:info@chiefaa.com">info@chiefaa.com</a></p>
    </form>
  </main>);
}
