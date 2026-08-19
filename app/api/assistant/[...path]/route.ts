import { NextResponse, type NextRequest } from "next/server";

/**
 * DEVELOPMENT-ONLY proxy to the assistant API.
 *
 * The backend's CORS allowlist contains https://v2.buyology.online but not
 * http://localhost:3000, so a browser on a dev machine cannot reach the API at
 * all — /status fails, the widget decides the assistant is off, and the
 * launcher never renders. Going server-to-server sidesteps CORS entirely.
 *
 * DO NOT enable this in production. The backend rate limiter buckets by caller
 * IP; behind a proxy every visitor arrives as this server and shares one
 * 12-requests-per-minute budget, so the widget would start returning 429 to
 * everyone as soon as a handful of people chat at once. Production must call
 * the API directly from the browser, which now works because the origin is
 * allowlisted.
 *
 * Guarded by ASSISTANT_ALLOW_PROXY (server-only, deliberately not NEXT_PUBLIC_)
 * so it cannot be switched on by accident from the client bundle.
 */
const API_BASE = process.env.NEXT_PUBLIC_ASSISTANT_API_BASE ?? "";
const ENABLED = process.env.ASSISTANT_ALLOW_PROXY === "true";

async function forward(req: NextRequest, path: string[]) {
  if (!ENABLED || !API_BASE) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const target = `${API_BASE}/api/assistant/${path.join("/")}`;
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        // Without this the rate limiter sees this server's IP for every caller.
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      body: req.method === "GET" ? undefined : await req.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Upstream unreachable" }, { status: 502 });
  }

  // Pass the status through untouched — the client distinguishes 429 from the rest.
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await params).path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return forward(req, (await params).path);
}
