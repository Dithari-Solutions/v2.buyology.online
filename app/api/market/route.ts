import type { NextRequest } from "next/server";
import { purchaseMarket } from "@/lib/market";

export function GET(request: NextRequest) {
  // nginx must overwrite both geo headers, just as for middleware.ts.
  const result = purchaseMarket(
    request.headers.get("host") ?? "",
    request.headers.get("x-geo-country"),
    request.headers.get("x-geo-anonymous") === "1",
    request.cookies.get("buyo-region-choice")?.value,
  );
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
