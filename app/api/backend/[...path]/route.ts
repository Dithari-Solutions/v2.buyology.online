import { NextResponse, type NextRequest } from "next/server";

/**
 * DEVELOPMENT-ONLY proxy to the Buyology backend, for the feature-by-feature migration.
 *
 * Exists for exactly the reason the assistant's proxy does: localhost is not in the backend's CORS
 * allowlist, so a browser on a dev machine cannot call the API at all. Going server-to-server
 * sidesteps CORS entirely.
 *
 * DO NOT enable in production — the backend rate-limits and audits by caller IP, and behind a
 * proxy every visitor arrives as this server. Guarded by BACKEND_ALLOW_PROXY (server-only,
 * deliberately not NEXT_PUBLIC_) so it cannot be switched on from the client bundle.
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_ASSISTANT_API_BASE ?? "";
const ENABLED = process.env.BACKEND_ALLOW_PROXY === "true";

async function forward(req: NextRequest, path: string[]) {
  if (!ENABLED || !API_BASE) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const target = `${API_BASE}/${path.join("/")}${req.nextUrl.search}`;
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const auth = req.headers.get("authorization");

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        // Without this the backend sees this server's IP for every caller.
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
        ...(auth ? { Authorization: auth } : {}),
      },
      body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Upstream unreachable" }, { status: 502 });
  }

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
      // Preserve the backend's caching intent so dev matches prod browser behaviour.
      ...(upstream.headers.get("Cache-Control")
        ? { "Cache-Control": upstream.headers.get("Cache-Control")! }
        : {}),
    },
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forward(req, (await ctx.params).path);
}
