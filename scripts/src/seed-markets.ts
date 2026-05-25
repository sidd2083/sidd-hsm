// Seed markets via the Firebase REST API (no auth credentials needed for the seed endpoint)
// This uses the Firestore REST API which works without ADC

const PROJECT_ID = process.env["VITE_FIREBASE_PROJECT_ID"] ?? "studenthub-6bcc5";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: "NULL_VALUE";
}

interface FirestoreDoc {
  fields: Record<string, FirestoreValue>;
}

function toFirestore(obj: Record<string, unknown>): FirestoreDoc {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null) {
      fields[k] = { nullValue: "NULL_VALUE" };
    } else if (typeof v === "string") {
      fields[k] = { stringValue: v };
    } else if (typeof v === "number") {
      if (Number.isInteger(v)) {
        fields[k] = { integerValue: String(v) };
      } else {
        fields[k] = { doubleValue: v };
      }
    } else if (typeof v === "boolean") {
      fields[k] = { booleanValue: v };
    }
  }
  return { fields };
}

const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;

const markets = [
  { question: "Will the college football team win their next match?", category: "sports", lockTimestamp: now + 2 * oneDay, status: "active", yesPool: 45000, noPool: 12000, winningOutcome: null as null, createdAt: now - oneDay },
  { question: "Will the annual college fest be organized this semester?", category: "college", lockTimestamp: now + 5 * oneDay, status: "active", yesPool: 28000, noPool: 35000, winningOutcome: null as null, createdAt: now - 2 * oneDay },
  { question: "Will Instagram go down for more than 2 hours this week?", category: "social", lockTimestamp: now + 3 * oneDay, status: "active", yesPool: 8000, noPool: 62000, winningOutcome: null as null, createdAt: now - 3 * oneDay },
  { question: "Will the national cricket team win the upcoming test series?", category: "national", lockTimestamp: now + 10 * oneDay, status: "active", yesPool: 71000, noPool: 22000, winningOutcome: null as null, createdAt: now - oneDay },
  { question: "Will the canteen introduce a new menu before exams?", category: "college", lockTimestamp: now + oneDay, status: "active", yesPool: 5500, noPool: 4200, winningOutcome: null as null, createdAt: now - 4 * oneDay },
  { question: "Will YouTube Shorts surpass TikTok in monthly active users by year end?", category: "social", lockTimestamp: now + 20 * oneDay, status: "active", yesPool: 31000, noPool: 48000, winningOutcome: null as null, createdAt: now - 2 * oneDay },
  { question: "Will class 12 final exams be postponed this year?", category: "college", lockTimestamp: now + 30 * oneDay, status: "active", yesPool: 22000, noPool: 58000, winningOutcome: null as null, createdAt: now - 5 * oneDay },
  { question: "Will India qualify for the FIFA World Cup 2026?", category: "sports", lockTimestamp: now - oneDay, status: "locked", yesPool: 12000, noPool: 88000, winningOutcome: null as null, createdAt: now - 10 * oneDay },
  { question: "Did our school top the district in board exams?", category: "college", lockTimestamp: now - 2 * oneDay, status: "resolved", yesPool: 45000, noPool: 15000, winningOutcome: "YES", createdAt: now - 15 * oneDay },
];

async function main(): Promise<void> {
  // Check existing
  const checkRes = await fetch(`${BASE_URL}/markets?pageSize=1`);
  if (checkRes.ok) {
    const checkData = await checkRes.json() as { documents?: unknown[] };
    if (checkData.documents && checkData.documents.length > 0) {
      console.log("Markets already exist, skipping seed.");
      process.exit(0);
    }
  }

  for (const m of markets) {
    const body = toFirestore(m as unknown as Record<string, unknown>);
    const res = await fetch(`${BASE_URL}/markets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json() as { name: string };
      const id = data.name.split("/").pop();
      console.log(`Created: ${id} — ${m.question.slice(0, 55)}`);
    } else {
      const err = await res.text();
      console.error(`Failed: ${res.status} ${err.slice(0, 200)}`);
    }
  }
}

main().catch((err: unknown) => { console.error(err); process.exit(1); });
