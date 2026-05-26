import admin from "firebase-admin";
import { logger } from "./logger";

let initialized = false;

export function getFirebaseAdmin(): admin.app.App {
  if (!initialized) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id,
        });
        initialized = true;
        logger.info("Firebase Admin initialized with service account");
      } catch (err) {
        logger.error({ err }, "Failed to parse FIREBASE_SERVICE_ACCOUNT");
        initializeWithProjectId();
      }
    } else {
      initializeWithProjectId();
    }
  }
  return admin.app();
}

function initializeWithProjectId() {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID ?? "predichsm",
    });
    initialized = true;
    logger.warn("Firebase Admin initialized without credentials — Firestore writes will fail");
  } catch (err) {
    logger.error({ err }, "Failed to initialize Firebase Admin");
    throw err;
  }
}

export function getFirestore(): admin.firestore.Firestore {
  return getFirebaseAdmin().firestore();
}

export async function verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken | null> {
  try {
    return await getFirebaseAdmin().auth().verifyIdToken(token);
  } catch {
    return null;
  }
}
