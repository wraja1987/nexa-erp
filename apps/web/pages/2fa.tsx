import { useState } from "react";

export default function TwoFA(){
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const request = async (e:any) => {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/otp/request",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email }) });
    if(r.ok){ setSent(true); setMsg("Code sent"); } else { setMsg("Error sending code"); }
  };

  const verify = async(e:any)=>{
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/otp/verify",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ email, code }) });
    if(r.ok){
      setMsg("Verified");
      // after OTP verified, redirect to dashboard (session must already be created post-password)
      window.location.href = "/dashboard";
    } else {
      setMsg("Invalid or expired code");
    }
  };

  return (
    <main style={{maxWidth:480, margin:"64px auto", fontFamily:"Inter, system-ui"}}>
      <h1>Email verification</h1>
      {!sent ? (
        <form onSubmit={request}>
          <label>Email<br/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
          <div style={{marginTop:12}}><button type="submit">Send code</button></div>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p>Enter the code sent to <b>{email}</b>.</p>
          <label>Code<br/><input required inputMode="numeric" value={code} onChange={e=>setCode(e.target.value)} /></label>
          <div style={{marginTop:12}}><button type="submit">Verify</button></div>
        </form>
      )}
      {msg && <p style={{marginTop:12}}>{msg}</p>}
    </main>
  );
}
