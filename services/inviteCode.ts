"use client";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export const INVITE_CODES_COLLECTION = "inviteCodes";
export const FOUNDING_LIMIT = 20;
export const CODE_MAX_USES = 5;

// Avoid 0/O and 1/I confusion in codes
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  let c = "";
  for (let i = 0; i < 5; i++) {
    c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return c;
}

export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const snap = await getDoc(doc(db, INVITE_CODES_COLLECTION, code));
    if (!snap.exists()) return code;
  }
  // Fallback: append a timestamp suffix
  return randomCode() + Date.now().toString(36).slice(-1).toUpperCase();
}

export async function getWaitlistCount(): Promise<number> {
  const snap = await getDocs(collection(db, "waitlist"));
  return snap.size;
}

export interface InviteCodeData {
  code: string;
  ownerEmail: string;
  usesRemaining: number;
  usedBy: string[];
  createdAt: unknown;
}

export type RegisterResult =
  | { status: "success"; myCode: string }
  | { status: "duplicate" }
  | { status: "invalid_code"; reason: string }
  | { status: "code_required" }
  | { status: "error"; message: string };

export async function registerToWaitlist(
  email: string,
  name: string,
  inviteCode?: string
): Promise<RegisterResult> {
  let count: number;
  try {
    count = await getWaitlistCount();
  } catch {
    return { status: "error", message: "فشل الاتصال بالخادم" };
  }

  const isFounding = count < FOUNDING_LIMIT;
  const normalizedCode = inviteCode?.trim().toUpperCase();

  if (!isFounding && !normalizedCode) {
    return { status: "code_required" };
  }

  const emailKey = email.trim().toLowerCase();

  let myCode: string;
  try {
    myCode = await generateUniqueCode();
  } catch {
    return { status: "error", message: "فشل توليد كود الدعوة" };
  }

  type TxError = Error & { _type?: string; _reason?: string };

  try {
    await runTransaction(db, async (tx) => {
      // ── 1. Duplicate check ──
      const waitlistRef = doc(db, "waitlist", emailKey);
      const existing = await tx.get(waitlistRef);
      if (existing.exists()) {
        const err: TxError = new Error("duplicate");
        err._type = "duplicate";
        throw err;
      }

      // ── 2. Invite code validation + decrement (atomic) ──
      if (!isFounding && normalizedCode) {
        const codeRef = doc(db, INVITE_CODES_COLLECTION, normalizedCode);
        const codeSnap = await tx.get(codeRef);
        if (!codeSnap.exists()) {
          const err: TxError = new Error("invalid_code");
          err._type = "invalid_code";
          err._reason = "الكود غير موجود";
          throw err;
        }
        const codeData = codeSnap.data() as InviteCodeData;
        if (codeData.usesRemaining <= 0) {
          const err: TxError = new Error("invalid_code");
          err._type = "invalid_code";
          err._reason = "هذا الكود استُنفد بالكامل";
          throw err;
        }
        tx.update(codeRef, {
          usesRemaining: codeData.usesRemaining - 1,
          usedBy: [...(codeData.usedBy ?? []), emailKey],
        });
      }

      // ── 3. Create waitlist entry ──
      const payload: Record<string, unknown> = {
        email: emailKey,
        name: name.trim(),
        createdAt: serverTimestamp(),
        source: "waitlist-invite",
        locale: "ar",
        isFounding,
        myInviteCode: myCode,
      };
      if (!isFounding && normalizedCode) {
        payload.usedInviteCode = normalizedCode;
      }
      tx.set(waitlistRef, payload);

      // ── 4. Create registrant's own invite code ──
      const myCodeRef = doc(db, INVITE_CODES_COLLECTION, myCode);
      tx.set(myCodeRef, {
        code: myCode,
        ownerEmail: emailKey,
        usesRemaining: CODE_MAX_USES,
        usedBy: [],
        createdAt: serverTimestamp(),
      } satisfies Omit<InviteCodeData, "createdAt"> & { createdAt: unknown });
    });

    return { status: "success", myCode };
  } catch (e: unknown) {
    const err = e as TxError;
    if (err._type === "duplicate") return { status: "duplicate" };
    if (err._type === "invalid_code") {
      return { status: "invalid_code", reason: err._reason ?? "كود غير صالح" };
    }
    const msg = err instanceof Error ? err.message : String(e);
    // Firebase permission-denied on waitlist = duplicate (same email = same doc id)
    if (msg.includes("permission-denied")) return { status: "duplicate" };
    return { status: "error", message: msg };
  }
}
