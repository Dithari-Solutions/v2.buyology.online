# Google sign-in deployment

Keep existing Apple and Google secrets unchanged. The backend deployment maps
`GOOGLE_LOGIN_V2_CLIENT_ID` to `GOOGLE_ALLOWED_AUDIENCES`, retaining the legacy
Google client as an accepted audience. This ID-token flow does not need the new
client secret; keep that secret on the server only.

Add this public build setting to the website's `.env.local` before building:

```dotenv
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1099126845236-un3fmvlv44o0hbmvhb1qs4b4juu8sor3.apps.googleusercontent.com
```

Deploy the backend first, then build and deploy the website using DEPLOY.md.
Restarting PM2 alone does not update a public variable embedded at build time.
Google JavaScript origins must include https://buyology.online and
https://v2.buyology.online. Redirect URIs can remain empty for the browser
ID-token callback used here.

For a new native iOS build, set:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1099126845236-un3fmvlv44o0hbmvhb1qs4b4juu8sor3.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=1099126845236-8cqo0a5tisjgnqt8np7j4f6b5b5m0vqg.apps.googleusercontent.com
```

These are public client IDs. Never put the client secret in NEXT_PUBLIC or
EXPO_PUBLIC settings. Native configuration requires a new iOS binary, not just
an over-the-air JavaScript update. Android Google login remains hidden until
its OAuth client and signing certificate are configured.

Test website and iOS sign-in with a configured Google test account, check the
account profile and session refresh, then verify Apple and password login still
work. Console configuration and passing local tests do not confirm live login.
