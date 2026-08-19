import type {
  ApiResponse,
  AssistantChatData,
  AssistantChatRequest,
  AssistantLanguage,
  AssistantStatusData,
  RateLimitBody,
  SendResult,
} from "@/types/assistant";

/**
 * Browser-side client for the assistant API.
 *
 * Calls the API DIRECTLY from the browser on purpose. The backend rate limiter
 * buckets by caller IP, so routing this through a Next route handler would put
 * every visitor in one 12-req/min bucket and start returning 429 as soon as a
 * few people chat at once. That also means the origin must be allowlisted in
 * the backend's CORS config — an unlisted origin fails in the browser while
 * working fine in curl.
 */
const DIRECT_BASE = process.env.NEXT_PUBLIC_ASSISTANT_API_BASE ?? "";

/**
 * Route through the same-origin dev proxy instead of calling the API directly.
 * Only for local development, where localhost is not in the backend's CORS
 * allowlist — see app/api/assistant/[...path]/route.ts for why this must stay
 * off in production.
 */
const USE_PROXY = process.env.NEXT_PUBLIC_ASSISTANT_PROXY === "true";

/** Empty string means same-origin, i.e. the proxy route. */
const API_BASE = USE_PROXY ? "" : DIRECT_BASE;

const CID_KEY = "buy_assistant_cid";
const VID_KEY = "buy_visitor_id";

/** Hard cap enforced by the server; mirrored here so the UI can show a counter. */
export const MAX_MESSAGE_LENGTH = 1000;

/**
 * Some replies intermittently run past the real answer into corrupted prompt
 * scaffolding, which always begins with this marker. Trimming there is a
 * temporary UI guard; the backend fix is in progress.
 */
const DEGENERATE_TAIL = "⟪";

function trimDegenerateTail(reply: string): string {
  const cut = reply.indexOf(DEGENERATE_TAIL);
  return cut === -1 ? reply : reply.slice(0, cut).trimEnd();
}

/**
 * Stable per-browser id, shared with the analytics beacon so the daily
 * new-conversation cap counts browsers rather than tabs. localStorage, so it
 * survives reloads.
 */
function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VID_KEY, id);
    }
    return id.slice(0, 64);
  } catch {
    // Storage blocked (private mode, cookie policy). Skipping the id only
    // forfeits the per-visitor cap; the per-IP limit still applies.
    return undefined;
  }
}

export interface AssistantLocale {
  language: AssistantLanguage;
  countryCode: string;
  currency: string;
}

export class AssistantClient {
  private conversationId: string | null = null;
  private blockedUntil = 0;

  constructor(private readonly locale: AssistantLocale) {
    // sessionStorage, not local: a new tab should start a fresh conversation.
    try {
      this.conversationId =
        typeof window === "undefined" ? null : sessionStorage.getItem(CID_KEY);
    } catch {
      this.conversationId = null;
    }
  }

  /** Whether the assistant is configured and switched on. */
  async isEnabled(signal?: AbortSignal): Promise<boolean> {
    if (!USE_PROXY && !API_BASE) return false;
    try {
      const res = await fetch(`${API_BASE}/api/assistant/status`, { signal });
      if (!res.ok) return false;
      const body = (await res.json()) as ApiResponse<AssistantStatusData>;
      return body.data?.enabled === true;
    } catch {
      return false; // network, CORS, or aborted — hide the widget
    }
  }

  async send(text: string): Promise<SendResult> {
    const waitMs = this.blockedUntil - Date.now();
    if (waitMs > 0) {
      return {
        ok: false,
        kind: "rate_limited",
        retryAfterSeconds: Math.ceil(waitMs / 1000),
      };
    }

    const vid = visitorId();
    const payload: AssistantChatRequest = {
      message: text.slice(0, MAX_MESSAGE_LENGTH),
      ...this.locale,
      ...(vid ? { visitorId: vid } : {}),
      ...(this.conversationId ? { conversationId: this.conversationId } : {}),
    };

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      return { ok: false, kind: "network" };
    }

    // 429 is written by a servlet filter, so its body shape differs from every
    // other response. Read the BODY: Retry-After is not CORS-exposed, so
    // res.headers.get("Retry-After") is null cross-origin.
    if (res.status === 429) {
      const body = (await res.json().catch(() => null)) as RateLimitBody | null;
      const secs = body?.retryAfterSeconds ?? 60;
      this.blockedUntil = Date.now() + secs * 1000;
      return { ok: false, kind: "rate_limited", retryAfterSeconds: secs };
    }

    const body = (await res.json().catch(() => null)) as
      | ApiResponse<AssistantChatData>
      | null;

    if (!res.ok || !body?.data) {
      // Unknown conversation, conversation/daily cap, and "assistant off" all
      // surface as 500 today, so branch on nothing but 429. Treat generically.
      return {
        ok: false,
        kind: "failed",
        status: res.status,
        message: body?.message,
      };
    }

    this.conversationId = body.data.conversationId;
    try {
      sessionStorage.setItem(CID_KEY, this.conversationId);
    } catch {
      /* storage blocked — the id still lives in memory for this page view */
    }

    return {
      ok: true,
      data: { ...body.data, reply: trimDegenerateTail(body.data.reply) },
    };
  }

  /** Starts a new conversation — needed after the 40-message per-conversation cap. */
  reset(): void {
    this.conversationId = null;
    try {
      sessionStorage.removeItem(CID_KEY);
    } catch {
      /* ignore */
    }
  }
}
