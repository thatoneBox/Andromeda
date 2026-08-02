// lib/network/wisp.ts
// Simple Wisp client wrapper that opens a websocket and offers send/receive APIs.
// TLS (rustls) WASM loader is stubbed — loading a rustls wasm would be handled here.

export type WispMessage = { type: string; payload?: any };

export class WispClient {
  ws: WebSocket | null = null;
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = "arraybuffer";
      this.ws.onopen = () => resolve();
      this.ws.onclose = () => console.log("wisp ws closed");
      this.ws.onerror = (e) => reject(e);
    });
  }

  sendRaw(data: ArrayBuffer | Uint8Array) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("wisp ws not open");
    }
    this.ws.send(data as any);
  }

  onMessage(cb: (data: ArrayBuffer | string) => void) {
    if (!this.ws) return;
    this.ws.onmessage = (ev) => {
      cb(ev.data as any);
    };
  }

  close() {
    this.ws?.close();
  }
}

// TLS WASM loader stub. In a full implementation you'd load rustls WASM
// bits and wire them into a stream that encrypts/decrypts raw TCP bytes.
export async function loadRustlsWasm(url = "/scram/rustls.wasm"): Promise<void> {
  // Fetch bytes, instantiate the WASM, and wire exports — placeholder here.
  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) throw new Error("failed to load rustls wasm");
  // const ab = await res.arrayBuffer();
  // instantiate and initialize...
  console.info("rustls wasm fetched (placeholder)");
}
