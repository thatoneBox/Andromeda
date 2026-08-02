// app/api/wisp/route.ts
import { NextResponse } from "next/server";

/**
 * WARNING:
 * Next.js API routes (especially in serverless/edge hosts) do NOT support
 * raw WebSocket/TCP upgrades. The real scramjet approach runs a separate
 * wisp server process that listens for HTTP->upgrade and handles raw TCP.
 *
 * This route is a placeholder that returns info. For real Wisp websocket
 * upgrades, run a separate Node process (see scramjet devserver.ts) and
 * point the browser Wisp client at that server.
 */

export async function GET() {
  return NextResponse.json({
    message:
      "This route is a placeholder. For Wisp websocket/TCP upgrades run a separate wisp server and configure it at /wisp/",
  });
}
