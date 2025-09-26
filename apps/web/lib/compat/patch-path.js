try{
  const path = require("path");
  if (!path.__nexa_patched__) {
    const co = (v) => (v == null ? "" : String(v));
    const wrap = (f) => (...a) => f(...a.map(co));
    for (const k of ["join","resolve","dirname","basename","extname"]) {
      if (typeof path[k] === "function") path[k] = wrap(path[k]);
    }
    Object.defineProperty(path, "__nexa_patched__", { value: true });
    console.log("[nexa] path shim active");
  }
}catch(_){}
