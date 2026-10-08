# Website Apple login

The login and personal signup pages use the Apple button, Apple's popup SDK, a backend-issued nonce and client-generated state. The returned state must match before the authorization code is exchanged. The backend verifies the token and consumes the nonce before issuing the normal Buyology session.

Set these **at build time**:

```
NEXT_PUBLIC_APPLE_CLIENT_ID=<Apple website Services ID>
NEXT_PUBLIC_APPLE_REDIRECT_URI=https://buyology.online
```

Register that exact domain/return URL in Apple Developer and configure the same Services ID in backend `APPLE_CLIENT_ID`. If deploying to `v2.buyology.online`, configure and register that exact HTTPS URL instead. Without the Services ID, the Apple button stays hidden. No private Apple keys belong in Next public variables.

See `buyology-e-commerce-be/docs/apple-login.md` in the platform workspace for the full owner checklist, backend settings, email relay and deployment order. Rebuild after changing public variables. Live verification requires the owner's Apple configuration.
