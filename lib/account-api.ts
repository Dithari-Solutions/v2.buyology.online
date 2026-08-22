import { authedJson } from "@/lib/auth/client";

/**
 * The account area's data: the customer's orders and saved addresses.
 *
 * Contract notes:
 * - Orders are a Spring Page; the summary carries no line items or thumbnails — the list renders
 *   status, method, destination, money and dates, which is what the endpoint actually offers.
 * - Addresses have NO update endpoint (create, delete, set-default only) — the UI must not
 *   pretend to edit.
 * - Cancelling runs the full backend cancellation (courier pre-flight included): a 4xx carries a
 *   customer-readable reason (e.g. the courier already collected the parcel) that must be shown,
 *   not swallowed.
 */

export type OrderStatus =
  | "PENDING_PAYMENT" | "PAID" | "PACKAGING" | "READY_FOR_PICKUP" | "IN_COURIER"
  | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "FAILED"
  | "PROCESSING" | "COURIER_ASSIGNED" | "PICKED_UP" | "SHIPPED";

export type OrderSummary = {
  id: string;
  status: OrderStatus;
  deliveryMethod?: "EXPRESS" | "REGULAR" | "PICKUP" | null;
  totalAmount: number;
  currency?: string | null;
  trackingCode?: string | null;
  carrierName?: string | null;
  city?: string | null;
  country?: string | null;
  paidAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
};

export type OrdersPage = {
  content: OrderSummary[];
  totalPages: number;
  totalElements: number;
  number: number;
};

export function fetchOrders(page = 0, size = 10): Promise<OrdersPage> {
  return authedJson<OrdersPage>(`/api/orders?page=${page}&size=${size}`);
}

export function cancelOrder(orderId: string, reason?: string): Promise<unknown> {
  return authedJson(`/api/orders/${orderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason: reason ?? null }),
  });
}

/**
 * Which orders the customer may still cancel — mirrors the backend's isCustomerCancellable so the
 * button only shows where the server would say yes. The server re-validates regardless, and may
 * still refuse (e.g. the courier could not be confirmed stopped); that reason is surfaced.
 */
export function isCancellable(status: OrderStatus): boolean {
  return [
    "PENDING_PAYMENT", "PAID", "PACKAGING", "READY_FOR_PICKUP", "IN_COURIER",
    "PROCESSING", "COURIER_ASSIGNED", "PICKED_UP",
  ].includes(status);
}

export type OrderItem = {
  id: string;
  productId?: string | null;
  productName?: string | null;
  productImage?: string | null;
  variantSku?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type TrackingEvent = {
  id: string;
  status: OrderStatus;
  notes?: string | null;
  createdAt?: string | null;
};

export type OrderDetail = OrderSummary & {
  deliveryMethod?: "EXPRESS" | "REGULAR" | "PICKUP" | null;
  recipientFirstName?: string | null;
  recipientLastName?: string | null;
  recipientPhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  state?: string | null;
  postalCode?: string | null;
  pickupStoreName?: string | null;
  pickupStoreAddress?: string | null;
  subtotal?: number | null;
  shippingFee?: number | null;
  discount?: number | null;
  creditApplied?: number | null;
  creditCurrency?: string | null;
  couponCode?: string | null;
  estimatedDeliveryTime?: string | null;
  cancellationReason?: string | null;
  items?: OrderItem[] | null;
  trackingHistory?: TrackingEvent[] | null;
};

export function fetchOrder(orderId: string): Promise<OrderDetail> {
  return authedJson<OrderDetail>(`/api/orders/${orderId}`);
}

// ── Addresses ────────────────────────────────────────────────────────────────

export type AddressLabel = "HOME" | "WORK" | "OTHER";

export type Address = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  label?: AddressLabel | null;
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  /** The customer's own name for this address; shown instead of the label when present. */
  customLabel?: string | null;
  formattedAddress?: string | null;
  isDefault?: boolean;
  /** The backend may serialize the flag under either name; normalise on read. */
  default?: boolean;
};

export type SaveAddress = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  label: AddressLabel;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
  customLabel?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

export async function fetchAddresses(uid: string): Promise<Address[]> {
  const rows = await authedJson<Address[]>(`/api/users/${uid}/addresses`);
  return rows.map((a) => ({ ...a, isDefault: a.isDefault ?? a.default ?? false }));
}

export function saveAddress(uid: string, address: SaveAddress): Promise<Address> {
  return authedJson<Address>(`/api/users/${uid}/addresses`, {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export function deleteAddress(uid: string, addressId: string): Promise<unknown> {
  return authedJson(`/api/users/${uid}/addresses/${addressId}`, { method: "DELETE" });
}

export function setDefaultAddress(uid: string, addressId: string): Promise<Address> {
  return authedJson<Address>(`/api/users/${uid}/addresses/${addressId}/default`, {
    method: "PATCH",
  });
}
