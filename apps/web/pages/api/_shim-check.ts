export default function handler(_req:any,res:any){
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require("path");
  res.status(200).json({ patched: !!path.__nexa_patched__ });
}
