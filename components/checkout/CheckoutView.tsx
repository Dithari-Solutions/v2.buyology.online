"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import {
  AuthError,
  fetchProfile,
  type Profile,
} from "@/lib/auth/client";
import {
  fetchAddresses,
  sendPhoneOtp,
  verifyPhone,
  type Address,
} from "@/lib/account-api";
import {
  checkoutCart,
  createOrder,
  fetchExpressStores,
  fetchPickupStores,
  initiatePayment,
  validatePromo,
  type PaymentMethod,
  type PromoValidation,
  type PublicStore,
} from "@/lib/checkout-api";
import { formatMoney } from "@/lib/format";
import { OtpInput } from "@/components/auth/OtpInput";
import { TabbyLogo, TamaraLogo } from "@/components/cart/payment-logos";
import {
  ChevronLeftIcon,
  CreditCardIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/icons";

export const PENDING_TX_KEY = "buyo_pending_tx";
export const PENDING_ORDER_KEY = "buyo_pending_order";

type Fulfilment = "DELIVERY" | "PICKUP";
type Method = "EXPRESS" | "REGULAR";

const card = "rounded-2xl border border-border bg-surface p-5";
const radioCls =
  "h-[18px] w-[18px] shrink-0 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Single-page checkout over the server cart's SELECTED lines. The client only chooses —
 * address, method, promo, payment — and never prices anything: the backend recomputes the
 * fee, the discount and the charged amount, and the created order's total is what Paymob
 * collects. Placing again after a failed payment is safe by design (CHECKED_OUT cart resume
 * + PENDING_PAYMENT order reuse).
 */
export function CheckoutView() {
  const { t } = useI18n();
  const c = t.checkout;
  const router = useRouter();
  const { status: authStatus, user } = useAuth();
  const credId = user?.credentialId ?? null;
  const uid = user?.uid ?? null;
  const cart = useCart();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [stores, setStores] = useState<PublicStore[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [fulfilment, setFulfilment] = useState<Fulfilment>("DELIVERY");
  const [addressId, setAddressId] = useState<string | null>(null);
  const [pickupStoreId, setPickupStoreId] = useState<string | null>(null);
  const [method, setMethod] = useState<Method>("REGULAR");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("CARD");

  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<(PromoValidation & { code: string }) | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone verification gate — the backend refuses createOrder for unverified phones.
  const [phoneStep, setPhoneStep] = useState<"idle" | "sending" | "code" | "verifying">("idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // ── Guards + data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (authStatus === "guest") router.replace("/login?next=/checkout");
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authed" || !uid) return;
    let cancelled = false;
    Promise.all([fetchProfile(uid), fetchAddresses(uid)])
      .then(([p, a]) => {
        if (cancelled) return;
        setProfile(p);
        setAddresses(a);
        setPhoneNumber(p.phoneNumber ?? "");
        const preferred = a.find((x) => x.isDefault) ?? a[0];
        setAddressId((cur) => cur ?? preferred?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, uid]);

  useEffect(() => {
    if (fulfilment !== "PICKUP" || stores !== null) return;
    let cancelled = false;
    fetchPickupStores()
      .then((rows) => {
        if (!cancelled) setStores(rows.filter((s) => s.locations.length > 0));
      })
      .catch(() => {
        if (!cancelled) setStores([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fulfilment, stores]);

  // ── Express eligibility: judged from the delivery ADDRESS's pin, all lines in range ──
  const selectedLines = useMemo(
    () => cart.items.filter((l) => l.selected && l.selectable),
    [cart.items],
  );
  const address = addresses?.find((a) => a.id === addressId) ?? null;
  // Keyed by the address pin so a stale answer for another address can never leak in;
  // an unanswered lookup means express is simply not offered — never guessed.
  const coordKey =
    address?.latitude != null && address?.longitude != null
      ? `${address.latitude},${address.longitude}`
      : null;
  const [expressRes, setExpressRes] = useState<{ key: string; ids: string[] } | null>(null);
  useEffect(() => {
    if (!coordKey) return;
    let cancelled = false;
    const [lat, lng] = coordKey.split(",").map(Number);
    fetchExpressStores(lat, lng)
      .then((res) => {
        if (!cancelled) setExpressRes({ key: coordKey, ids: res.storeIds });
      })
      .catch(() => {
        /* unanswered — never offer express on a guess */
      });
    return () => {
      cancelled = true;
    };
  }, [coordKey]);
  const expressStoreIds = expressRes?.key === coordKey ? expressRes.ids : null;

  const expressAvailable =
    fulfilment === "DELIVERY" &&
    expressStoreIds !== null &&
    selectedLines.length > 0 &&
    selectedLines.every((l) => l.storeId && expressStoreIds.includes(l.storeId));
  const addressHasPin = address?.latitude != null && address?.longitude != null;
  // Losing eligibility mid-edit silently falls back to standard — derived, never a state write.
  const effectiveMethod: Method = method === "EXPRESS" && !expressAvailable ? "REGULAR" : method;

  // ── Money (display only; the order's own total is what gets charged) ───────
  const currency = cart.currency;
  const subtotal = cart.subtotal;
  const free = cart.fees?.qualifiesForFreeShipping === true;
  const standardFee = free ? 0 : cart.fees?.deliveryFee ?? null;
  const expressFee = free ? 0 : cart.fees?.expressFee ?? null;
  const shownFee =
    fulfilment === "PICKUP" ? 0 : effectiveMethod === "EXPRESS" ? expressFee : standardFee;
  // Mirror the backend clamp: a fixed discount can eat the delivery fee too.
  const discount = promo?.valid
    ? Math.min(promo.discountAmount ?? 0, subtotal + (shownFee ?? 0))
    : 0;
  const total = Math.max(0, subtotal + (shownFee ?? 0) - discount);

  // ── Promo ──────────────────────────────────────────────────────────────────
  async function applyPromo(e: React.FormEvent) {
    e.preventDefault();
    const code = promoCode.trim();
    if (!code || promoBusy) return;
    setPromoBusy(true);
    try {
      const res = await validatePromo(code, subtotal, selectedLines.map((l) => l.productId));
      setPromo({ ...res, code });
    } catch {
      setPromo({ valid: false, message: null, code });
    } finally {
      setPromoBusy(false);
    }
  }

  // ── Phone verification ─────────────────────────────────────────────────────
  async function onSendCode() {
    if (!uid || !phoneNumber.trim()) return;
    setPhoneError(null);
    setPhoneStep("sending");
    try {
      await sendPhoneOtp(uid, phoneNumber.trim());
      setPhoneStep("code");
    } catch (err) {
      setPhoneError(err instanceof AuthError && err.message ? err.message : t.auth.errors.generic);
      setPhoneStep("idle");
    }
  }
  async function onVerifyCode() {
    if (!uid || otp.length < 6) return;
    setPhoneError(null);
    setPhoneStep("verifying");
    try {
      await verifyPhone(uid, phoneNumber.trim(), otp);
      if (uid) setProfile(await fetchProfile(uid));
      setOtp("");
      setPhoneStep("idle");
    } catch (err) {
      setPhoneError(err instanceof AuthError && err.message ? err.message : t.auth.errors.generic);
      setPhoneStep("code");
    }
  }

  // ── Place order ────────────────────────────────────────────────────────────
  const placingRef = useRef(false);
  const placeOrder = useCallback(async () => {
    if (placingRef.current || !credId || !uid || !profile) return;
    placingRef.current = true;
    setPlacing(true);
    setError(null);
    try {
      // 0. Let in-flight cart writes land first — what gets priced must be what was shown.
      await cart.settle();
      // 1. A promo that silently zeroes at order time is worse than a refused one —
      //    re-validate at the moment of truth.
      let coupon: string | undefined;
      if (promo?.valid && promo.code) {
        const check = await validatePromo(promo.code, subtotal, selectedLines.map((l) => l.productId));
        if (!check.valid) {
          setPromo({ ...check, code: promo.code });
          setError(check.message || c.promoInvalid);
          placingRef.current = false;
          setPlacing(false);
          return;
        }
        coupon = promo.code;
      }
      // 2. Freeze the cart (resumes a lingering CHECKED_OUT cart on retries).
      const checked = await checkoutCart(credId);
      // 3. Create (or reuse) the order — the server prices everything.
      const order = await createOrder(credId, {
        cartId: checked.id,
        deliveryMethod: fulfilment === "PICKUP" ? "PICKUP" : effectiveMethod,
        addressId: fulfilment === "DELIVERY" ? addressId ?? undefined : undefined,
        pickupStoreId: fulfilment === "PICKUP" ? pickupStoreId ?? undefined : undefined,
        couponCode: coupon,
      });
      // 4. Charge exactly the order's own total.
      const pay = await initiatePayment({
        appOrderId: order.id,
        cartId: checked.id,
        methodType: payMethod,
        amount: order.totalAmount,
        currency: order.currency ?? "AED",
        customerId: uid,
        customerEmail: profile.email ?? "",
        customerPhone: profile.phoneNumber ?? undefined,
        billingName:
          [profile.firstName, profile.lastName].filter(Boolean).join(" ") || (profile.email ?? "-"),
        redirectionUrl: `${window.location.origin}/payment/callback`,
      });
      if (!pay.checkoutUrl) throw new Error("no checkout url");
      try {
        sessionStorage.setItem(PENDING_TX_KEY, pay.transactionId);
        sessionStorage.setItem(PENDING_ORDER_KEY, order.id);
      } catch {
        /* the callback falls back to its query params */
      }
      window.location.href = pay.checkoutUrl;
      // keep `placing` true — we are leaving the page
    } catch (err) {
      const msg = err instanceof AuthError && err.message && err.status !== 0 ? err.message : null;
      setError(msg ?? c.placeFailed);
      if (msg && /verify your phone/i.test(msg)) setPhoneStep("idle"); // the gate is visible above
      placingRef.current = false;
      setPlacing(false);
      cart.refresh(); // stock errors may have changed what's orderable
    }
  }, [credId, uid, profile, promo, subtotal, selectedLines, fulfilment, effectiveMethod, addressId, pickupStoreId, payMethod, cart, c]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (
    authStatus === "loading" ||
    (authStatus === "authed" && !loadError && (!profile || addresses === null || !cart.ready))
  ) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" aria-busy>
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
      </div>
    );
  }
  if (authStatus !== "authed") return null;

  if (loadError) {
    return (
      <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        {t.auth.errors.generic}
      </p>
    );
  }

  if (cart.ready && selectedLines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold text-foreground">{t.cart.noneSelected}</p>
        <Link
          href="/cart"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.cart.goToCart}
        </Link>
      </div>
    );
  }

  const phoneVerified = profile?.phoneVerified === true;
  const canPlace =
    !placing &&
    phoneVerified &&
    selectedLines.length > 0 &&
    (fulfilment === "PICKUP" ? !!pickupStoreId : !!addressId);

  return (
    <div>
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground">
        <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
        {t.cart.goToCart}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {c.title}
      </h1>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {/* Phone verification gate */}
          {profile && !phoneVerified && (
            <section className={card}>
              <h2 className="mb-1 font-semibold text-foreground">{c.phoneTitle}</h2>
              <p className="mb-4 text-sm text-muted">{c.phoneHint}</p>
              {phoneStep === "code" || phoneStep === "verifying" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted" dir="ltr">{phoneNumber}</p>
                  <OtpInput value={otp} onChange={setOtp} />
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      disabled={otp.length < 6 || phoneStep === "verifying"}
                      onClick={onVerifyCode}
                      className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {phoneStep === "verifying" ? t.auth.loading : c.verify}
                    </button>
                    <button type="button" onClick={onSendCode} className="text-sm font-medium text-brand-icon hover:underline">
                      {c.resendCode}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <input
                    type="tel"
                    dir="ltr"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+971…"
                    className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    disabled={phoneStep === "sending" || !phoneNumber.trim()}
                    onClick={onSendCode}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {phoneStep === "sending" ? t.auth.loading : c.sendCode}
                  </button>
                </div>
              )}
              {phoneError && (
                <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{phoneError}</p>
              )}
            </section>
          )}

          {/* Fulfilment */}
          <section className={card}>
            <h2 id="checkout-fulfilment-h" className="mb-4 font-semibold text-foreground">{c.fulfilment}</h2>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["DELIVERY", "PICKUP"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFulfilment(f)}
                  aria-pressed={fulfilment === f}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    fulfilment === f
                      ? "border-brand bg-brand-soft text-brand-icon"
                      : "border-border text-muted hover:border-border-strong"
                  }`}
                >
                  {f === "DELIVERY" ? c.delivery : c.pickup}
                </button>
              ))}
            </div>

            {fulfilment === "DELIVERY" ? (
              <>
                {addresses && addresses.length > 0 ? (
                  <div className="space-y-2" role="radiogroup" aria-labelledby="checkout-fulfilment-h">
                    {addresses.map((a) => (
                      <label
                        key={a.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                          addressId === a.id ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={addressId === a.id}
                          onChange={() => setAddressId(a.id)}
                          className={`${radioCls} mt-0.5`}
                        />
                        <span className="min-w-0 text-sm">
                          <span className="font-semibold text-foreground">
                            {a.customLabel || (a.label ? t.account.addresses.labels[a.label] : "")}
                          </span>
                          <span className="mt-0.5 block text-muted">
                            {[a.addressLine1, a.addressLine2, a.city, a.country].filter(Boolean).join(", ")}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-border bg-surface-2 px-4 py-4 text-sm text-muted">
                    {c.noAddresses}
                  </p>
                )}
                <Link
                  href="/account"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-icon hover:underline"
                >
                  <MapPinIcon className="h-4 w-4" />
                  {c.manageAddresses}
                </Link>
              </>
            ) : stores === null ? (
              <div className="h-24 animate-pulse rounded-xl border border-border bg-surface-2 motion-reduce:animate-none" aria-busy />
            ) : stores.length === 0 ? (
              <p className="rounded-xl border border-border bg-surface-2 px-4 py-4 text-sm text-muted">{c.noStores}</p>
            ) : (
              <div className="space-y-2" role="radiogroup" aria-labelledby="checkout-fulfilment-h">
                {stores.map((s) => {
                  const loc = s.locations.find((l) => l.isPrimary) ?? s.locations[0];
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                        pickupStoreId === s.id ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="store"
                        checked={pickupStoreId === s.id}
                        onChange={() => setPickupStoreId(s.id)}
                        className={`${radioCls} mt-0.5`}
                      />
                      <span className="min-w-0 text-sm">
                        <span className="font-semibold text-foreground">{loc?.branchName || s.name}</span>
                        <span className="mt-0.5 block text-muted">
                          {[loc?.address, loc?.city].filter(Boolean).join(", ")}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Delivery method */}
          {fulfilment === "DELIVERY" && (
            <section className={card}>
              <h2 className="mb-4 font-semibold text-foreground">{c.method}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMethod("REGULAR")}
                  aria-pressed={effectiveMethod === "REGULAR"}
                  className={`rounded-xl border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    effectiveMethod === "REGULAR" ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <TruckIcon className="h-4 w-4 text-gold" />
                    {c.standard}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {standardFee === 0 ? (
                      t.cart.free
                    ) : standardFee != null ? (
                      <span dir="ltr">{formatMoney(standardFee, currency)}</span>
                    ) : (
                      t.cart.shippingAtCheckout
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!expressAvailable}
                  onClick={() => setMethod("EXPRESS")}
                  aria-pressed={effectiveMethod === "EXPRESS"}
                  className={`rounded-xl border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    effectiveMethod === "EXPRESS" ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <TruckIcon className="h-4 w-4 text-gold" />
                    {c.express}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {expressAvailable ? (
                      expressFee === 0 ? (
                        t.cart.free
                      ) : expressFee != null ? (
                        <span dir="ltr">{formatMoney(expressFee, currency)}</span>
                      ) : (
                        t.cart.shippingAtCheckout
                      )
                    ) : !addressHasPin ? (
                      c.expressNeedsPin
                    ) : (
                      c.expressUnavailable
                    )}
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* Payment method */}
          <section className={card}>
            <h2 id="checkout-payment-h" className="mb-4 font-semibold text-foreground">{c.payment}</h2>
            <div className="space-y-2" role="radiogroup" aria-labelledby="checkout-payment-h">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payMethod === "CARD" ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"}`}>
                <input type="radio" name="pay" checked={payMethod === "CARD"} onChange={() => setPayMethod("CARD")} className={radioCls} />
                <CreditCardIcon className="h-5 w-5 text-brand-icon" />
                <span className="text-sm font-semibold text-foreground">{c.card}</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payMethod === "TABBY" ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"}`}>
                <input type="radio" name="pay" checked={payMethod === "TABBY"} onChange={() => setPayMethod("TABBY")} className={radioCls} />
                <TabbyLogo className="h-[18px] w-auto" />
                <span className="text-sm text-muted" dir="ltr">
                  4 × {formatMoney(Math.round((total / 4) * 100) / 100, currency)}
                </span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${payMethod === "TAMARA" ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"}`}>
                <input type="radio" name="pay" checked={payMethod === "TAMARA"} onChange={() => setPayMethod("TAMARA")} className={radioCls} />
                <TamaraLogo className="h-[18px] w-auto" />
                <span className="text-sm text-muted" dir="ltr">
                  3 × {formatMoney(Math.round((total / 3) * 100) / 100, currency)}
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-6 lg:sticky lg:top-40">
          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t.cart.orderSummary}</h2>

            <ul className="mb-4 space-y-2 text-sm">
              {selectedLines.map((l) => (
                <li key={l.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-muted">
                    {l.qty} × {l.name}
                  </span>
                  <span className="shrink-0 font-medium text-foreground" dir="ltr">
                    {formatMoney(l.price * l.qty, l.currency)}
                  </span>
                </li>
              ))}
            </ul>

            <form onSubmit={applyPromo} className="mb-4 flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={t.cart.promoPlaceholder}
                aria-label={t.cart.promo}
                className="min-w-0 flex-1 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={promoBusy || !promoCode.trim()}
                className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
              >
                {promoBusy ? "…" : t.cart.apply}
              </button>
            </form>
            {promo && !promo.valid && (
              <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
                {promo.message || c.promoInvalid}
              </p>
            )}

            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t.cart.subtotal}</dt>
                <dd className="font-medium text-foreground" dir="ltr">{formatMoney(subtotal, currency)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                  <dt>{c.discount} ({promo!.code})</dt>
                  <dd dir="ltr">-{formatMoney(discount, currency)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t.cart.shipping}</dt>
                {shownFee === 0 ? (
                  <dd className="font-semibold text-warn dark:text-gold">{t.cart.free}</dd>
                ) : shownFee != null ? (
                  <dd className="font-medium text-foreground" dir="ltr">{formatMoney(shownFee, currency)}</dd>
                ) : (
                  <dd className="text-muted">{t.cart.shippingAtCheckout}</dd>
                )}
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="font-semibold text-foreground">{t.cart.total}</span>
              <span className="text-xl font-bold tracking-tight text-foreground" dir="ltr">
                {formatMoney(total, currency)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">{c.totalNote}</p>

            <button
              type="button"
              disabled={!canPlace}
              onClick={placeOrder}
              className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? c.placing : c.placeOrder}
            </button>
            {!phoneVerified && profile && (
              <p className="mt-2 text-center text-xs text-muted">{c.phoneRequired}</p>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
              <ShieldCheckIcon className="h-4 w-4 text-gold" />
              {t.cart.secure}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
