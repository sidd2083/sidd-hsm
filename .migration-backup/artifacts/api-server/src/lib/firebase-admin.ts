import admin from "firebase-admin";
import { logger } from "./logger";

let initialized = false;
let firebaseReady = false;

export function initFirebaseAdmin() {
  if (initialized) return;
  initialized = true;

  const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT"];
  if (!serviceAccountJson) {
    logger.warn(
      "FIREBASE_SERVICE_ACCOUNT env var is not set. " +
      "API will start but all authenticated routes will return 503. " +
      "Add the Firebase service account JSON to fix this."
    );
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      logger.info({ projectId: serviceAccount.projectId }, "Firebase Admin initialized");
    }
    firebaseReady = true;
  } catch (err) {
    logger.error({ err }, "Failed to parse FIREBASE_SERVICE_ACCOUNT. Check the JSON format.");
  }
}

export function isFirebaseReady(): boolean {
  return firebaseReady;
}

export { admin };
