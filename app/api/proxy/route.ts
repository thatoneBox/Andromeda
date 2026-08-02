// app/api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

// Simple server-side proxy for quick testing. WARNING: This is not secure
// for production. It fetches the requested URL server-side and returns the
// response body and headers. Use with care and restrict/validate inputs.

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "missing url parameter" }, { status: 400 });
    }

    // Basic validation: only allow http/https
    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }

    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "text/html";
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
