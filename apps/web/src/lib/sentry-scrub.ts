export function scrubEvent<T extends Record<string, any>>(event: T): T {
  try {
    const e: any = { ...event };

    // 1) Request object guard
    const req = e.request || {};

    // 2) Strip querystrings from URL
    if (req.url && typeof req.url === "string") {
      const u = new URL(req.url, "http://placeholder");
      u.search = "";
      e.request = e.request || {};
      e.request.url = u.pathname; // path only, no query
    }

    // 3) Redact headers wholesale except minimal safe subset
    if (req.headers && typeof req.headers === "object") {
      const keep = ["accept", "content-type", "user-agent"];
      const out: Record<string,string> = {};
      for (const k of keep) {
        const v = req.headers[k] ?? req.headers[k.toLowerCase()];
        if (typeof v === "string") out[k] = v;
      }
      e.request.headers = out;
    }

    // 4) Redact cookies entirely
    if (req.cookies) {
      e.request.cookies = {};
    }

    // 5) Body scrubbing: remove typical PII fields; keep shapes
    const redactKeys = new Set([
      "password","pass","pwd","token","authorization","auth","secret",
      "email","phone","tel","mobile","address","postcode","niNumber","card","cvv"
    ]);
    const scrub = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(scrub);
      const out: any = {};
      for (const [k, v] of Object.entries(obj)) {
        if (redactKeys.has(k)) out[k] = "[REDACTED]";
        else if (typeof v === "object") out[k] = scrub(v);
        else out[k] = (typeof v === "string" && v.length > 256) ? "[TRUNCATED]" : v;
      }
      return out;
    };
    if (req.data) e.request.data = scrub(req.data);
    if (e.extra) e.extra = scrub(e.extra);
    if (e.contexts) e.contexts = scrub(e.contexts);

    return e;
  } catch {
    return event;
  }
}
