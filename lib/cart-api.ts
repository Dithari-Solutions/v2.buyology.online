import { authedJson, AuthError } from "@/lib/auth/client";

/**
 * Typed client for the backend cart + favourites — both keyed by auth_credentials.id (the JWT
 * `sub`, Claims.credentialId), NEVER users.id: the backend rejects a users.id with "Auth
 * credential not found". All calls require a session; guests never reach this module.
 */

// ── Cart ─────────────────────────────────────────────────────────────────────

export type ApiSpecSelection = {
  specOptionId: string;
  groupCode?: string | null;
  groupName?: string | null;
  value?: string | null;
  unit?: string | null;
  colorCode?: string | null;
};

export type ApiCartItem = {
  id: string;
  productId: string;
  productSku?: string | null;
  variantId?: string | null;
  variantSku?: string | null;
  storeId?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  originalUnitPrice?: number | null;
  originalTotalPrice?: number | null;
  quickDelivery?: boolean | null;
  selected: boolean;
  selectedSpecs?: ApiSpecSelection[] | null;
};

export type ApiCart = {
  id: string;
  authCredentialId: string;
  status: string;
  /** SELECTED-lines subtotal in the cart currency — the backend's definition of the total. */
  totalPrice: number;
  countryCode?: string | null;
  currency?: string | null;
  items: ApiCartItem[];
  /** Policy figures FX-converted to the cart currency; null means "unknown", not zero. */
  freeShippingThreshold?: number | null;
  deliveryFee?: number | null;
  qualifiesForFreeShipping?: boolean | null;
  expressAvailable?: boolean | null;
  expressDeliveryFee?: number | null;
};

export type AddCartItemInput = {
  storeId: string;
  productId: string;
  variantId?: string;
  specOptionIds?: string[];
  quantity: number;
};

export function getCart(credentialId: string): Promise<ApiCart> {
  return authedJson<ApiCart>(`/api/cart/${credentialId}`);
}

export function addCartItem(credentialId: string, input: AddCartItemInput): Promise<ApiCart> {
  return authedJson<ApiCart>(`/api/cart/${credentialId}/items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCartItemQuantity(
  credentialId: string,
  cartItemId: string,
  quantity: number,
): Promise<ApiCart> {
  return authedJson<ApiCart>(`/api/cart/${credentialId}/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

/** Removing a line that is already gone is success, not an error. */
export async function removeCartItem(
  credentialId: string,
  cartItemId: string,
): Promise<ApiCart | null> {
  try {
    return await authedJson<ApiCart>(`/api/cart/${credentialId}/items/${cartItemId}`, {
      method: "DELETE",
    });
  } catch (e) {
    if (e instanceof AuthError && e.status === 404) return null;
    throw e;
  }
}

/** The flag decides what the backend prices and ships — `selected` rides as a QUERY param. */
export function setCartItemSelection(
  credentialId: string,
  cartItemId: string,
  selected: boolean,
): Promise<ApiCart> {
  return authedJson<ApiCart>(
    `/api/cart/${credentialId}/items/${cartItemId}/selection?selected=${selected}`,
    { method: "PATCH" },
  );
}

export function setAllCartSelection(
  credentialId: string,
  selected: boolean,
): Promise<ApiCart> {
  return authedJson<ApiCart>(`/api/cart/${credentialId}/selection?selected=${selected}`, {
    method: "PATCH",
  });
}

// ── Favourites ───────────────────────────────────────────────────────────────

export type ApiFavorite = {
  id: string;
  productId: string;
  productSku?: string | null;
  savedAt?: string | null;
};

export async function getFavorites(credentialId: string): Promise<ApiFavorite[]> {
  const res = await authedJson<{ total: number; items: ApiFavorite[] }>(
    `/api/favorites/${credentialId}`,
  );
  return res.items ?? [];
}

/** Duplicate add (409) means the wish already stands — success. */
export async function addFavorite(credentialId: string, productId: string): Promise<void> {
  try {
    await authedJson(`/api/favorites/${credentialId}/products/${productId}`, {
      method: "POST",
    });
  } catch (e) {
    if (e instanceof AuthError && e.status === 409) return;
    throw e;
  }
}

/** Removing a favourite that is already gone (404) is success. */
export async function removeFavorite(credentialId: string, productId: string): Promise<void> {
  try {
    await authedJson(`/api/favorites/${credentialId}/products/${productId}`, {
      method: "DELETE",
    });
  } catch (e) {
    if (e instanceof AuthError && e.status === 404) return;
    throw e;
  }
}
