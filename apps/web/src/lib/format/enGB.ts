export const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
export const DATE = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/London" });
export function fmtMoney(n:number){ return GBP.format(n); }
export function fmtDate(s:string|Date){ return DATE.format(new Date(s)); }
