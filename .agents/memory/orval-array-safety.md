---
name: Orval generated client array safety
description: Generated hooks can return unexpected shapes; always guard array operations with Array.isArray()
---

When a backend route returns 503/error JSON, the orval-generated hook's `data` field can receive a non-array value even when the TypeScript return type is `T[]`. Calling `.filter()` or `.reduce()` on that value throws "r?.filter is not a function".

**Fix:** Always normalize:
```ts
const { data: rawBets } = useListMyBets(...);
const bets = Array.isArray(rawBets) ? rawBets : [];
// Now safely use bets.filter(), bets.map(), bets.reduce()
```

**Why:** The generated TypeScript types assume success responses; runtime error shapes bypass those types.

**How to apply:** Any page that uses generated hooks returning arrays and does `.filter()/.map()/.reduce()` on the result.
