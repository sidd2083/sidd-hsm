---
name: API error body vs status code
description: When using raw fetch() (not customFetch), check the HTTP status code not the response body text for error type detection
---

When a route returns 503 with body `{"error": "Service unavailable"}`, checking `msg.includes("503")` on the error message (which is the body text) fails because "503" is not in the body.

**Fix:** Attach the HTTP status to the thrown error:
```ts
class AdminFetchError extends Error {
  status: number;
  constructor(message: string, status: number) { ... }
}
// In fetch handler:
if (!res.ok) throw new AdminFetchError(await res.text(), res.status);
// In catch:
const status = err instanceof AdminFetchError ? err.status : 0;
if (status === 503) { ... }
```

**Why:** Body text is application-controlled; status codes are HTTP-level and reliable for branching on error type.

**How to apply:** Any time you see error handling that does `msg.includes("503")` or similar on raw fetch error messages — replace with status code checking.
