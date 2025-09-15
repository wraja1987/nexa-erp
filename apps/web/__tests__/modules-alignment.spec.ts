import fs from "fs"; import path from "path";
test("modules-alignment", () => {
  const root = process.cwd();
  const jsonPath = path.join(root, "$MODS_JSON");
  const tsPath   = path.join(root, "$ERP_TS_MAP");
  if (!fs.existsSync(jsonPath)) return; // skip if no file
  if (!fs.existsSync(tsPath))   return; // skip if no file

  const json = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
    modules: Array<{ slug:string; label:string; subs?: Array<{ slug:string; label:string }> }>
  };

  const tsRaw = fs.readFileSync(tsPath, "utf8");
  const m = tsRaw.match(/\bmodules\s*:\s*Mod\[\]\s*=\s*(\[[\s\S]*\]);?/);
  if (!m) throw new Error("Could not locate exported modules array in modules.ts");
  const tsArrayLiteral = m[1].replace(/(\w+)\s*:/g, "\"$1\":").replace(/'/g, "\"");
  const tsMods = JSON.parse(tsArrayLiteral);

  const normalise = (arr:any[]) => arr.map((x:any)=>({
    slug:x.slug, label:x.label, subs:(x.subs||[]).map((s:any)=>({slug:s.slug,label:s.label}))
  }));
  expect(normalise(tsMods)).toEqual(normalise(json.modules));
});
