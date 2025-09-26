export interface Logger {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  child: (bindings?: Record<string, any>) => Logger;
}

const makeLogger = (bindings: Record<string, any> = {}): Logger => ({
  info:  (...a) => console.log("[INFO]",  new Date().toISOString(), bindings, ...a),
  error: (...a) => console.error("[ERROR]", new Date().toISOString(), bindings, ...a),
  warn:  (...a) => console.warn("[WARN]", new Date().toISOString(), bindings, ...a),
  debug: (...a) => { if (process.env.NODE_ENV !== "production") console.debug("[DEBUG]", new Date().toISOString(), bindings, ...a); },
  child: (b: Record<string, any> = {}) => makeLogger({ ...bindings, ...b }),
});

const logger = makeLogger({ app: "nexa" });
export const getLogger = (bindings?: Record<string, any>) => makeLogger(bindings);
export default logger;
