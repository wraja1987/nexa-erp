import nodemailer from "nodemailer";
export function getTransport(){
  const host=process.env.SMTP_HOST, port=Number(process.env.SMTP_PORT||587);
  const user=process.env.SMTP_USER, pass=process.env.SMTP_PASS;
  const secure=String(process.env.SMTP_SECURE||"0")==="1";
  if(!host||!port||!user||!pass){
    return null; // fallback to console
  }
  return nodemailer.createTransport({ host, port, auth:{user,pass}, secure });
}
export async function sendOtpEmail(to:string, code:string){
  const from = process.env.DEFAULT_FROM || `Nexa ERP <${process.env.NEXTAUTH_EMAIL_FROM||"no-reply@noreply.local"}>`;
  const tr = getTransport();
  const subject = "Your Nexa ERP One-Time Code";
  const text = `Your OTP is ${code}. It expires in ${process.env.OTP_EXP_MIN||10} minutes.`;
  const html = `<p>Your OTP is <b>${code}</b>.</p><p>It expires in ${process.env.OTP_EXP_MIN||10} minutes.</p>`;
  if(tr){
    await tr.sendMail({ from, to, subject, text, html });
  }else{
    // dev fallback
    console.log("[DEV-OTP]", to, code);
  }
}
