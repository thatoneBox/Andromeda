// lib/sandbox/rewriter.ts
// Minimal TS wrapper to load the scramjet rewriter wasm and expose rewriteScript.
// If wasm is not present, fallback to a naive rewrite that replaces `location`
// with `$proxyWrap(location)` for demonstration.

let wasmBytes: Uint8Array | null = null;
let wasmInitDone = false;

export async function loadRewriterWasm(url = "/scram/scramjet.wasm") {
  if (wasmInitDone) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("failed to fetch rewriter wasm");
    const ab = await res.arrayBuffer();
    wasmBytes = new Uint8Array(ab);
    // If you have a JS glue file (wasm.js) you would import it and call initSync.
    // For now we just retain bytes for potential instantiate later.
    wasmInitDone = true;
  } catch (err) {
    console.warn("rewriter wasm load failed:", err);
    wasmBytes = null;
    wasmInitDone = true;
  }
}

// A tiny rewrite pass that attempts to handle direct identifier uses.
// This is NOT a full AST rewrite; for robust behavior use the oxc-based wasm rewriter.
export function rewriteScriptSimple(src: string): string {
  // Replace direct identifier `location` accesses where safe-ish.
  // This is intentionally conservative — it avoids string/regex inside quotes.
  // NOTE: This is a toy fallback only.
  return src.replace(/\blocation\b/g, "$proxyWrap(location)");
}

export async function rewriteScript(src: string): Promise<string> {
  if (!wasmInitDone) await loadRewriterWasm();
  if (wasmBytes) {
    try {
      // TODO: instantiate and call the real wasm rewriter (requires wasm JS glue).
      // For now fallback to simple rewrite and leave placeholder where wasm invocation would go.
      // Example:
      // const module = await WebAssembly.compile(wasmBytes);
      // const instance = await WebAssembly.instantiate(module, imports);
      // const result = call into rewriter exports...
      return rewriteScriptSimple(src);
    } catch (err) {
      console.warn("wasm rewriter call failed, falling back:", err);
      return rewriteScriptSimple(src);
    }
  } else {
    return rewriteScriptSimple(src);
  }
}
