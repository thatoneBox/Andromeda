// lib/sandbox/monkeypatch.ts
// Lightweight monkeypatching utility that wraps a few global APIs using Proxy.
// This is intentionally minimal and safe — it does not modify original descriptors
// permanently; it installs wrappers and exposes uninstall handles.

type Restore = () => void;

export function patchFetch(): Restore {
  const origFetch = window.fetch;
  function proxiedFetch(input: RequestInfo, init?: RequestInit) {
    // route through the page-local proxy hook if present
    const hook = (window as any).__andromeda_fetch_hook;
    if (hook && typeof hook === "function") {
      try {
        return hook(input, init, origFetch.bind(window));
      } catch (err) {
        console.warn("fetch hook error", err);
        return origFetch.call(window, input, init);
      }
    }
    return origFetch.call(window, input, init);
  }
  (window as any).fetch = new Proxy(proxiedFetch, {
    apply(target, thisArg, args) {
      return (target as any).apply(thisArg, args);
    },
  }) as unknown as typeof fetch;

  return () => {
    (window as any).fetch = origFetch;
  };
}

export function patchXMLHttpRequest(): Restore {
  const OrigXHR = window.XMLHttpRequest;

  const ProxyXHR = function (this: any) {
    const xhr = new (OrigXHR as any)();

    // Wrap open to allow URL rewriting hooks
    const origOpen = xhr.open;
    xhr.open = function (...args: any) {
      try {
        const hook = (window as any).__andromeda_xhr_open;
        if (hook && typeof hook === "function") {
          args[1] = hook(args[1]) ?? args[1];
        }
      } catch (err) {
        // ignore hook errors
      }
      return origOpen.apply(this, args);
    };

    return xhr;
  } as any;
  ProxyXHR.prototype = OrigXHR.prototype;
  (window as any).XMLHttpRequest = ProxyXHR;

  return () => {
    (window as any).XMLHttpRequest = OrigXHR;
  };
}

// Example helper to patch simple DOM read-only properties like location
export function createPropertyWrapper<T extends object, K extends keyof T>(
  obj: T,
  prop: K,
  wrapper: (orig: any) => any
) {
  const desc = Object.getOwnPropertyDescriptor(obj, prop as string);
  if (!desc) return () => {};
  const original = (obj as any)[prop as string];
  try {
    Object.defineProperty(obj, prop as string, {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        return wrapper(original);
      },
      set(v) {
        try {
          // forward writes when possible
          (original as any) = v;
        } catch {}
      },
    });
  } catch (err) {
    // unable to redefine (non-configurable); fallback could use Proxy on window
    // but that is dangerous. We'll silently noop here.
  }

  return () => {
    try {
      if (desc) Object.defineProperty(obj, prop as string, desc);
    } catch {}
  };
}
