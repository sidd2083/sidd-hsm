import admin from "firebase-admin";
import { logger } from "./logger";

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return;

  const projectId = process.env["VITE_FIREBASE_PROJECT_ID"];
  if (!projectId) {
    throw new Error("VITE_FIREBASE_PROJECT_ID is required");
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
    logger.info({ projectId }, "Firebase Admin initialized");
  }

  initialized = true;
}

export { admin };
