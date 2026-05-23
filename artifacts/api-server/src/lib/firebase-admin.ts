import admin from "firebase-admin";
import { logger } from "./logger";

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return;

  const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT"];
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env var is required");
  }

  const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info({ projectId: serviceAccount.projectId }, "Firebase Admin initialized");
  }

  initialized = true;
}

export { admin };
