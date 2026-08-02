// components/BrowserView.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadRustlsWasm } from "@/lib/network/wisp";
import { loadRewriterWasm, rewriteScript } from "@/lib/sandbox/rewriter";

export default function BrowserView() {
  const [url, setUrl] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    // register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("sw registered", reg);
        })
        .catch((err) => console.warn("sw register failed", err));
    }

    // initialize WASM modules (rewriter, rustls placeholder)
    (async () => {
      setStatus("loading rewriter wasm...");
      await loadRewriterWasm().catch(() => {});
      setStatus("loading rustls (placeholder)...");
      await loadRustlsWasm().catch(() => {});
      setStatus("ready");
    })();
  }, []);

  async function handleGo() {
    if (!url) return;
    setStatus("navigating");
    // Use the service worker/controller + scramjet plumbing to load the proxied page.
    // For the simple scaffold we just set iframe src to an internal proxy route.
    // The actual Scramjet pipeline would rewrite HTML/JS, register monkeypatches, and proxy assets.

    // Example: if you set up a proxy route at /api/proxy?url=..., you would point iframe to it.
    const proxied = `/api/proxy?url=${encodeURIComponent(url)}`;
    if (iframeRef.current) {
      iframeRef.current.src = proxied;
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      <div className="h-14 flex items-center px-4 gap-3 border-b border-gray-800">
        <div className="text-sm text-purple-300 font-medium">Andromeda</div>
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 rounded-md bg-gray-900 hover:bg-gray-800">◀</button>
          <button className="p-2 rounded-md bg-gray-900 hover:bg-gray-800">▶</button>
          <button className="p-2 rounded-md bg-gray-900 hover:bg-gray-800">⟳</button>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="w-2/3">
            <div className="relative">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full py-2 px-4 rounded-full bg-white/5 border border-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 text-sm"
                placeholder="https://example.com"
                spellCheck={false}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-purple-800/60 text-purple-200 px-2 py-1 rounded-full">
                E2E Secure
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex gap-2">
          <button
            onClick={handleGo}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white"
          >
            Go
          </button>
          <div className="text-xs text-gray-500 self-center">Status: {status}</div>
        </div>

        <div className="border border-white/5 rounded-lg overflow-hidden" style={{height: '70vh'}}>
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            className="w-full h-full bg-black"
            title="Andromeda Browser Frame"
          />
        </div>
      </div>
    </div>
  );
}
