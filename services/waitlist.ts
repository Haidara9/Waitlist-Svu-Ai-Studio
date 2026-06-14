"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const WAITLIST_COLLECTION = 'waitlist';

export const WAITLIST_LIMITS = {
  name: 100,
  email: 254,
  interest: 500,
} as const;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface WaitlistInput {
  name: string;
  email: string;
  interest?: string;
}

export interface NormalizedWaitlistEntry {
  name: string;
  email: string;
  emailKey: string;
  interest: string;
}

export type WaitlistResult =
  | { status: 'success' }
  | { status: 'duplicate' }
  | { status: 'invalid'; field: 'name' | 'email' }
  | { status: 'error'; message: string };

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= WAITLIST_LIMITS.email;
}

/**
 * Trim/lowercase the email and validate field lengths. The lowercased email is
 * also used as the Firestore document id so a given address can only join once.
 */
export function normalizeWaitlistInput(
  input: WaitlistInput
): { ok: true; entry: NormalizedWaitlistEntry } | { ok: false; field: 'name' | 'email' } {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const interest = (input.interest ?? '').trim();

  if (!name || name.length > WAITLIST_LIMITS.name) {
    return { ok: false, field: 'name' };
  }
  if (!isValidEmail(email)) {
    return { ok: false, field: 'email' };
  }

  return {
    ok: true,
    entry: {
      name,
      email,
      emailKey: email,
      interest: interest.slice(0, WAITLIST_LIMITS.interest),
    },
  };
}

export const WaitlistService = {
  async join(input: WaitlistInput): Promise<WaitlistResult> {
    const normalized = normalizeWaitlistInput(input);
    if (normalized.ok === false) {
      return { status: 'invalid', field: normalized.field };
    }

    const { name, email, emailKey, interest } = normalized.entry;

    const payload: Record<string, unknown> = {
      email,
      name,
      createdAt: serverTimestamp(),
      source: 'waitlist-join',
      locale: 'ar',
    };
    if (interest) {
      payload.interest = interest;
    }

    try {
      // emailKey is the document id, so a second submit for the same address is
      // evaluated as an `update` by the security rules (which we disallow),
      // surfacing as permission-denied -> we treat that as "already on the list".
      await setDoc(doc(db, WAITLIST_COLLECTION, emailKey), payload);
      return { status: 'success' };
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'permission-denied') {
        return { status: 'duplicate' };
      }
      const message = error instanceof Error ? error.message : String(error);
      return { status: 'error', message };
    }
  },
};
