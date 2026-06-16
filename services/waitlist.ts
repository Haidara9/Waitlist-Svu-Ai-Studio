"use client";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const WAITLIST_COLLECTION = "waitlist";

/** Returns the total number of documents in the "waitlist" collection. */
export async function getWaitlistCount(): Promise<number> {
  const snapshot = await getDocs(collection(db, WAITLIST_COLLECTION));
  return snapshot.size;
}

export type RegisterResult =
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "error"; message: string };

/**
 * Register a new email to the waitlist.
 *
 * The document ID is the lowercased email, so each address can only appear
 * once. If the document already exists we return "duplicate" without
 * overwriting.
 */
export async function registerToWaitlist(
  email: string,
  name: string,
  university?: string,
  major?: string
): Promise<RegisterResult> {
  const emailKey = email.trim().toLowerCase();

  try {
    const ref = doc(db, WAITLIST_COLLECTION, emailKey);
    const existing = await getDoc(ref);

    if (existing.exists()) {
      return { status: "duplicate" };
    }

    const payload: Record<string, string | ReturnType<typeof serverTimestamp>> = {
      email: emailKey,
      name: name.trim(),
      createdAt: serverTimestamp(),
      source: "waitlist-v2",
      locale: "ar",
    };

    if (university) {
      payload.university = university.trim();
    }
    if (major) {
      payload.major = major.trim();
    }

    await setDoc(ref, payload);
    return { status: "success" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("permission-denied")) {
      return { status: "duplicate" };
    }

    return { status: "error", message };
  }
}
