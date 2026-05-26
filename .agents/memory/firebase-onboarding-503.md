---
name: Firebase onboarding redirect
description: app-wrapper onboarding redirect must check localStorage flag independently of 503 server errors
---

The app-wrapper checks if a new user needs onboarding. The original code had:
```ts
if (errorStatus === 503) return; // skips ALL new-user checks
```

This blocked new users from reaching /onboarding when Firebase wasn't configured, because localStorage flag and "very new user" checks never ran.

**Fix:** Only skip the 503 early-return if no new-user signals are present:
```ts
const localFlagSet = localStorage.getItem(`needs_onboarding_${user.uid}`) === "true";
const isVeryNewUser = ...; // createdAt < 90s ago

// Allow redirect even on 503 if new-user signal is set
if (errorStatus === 503 && !localFlagSet && !isVeryNewUser) return;

if (isProfileNotFound || localFlagSet || isVeryNewUser) {
  navigate("/onboarding");
}
```

**Why:** Firebase Auth works without FIREBASE_SERVICE_ACCOUNT (client-side only), so new users can sign in but the server can't verify their profile. Still need to show them onboarding.

**How to apply:** Any auth wrapper that gates redirects on server availability.
