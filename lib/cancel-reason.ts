/**
 * The cancellation questionnaire's contract, and the two functions that turn one answer into what
 * is POSTed to /api/orders/{id}/cancel: the prose `reason`, and the same answers structured as
 * `feedback`. Both come from a single {@link CancelAnswer} so they can never describe different
 * selections.
 *
 * Why this lives apart from the UI:
 * - The backend copies the prose string VERBATIM into the order's tracking timeline, which the
 *   customer reads back in their own order history and which admins read in the dashboard. So it
 *   has to be an English sentence a human would say — never JSON, a code, or key=value pairs.
 * - It is English even when the UI is Arabic or Azerbaijani: every other tracking note the backend
 *   writes is English and the dashboard is English, so a localised string would be the odd one out
 *   in the one place it is read. Hence plain concatenation of the constants below — no dictionary
 *   lookup, no Intl formatter, ASCII digits only.
 * - The structured half is English for the same reason, and it is English question and answer TEXT
 *   rather than codes alone, because the dashboard renders it without a label table. So this module
 *   also carries its own copy of the en wording (CANCEL_ENGLISH) — the localised dictionaries are
 *   for the screen and never travel.
 * - The mobile app composes both from the same contract. Keeping it pure and in one place is what
 *   stops the two clients from drifting apart in the admin's reports, which is the one thing that
 *   would make the collected answers unanalysable.
 */

export type CancelReasonCode =
  | "FOUND_CHEAPER"
  | "CHANGED_MIND"
  | "DELIVERY_TOO_SLOW"
  | "FOUND_DIFFERENT_PRODUCT"
  | "PAYMENT_ISSUE"
  | "WRONG_PRODUCT"
  | "NO_LONGER_NEEDED"
  | "WANT_TO_CHANGE_ORDER"
  | "OTHER";

export type CancelFollowUpId =
  | "cheaperElsewhere"
  | "deliveryTime"
  | "whatChanged"
  | "differentProduct"
  | "otherReason";

export type CancelFollowUpOption = {
  code: string;
  /** Whether choosing it opens a free-text box ("Other"). */
  revealsText: boolean;
  /**
   * The lowercase words this option contributes to the stored sentence — never the UI label, which
   * is localised and capitalised. For a `revealsText` option this is the fallback used when the box
   * is left empty; `null` means such an option contributes nothing at all.
   */
  fragment: string | null;
};

export type CancelFollowUp = {
  id: CancelFollowUpId;
  kind: "priceAndChoice" | "choice" | "text";
  options: readonly CancelFollowUpOption[];
};

export type CancelReason = {
  code: CancelReasonCode;
  emoji: string;
  followUp: CancelFollowUpId | null;
};

/** The nine reasons, in display order. */
export const CANCEL_REASONS: readonly CancelReason[] = [
  { code: "FOUND_CHEAPER", emoji: "💰", followUp: "cheaperElsewhere" },
  { code: "CHANGED_MIND", emoji: "🛒", followUp: "whatChanged" },
  { code: "DELIVERY_TOO_SLOW", emoji: "🚚", followUp: "deliveryTime" },
  { code: "FOUND_DIFFERENT_PRODUCT", emoji: "💻", followUp: "differentProduct" },
  { code: "PAYMENT_ISSUE", emoji: "💳", followUp: null },
  { code: "WRONG_PRODUCT", emoji: "📦", followUp: null },
  { code: "NO_LONGER_NEEDED", emoji: "📝", followUp: "whatChanged" },
  { code: "WANT_TO_CHANGE_ORDER", emoji: "🔄", followUp: null },
  { code: "OTHER", emoji: "❓", followUp: "otherReason" },
];

/** One follow-up question per reason at most — a short conversation, not a questionnaire. */
export const CANCEL_FOLLOW_UPS: Record<CancelFollowUpId, CancelFollowUp> = {
  cheaperElsewhere: {
    id: "cheaperElsewhere",
    kind: "priceAndChoice",
    options: [
      { code: "AMAZON", revealsText: false, fragment: "Amazon" },
      { code: "NOON", revealsText: false, fragment: "Noon" },
      { code: "RETAIL_STORE", revealsText: false, fragment: "a retail store" },
      { code: "ANOTHER_WEBSITE", revealsText: false, fragment: "another website" },
      { code: "OTHER", revealsText: true, fragment: "another seller" },
    ],
  },
  deliveryTime: {
    id: "deliveryTime",
    kind: "choice",
    options: [
      { code: "SAME_DAY", revealsText: false, fragment: "same day" },
      { code: "NEXT_DAY", revealsText: false, fragment: "next day" },
      // ASCII hyphen on purpose: the UI label uses an en dash, the stored sentence does not.
      { code: "TWO_TO_THREE_DAYS", revealsText: false, fragment: "in 2-3 days" },
      { code: "OTHER", revealsText: true, fragment: "sooner" },
    ],
  },
  whatChanged: {
    id: "whatChanged",
    kind: "choice",
    options: [
      { code: "DECIDED_NOT_TO_BUY", revealsText: false, fragment: "decided not to buy" },
      { code: "BUDGET_CHANGED", revealsText: false, fragment: "budget changed" },
      { code: "BOUGHT_SOMETHING_ELSE", revealsText: false, fragment: "bought something else" },
      { code: "PURCHASED_ELSEWHERE", revealsText: false, fragment: "purchased elsewhere" },
      // Nothing to fall back on: "Other" with an empty box says nothing about what changed.
      { code: "OTHER", revealsText: true, fragment: null },
    ],
  },
  differentProduct: { id: "differentProduct", kind: "text", options: [] },
  otherReason: { id: "otherReason", kind: "text", options: [] },
};

/**
 * The stable opening of the stored sentence. Exact bytes: no emoji, no punctuation, and never an
 * em dash of its own, so an admin can split on the first " — " to group cancellations by reason.
 */
const LEADS: Record<CancelReasonCode, string> = {
  FOUND_CHEAPER: "Found it cheaper elsewhere",
  CHANGED_MIND: "Changed my mind",
  DELIVERY_TOO_SLOW: "Delivery is taking too long",
  FOUND_DIFFERENT_PRODUCT: "Found a different product",
  PAYMENT_ISSUE: "Payment or pricing issue",
  WRONG_PRODUCT: "Ordered the wrong product",
  NO_LONGER_NEEDED: "No longer need the product",
  WANT_TO_CHANGE_ORDER: "Want to change something in the order",
  OTHER: "Other reason",
};

/** Space + U+2014 EM DASH + space. */
const SEPARATOR = " — ";

/** How much of the customer's own words is kept. */
export const MAX_CANCEL_TEXT_LENGTH = 140;

/**
 * orders.cancellation_reason is varchar(1000) and a too-long value fails the INSERT. By
 * construction the composed string tops out around 200 code points, so this clamp is a seatbelt:
 * if it ever fires, something above is wrong.
 */
const MAX_REASON_LENGTH = 1000;

/** Truncate by CODE POINT, never by UTF-16 unit, so an emoji is not cut in half. */
function clampCodePoints(value: string, max: number): string {
  const points = Array.from(value);
  if (points.length <= max) return value;
  return `${points.slice(0, max - 1).join("").replace(/ +$/u, "")}…`;
}

/**
 * Invisible formatting: the zero-width set and directional marks (U+200B-U+200F), the bidi
 * embeddings and overrides (U+202A-U+202E), the isolates (U+2066-U+2069), and the byte-order mark
 * (U+FEFF), which rides along with text pasted from a spreadsheet.
 *
 * None of them is a control character, so the class below lets them through — and a right-to-left
 * override inside the customer's own words reverses the rest of the line EVERYWHERE this sentence is
 * rendered: their own order timeline, the dashboard, a CSV export. What an admin reads is then not
 * what was submitted.
 *
 * Dropped outright rather than turned into spaces, because they sit inside words: a zero-width space
 * pasted into "Amazon.com" must leave "Amazon.com", not "Amazon .com".
 *
 * Exactly the set the backend strips from the structured feedback
 * (CancellationFeedbackCodec.isInvisibleFormatting) and exactly the set the mobile app strips
 * (sanitizeFreeText), deliberately: one string cleaned three different ways is three strings, and
 * the prose half is stored VERBATIM — the backend cleans `feedback` but copies `reason` as sent.
 */
const INVISIBLE_FORMATTING = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/gu;

/**
 * Everything the customer typed passes through here before it reaches the stored sentence.
 * NFC first so the same words composed on iOS and in a browser are byte-identical in reports;
 * then invisible formatting out; then control characters, newlines and line separators become
 * spaces (the string is one line in a timeline entry), runs of whitespace collapse, and the result
 * is capped. Case and internal punctuation are kept verbatim — these are the customer's words, not
 * a code. An empty result means "they skipped the box".
 *
 * The invisible pass comes FIRST, before whitespace collapses: U+FEFF is whitespace to a JS regex,
 * so collapsing first would turn a pasted BOM into a space in the middle of a word.
 */
export function sanitizeCancelText(raw: string | null | undefined): string {
  if (!raw) return "";
  const oneLine = raw
    .normalize("NFC")
    .replace(INVISIBLE_FORMATTING, "")
    .replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/gu, " ")
    .replace(/[\s\u00A0]+/gu, " ")
    .trim();
  return clampCodePoints(oneLine, MAX_CANCEL_TEXT_LENGTH);
}

/** A hundred times the priciest thing the catalogue sells — a ceiling, not a business rule. */
const MAX_CANCEL_PRICE = 9_999_999.99;

/**
 * What the price field could make of what was typed. Three outcomes rather than two, because "they
 * left it blank" and "they typed something we refuse to guess at" must be told apart: the first is
 * the question being skipped, the second is worth a word next to the field.
 */
export type CancelPriceReading =
  | { state: "absent" }
  | { state: "unreadable" }
  /** Well-formed but beyond what the column records — a different message from malformed input. */
  | { state: "tooLarge" }
  /** ASCII, a dot, two forced decimals, no currency and no thousands separator — e.g. "1100.00". */
  | { state: "amount"; amount: string };

/**
 * Folds the digits an Arabic or Persian keyboard produces onto ASCII, plus U+066B, the Arabic
 * decimal separator. Nothing else is touched: a character this does not recognise survives into the
 * shape test and is REFUSED there rather than stripped until whatever is left happens to parse.
 * That is the whole difference between reading "-5" as nothing and reading it as 5.
 */
function foldAsciiDigits(raw: string): string {
  let out = "";
  for (const char of raw) {
    const cp = char.codePointAt(0) ?? 0;
    if (cp >= 0x0660 && cp <= 0x0669) out += String(cp - 0x0660);
    else if (cp >= 0x06f0 && cp <= 0x06f9) out += String(cp - 0x06f0);
    else if (cp === 0x066b) out += ".";
    else out += char;
  }
  return out;
}

/** Digits with at most one dot, which may sit at either end: "1100", "249.", ".5", "89.999". */
const CANCEL_PRICE_SHAPE = /^(?:\d+(?:\.\d*)?|\.\d+)$/u;

/**
 * Reads the price the customer typed, and never invents one.
 *
 * A comma is refused outright rather than read as either separator. "1,50" is one and a half in
 * Baku, "1,299" is one thousand two hundred and ninety-nine in Dubai, and a pasted "1.299,00" is
 * neither — pasting a competitor's price is how this field is really filled, so there is no rule
 * that reads all three correctly and a guess silently replaces the one number this question exists
 * to collect. The customer is asked to retype it instead.
 *
 * Blank, unparseable, <= 0 and over the ceiling all mean ABSENT downstream: the price answer is
 * simply left out and the cancellation goes through regardless. Nothing here can block a
 * cancellation — only a step of the questionnaire, which the customer may also skip.
 */
export function readCancelPrice(raw: string | null | undefined): CancelPriceReading {
  const typed = foldAsciiDigits((raw ?? "").trim());
  if (typed === "") return { state: "absent" };
  if (!CANCEL_PRICE_SHAPE.test(typed)) return { state: "unreadable" };

  const value = Number(typed);
  if (!Number.isFinite(value) || value <= 0) return { state: "unreadable" };
  // Separated from "unreadable" on purpose: a number the customer typed perfectly well, which we
  // simply cannot record, deserves to be told what the limit is rather than "enter a price like
  // 249.00" — which reads as though they had mistyped it.
  if (value > MAX_CANCEL_PRICE) return { state: "tooLarge" };
  // Integer cents, half-up: (89.999 * 100) is 8999.900000000001 in doubles, and the epsilon nudge
  // stops an amount the customer typed as exactly half a cent from rounding down.
  const cents = Math.round((value + Number.EPSILON) * 100);
  // Rounding to zero is UNREADABLE, not an amount. "0.004" is four taps on a decimal pad, and it
  // passes the checks above because the typed value really is above zero — but it formats as
  // "0.00", so the field would refuse a typed 0 and then manufacture one anyway. Storing a price
  // the customer never typed is the exact thing this function exists to prevent, and the mobile app
  // rejects it here too; letting the two disagree makes the stored answers non-comparable.
  if (cents < 1) return { state: "unreadable" };
  return {
    state: "amount",
    amount: `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`,
  };
}

/**
 * The ORDER's ISO 4217 code, as the field label and the stored prose spell it. Seven markets charge
 * in seven currencies and the order page already renders every amount in the order's own, so asking
 * a customer looking at "AZN 249.00" what price they found "(AED)" is simply wrong. Falls back to
 * AED — the main market's currency, and what this string carried before it took one — because a
 * bare number in front of an admin is worse than an explicit code.
 */
export function cancelPriceCurrency(raw: string | null | undefined): string {
  const code = (raw ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/u.test(code) ? code : "AED";
}

/**
 * "AED 249.00" — always ASCII digits, always a dot, two forced decimals, no thousands separator and
 * never an Intl formatter (under the ar locale it would emit Arabic-Indic digits into a string the
 * dashboard has to read, and the two clients would stop agreeing). Returns "" when there is no
 * usable price, which counts as the question being skipped.
 */
export function formatCancelPrice(
  raw: string | null | undefined,
  currency: string | null | undefined,
): string {
  const reading = readCancelPrice(raw);
  return reading.state === "amount"
    ? `${cancelPriceCurrency(currency)} ${reading.amount}`
    : "";
}

/** One answer to the questionnaire: the reason, plus whatever its single follow-up collected. */
export type CancelAnswer = {
  reason: CancelReasonCode;
  /** The chosen option of the follow-up's list, when it has one. */
  option?: string | null;
  /** The follow-up's free text: the "Other" box, or the whole answer of a text follow-up. */
  text?: string | null;
  /** The price exactly as the customer typed it (cheaperElsewhere only) — never pre-formatted. */
  price?: string | null;
  /** The ORDER's currency, which is what the price was quoted against. See cancelPriceCurrency. */
  currency?: string | null;
};

/** The words an option contributes, falling back to its own fragment when its box is empty. */
function optionFragment(followUp: CancelFollowUp, answer: CancelAnswer): string {
  const chosen = followUp.options.find((o) => o.code === answer.option);
  if (!chosen) return "";
  if (!chosen.revealsText) return chosen.fragment ?? "";
  return sanitizeCancelText(answer.text) || chosen.fragment || "";
}

function composeDetail(answer: CancelAnswer): string {
  const reason = CANCEL_REASONS.find((r) => r.code === answer.reason);
  if (!reason?.followUp) return "";
  const followUp = CANCEL_FOLLOW_UPS[reason.followUp];

  switch (followUp.id) {
    case "cheaperElsewhere": {
      const price = formatCancelPrice(answer.price, answer.currency);
      const place = optionFragment(followUp, answer);
      // "at Amazon" only reads as English after a price; alone it is just "Amazon".
      return [price, place && (price ? `at ${place}` : place)].filter(Boolean).join(" ");
    }
    case "deliveryTime": {
      const wanted = optionFragment(followUp, answer);
      return wanted ? `wanted delivery ${wanted}` : "";
    }
    case "whatChanged":
      return optionFragment(followUp, answer);
    case "differentProduct": {
      const chose = sanitizeCancelText(answer.text);
      return chose ? `chose instead: ${chose}` : "";
    }
    case "otherReason":
      return sanitizeCancelText(answer.text);
  }
}

/**
 * The whole contract in one line: LEAD, then the customer's detail after an em dash when they gave
 * one. A skipped follow-up leaves the lead standing alone — never a dangling separator.
 */
export function composeCancellationReason(answer: CancelAnswer): string {
  const detail = composeDetail(answer);
  const lead = LEADS[answer.reason];
  return clampCodePoints(detail ? `${lead}${SEPARATOR}${detail}` : lead, MAX_REASON_LENGTH);
}

// ── The structured answers ───────────────────────────────────────────────────

/**
 * The English wording of the questionnaire, mirroring the `en` block of
 * lib/i18n/dictionaries.ts key for key.
 *
 * It is duplicated here on purpose. The UI is localised; this document is not, because admins read
 * it and because it is ONE language in the database — an Arabic answer beside an English one cannot
 * be grouped, counted or exported. So the strings that travel come from this module, which has no
 * locale, rather than from the dictionary the customer is reading, which has three.
 */
export const CANCEL_ENGLISH = {
  questions: {
    reason: "Why are you cancelling this order?",
    price: "If you don't mind us asking, what price did you find elsewhere?",
    where: "Where did you find it?",
    deliveryTime: "What delivery time would have worked for you?",
    whatChanged: "What changed?",
    differentProduct: "What product did you choose instead?",
    otherReason: "Could you tell us a little more?",
  },
  reasons: {
    FOUND_CHEAPER: "I found it cheaper elsewhere",
    CHANGED_MIND: "I changed my mind",
    DELIVERY_TOO_SLOW: "Delivery is taking too long",
    FOUND_DIFFERENT_PRODUCT: "I found a different product",
    PAYMENT_ISSUE: "Payment / pricing issue",
    WRONG_PRODUCT: "I ordered the wrong product",
    NO_LONGER_NEEDED: "I no longer need the product",
    WANT_TO_CHANGE_ORDER: "I want to change something in my order",
    OTHER: "Other",
  } as Record<CancelReasonCode, string>,
  places: {
    AMAZON: "Amazon",
    NOON: "Noon",
    RETAIL_STORE: "Retail store",
    ANOTHER_WEBSITE: "Another website",
    OTHER: "Other",
  } as Record<string, string>,
  deliveryTimes: {
    SAME_DAY: "Same day",
    NEXT_DAY: "Next day",
    // En dash, exactly as the label reads on screen. The prose fragment uses an ASCII hyphen; this
    // is the answer TEXT, so it is the wording, not the sentence material.
    TWO_TO_THREE_DAYS: "2–3 days",
    OTHER: "Other",
  } as Record<string, string>,
  whatChangedOptions: {
    DECIDED_NOT_TO_BUY: "Decided not to buy",
    BUDGET_CHANGED: "Budget changed",
    BOUGHT_SOMETHING_ELSE: "Bought something else",
    PURCHASED_ELSEWHERE: "Purchased elsewhere",
    OTHER: "Other",
  } as Record<string, string>,
} as const;

/** Which client collected the answers. The backend keeps WEB and MOBILE and drops anything else. */
export type CancelFeedbackSource = "WEB" | "MOBILE";

export type CancelFeedbackAnswer = {
  /**
   * The question's stable slot in the flow. The follow-up's own id, except for the two questions
   * `cheaperElsewhere` asks, which are "price" and "where" — both clients must spell these
   * identically or the dashboard's one list stops being one list.
   */
  key: string;
  /** The question as the customer read it, in English. */
  question: string;
  /** Their answer, in English — their own words when they typed some. */
  answer: string;
  /** The chosen option's code; null for free text and for the price. */
  code: string | null;
};

/**
 * The second, optional component of the cancel request, beside `reason`. Purely additive: the
 * backend behaves exactly as it did before this existed if it arrives absent or malformed, and it
 * stamps `version` and `submittedAt` itself — sending either is pointless, so neither is here.
 */
export type CancelFeedback = {
  source: CancelFeedbackSource;
  reasonCode: CancelReasonCode;
  answers: CancelFeedbackAnswer[];
};

/** The English label of one follow-up option — the same lookup the UI does, against en. */
function englishOptionLabel(id: CancelFollowUpId, code: string): string {
  const labels =
    id === "cheaperElsewhere"
      ? CANCEL_ENGLISH.places
      : id === "deliveryTime"
        ? CANCEL_ENGLISH.deliveryTimes
        : CANCEL_ENGLISH.whatChangedOptions;
  return labels[code] ?? code;
}

/**
 * What the customer said to a follow-up's list of options: their own words when they chose "Other"
 * and wrote some, the option's English label otherwise. Null when they chose nothing at all, which
 * is the question being skipped.
 *
 * `code` is what analytics GROUPS by, so it is null exactly when there is nothing to group: words
 * the customer typed into an "Other" box are free text, no matter which option revealed the box, and
 * counting a thousand different shop names as one "OTHER" bucket alongside Amazon and Noon would
 * make the one number this question exists to produce meaningless. An "Other" box left EMPTY is the
 * other case — the pick itself is then the whole answer, worth storing and worth counting — so it
 * keeps its code. This is what the mobile app stores for the same two selections
 * (cancel-reason.test.ts pins both), and the dashboard renders one list from both clients.
 *
 * Note this is not `optionFragment` above and must not be folded into it: that one builds lowercase
 * sentence material for the prose and substitutes a fallback fragment for an empty "Other" box.
 */
function chosenFeedbackAnswer(
  followUp: CancelFollowUp,
  answer: CancelAnswer,
): { answer: string; code: string | null } | null {
  const chosen = followUp.options.find((o) => o.code === answer.option);
  if (!chosen) return null;
  const typed = chosen.revealsText ? sanitizeCancelText(answer.text) : "";
  return typed
    ? { answer: typed, code: null }
    : { answer: englishOptionLabel(followUp.id, chosen.code), code: chosen.code };
}

/**
 * The same answers as {@link composeCancellationReason}, structured for the dashboard and for
 * counting — one entry per question the customer actually ANSWERED, in the order they were asked,
 * the reason itself first.
 *
 * A question they skipped is left out rather than sent blank: the backend drops a blank answer
 * anyway, and an empty row in the dashboard's list would read as a response that said nothing. The
 * reason is always present, so this is never empty and is always worth sending.
 */
export function composeCancellationFeedback(
  answer: CancelAnswer,
  source: CancelFeedbackSource,
): CancelFeedback {
  const q = CANCEL_ENGLISH.questions;
  const answers: CancelFeedbackAnswer[] = [
    {
      key: "reason",
      question: q.reason,
      answer: CANCEL_ENGLISH.reasons[answer.reason],
      code: answer.reason,
    },
  ];

  const reason = CANCEL_REASONS.find((r) => r.code === answer.reason);
  const followUp = reason?.followUp ? CANCEL_FOLLOW_UPS[reason.followUp] : null;

  if (followUp) {
    switch (followUp.id) {
      case "cheaperElsewhere": {
        // ABSENT, never a guess: a price that could not be read is left out of the document
        // entirely rather than sent as a number the customer never typed. See readCancelPrice.
        const price = formatCancelPrice(answer.price, answer.currency);
        if (price) answers.push({ key: "price", question: q.price, answer: price, code: null });
        const where = chosenFeedbackAnswer(followUp, answer);
        if (where) answers.push({ key: "where", question: q.where, ...where });
        break;
      }
      case "deliveryTime": {
        const when = chosenFeedbackAnswer(followUp, answer);
        if (when) answers.push({ key: "deliveryTime", question: q.deliveryTime, ...when });
        break;
      }
      case "whatChanged": {
        const changed = chosenFeedbackAnswer(followUp, answer);
        if (changed) answers.push({ key: "whatChanged", question: q.whatChanged, ...changed });
        break;
      }
      case "differentProduct": {
        const chose = sanitizeCancelText(answer.text);
        if (chose) {
          answers.push({
            key: "differentProduct",
            question: q.differentProduct,
            answer: chose,
            code: null,
          });
        }
        break;
      }
      case "otherReason": {
        const more = sanitizeCancelText(answer.text);
        if (more) {
          answers.push({ key: "otherReason", question: q.otherReason, answer: more, code: null });
        }
        break;
      }
    }
  }

  return { source, reasonCode: answer.reason, answers };
}
