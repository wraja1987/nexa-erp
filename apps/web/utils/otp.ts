import crypto from "crypto";
export function generateOTP(len:number=6){ return crypto.randomInt(0,10**len).toString().padStart(len,"0"); }
export function key(email:string){ return `otp:${email.toLowerCase()}`; }
