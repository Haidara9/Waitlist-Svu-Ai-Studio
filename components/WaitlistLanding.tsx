"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { WaitlistService } from '../services/waitlist';

const INTEREST_OPTIONS = [
  'تلخيص المحاضرات والملفات',
  'الاختبارات والكويزات الذكية',
  'البطاقات التعليمية (Flashcards)',
  'استوديو الفيديو والإعلانات',
  'المساعد الدراسي العام',
  'شيء آخر',
];

const TRUST_CHIPS = [
  'مجاني للطلاب',
  'بدون بطاقة ائتمان',
  'بريدك بأمان',
];

type Status = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error';
type ErrorField = 'name' | 'email' | null;

export const WaitlistLanding: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState(INTEREST_OPTIONS[0]);
  const [status, setStatus] = useState<Status>('idle');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<ErrorField>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setErrorField(null);
    setErrorMessage(null);
    setStatus('submitting');

    const result = await WaitlistService.join({ name, email, interest });

    if (result.status === 'success') {
      setStatus('success');
    } else if (result.status === 'duplicate') {
      setStatus('duplicate');
    } else if (result.status === 'invalid') {
      setStatus('idle');
      setErrorField(result.field);
      setFieldError(
        result.field === 'email'
          ? 'يرجى إدخال بريد إلكتروني صحيح.'
          : 'يرجى إدخال اسمك.'
      );
    } else {
      setStatus('error');
      setErrorMessage('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setInterest(INTEREST_OPTIONS[0]);
    setFieldError(null);
    setErrorField(null);
    setErrorMessage(null);
    setStatus('idle');
  };

  const showForm = status !== 'success' && status !== 'duplicate';

  const fieldBase =
    'w-full rounded-xl border bg-black/40 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:ring-2';
  const fieldOk =
    'border-white/10 focus:border-blue-500 focus:ring-blue-500/40';
  const fieldBad =
    'border-red-500/70 focus:border-red-500 focus:ring-red-500/40';

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-theme-bg text-theme-text font-cairo">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-40" />
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl animate-float-slow" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-12">
        {/* Brand */}
        <div className="animate-fade-up mb-6 flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-red-500" />
            <span className="animate-gradient bg-gradient-to-l from-red-500 via-white to-red-400 bg-clip-text text-lg font-extrabold uppercase tracking-[0.2em] text-transparent font-orbitron">
              From Focus Media Team
            </span>
          </div>
          <span className="animate-gradient bg-gradient-to-l from-blue-400 via-purple-400 to-red-500 bg-clip-text text-xs font-bold uppercase tracking-[0.3em] text-transparent font-orbitron">
            By HYDRA
          </span>
        </div>

        <span className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-300" style={{ animationDelay: '60ms' }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          قريباً — قائمة الانتظار مفتوحة الآن
        </span>

        <h1 className="animate-fade-up text-center text-4xl font-extrabold leading-tight sm:text-5xl" style={{ animationDelay: '120ms' }}>
          انضم إلى قائمة انتظار
          <span className="mt-1 block animate-gradient bg-gradient-to-l from-blue-400 via-purple-500 to-red-500 bg-clip-text pb-1 tracking-tight text-transparent drop-shadow-[0_2px_24px_rgba(147,51,234,0.35)]">
            SVU AI Studio
          </span>
        </h1>

        <p className="animate-fade-up mt-4 max-w-xl text-center text-base leading-relaxed text-white/70 sm:text-lg" style={{ animationDelay: '180ms' }}>
          رفيقك الأكاديمي المدعوم بالذكاء الاصطناعي من Hydra. سجّل بريدك لتكون من
          أوائل من يجرّب المنصّة عند الإطلاق، ولنسمع رأيك بالميزات التي تهمّك.
        </p>

        {/* Trust chips */}
        <ul className="animate-fade-up mt-5 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: '220ms' }}>
          {TRUST_CHIPS.map((chip) => (
            <li
              key={chip}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
            >
              <ShieldCheckIcon className="h-3.5 w-3.5 text-blue-400" />
              {chip}
            </li>
          ))}
        </ul>

        {/* Card */}
        <div className="animate-fade-up glass-panel mt-10 w-full max-w-lg rounded-2xl p-6 ring-1 ring-white/5 sm:p-8" style={{ animationDelay: '280ms' }}>
          {showForm && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5 text-right">
                <label htmlFor="wl-name" className="text-sm font-semibold text-white/80">
                  الاسم
                </label>
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="wl-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسمك الكامل"
                    required
                    maxLength={100}
                    autoComplete="name"
                    aria-invalid={errorField === 'name'}
                    aria-describedby={fieldError ? 'wl-error' : undefined}
                    className={`${fieldBase} pr-11 ${errorField === 'name' ? fieldBad : fieldOk}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-right">
                <label htmlFor="wl-email" className="text-sm font-semibold text-white/80">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <EnvelopeIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    id="wl-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    dir="ltr"
                    maxLength={254}
                    autoComplete="email"
                    inputMode="email"
                    aria-invalid={errorField === 'email'}
                    aria-describedby={fieldError ? 'wl-error' : undefined}
                    className={`${fieldBase} pr-11 text-left ${errorField === 'email' ? fieldBad : fieldOk}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-right">
                <label htmlFor="wl-interest" className="text-sm font-semibold text-white/80">
                  ما أكثر ميزة تهمّك؟
                </label>
                <select
                  id="wl-interest"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className={`${fieldBase} ${fieldOk}`}
                >
                  {INTEREST_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-zinc-900">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div aria-live="assertive" id="wl-error">
                {fieldError && (
                  <p className="flex items-center gap-2 text-sm text-red-400" role="alert">
                    <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                    {fieldError}
                  </p>
                )}
                {status === 'error' && errorMessage && (
                  <p className="flex items-center gap-2 text-sm text-red-400" role="alert">
                    <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-600 to-blue-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {status === 'submitting' ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    جاري التسجيل…
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="h-5 w-5" />
                    انضم لقائمة الانتظار
                  </>
                )}
              </button>

              <p className="text-center text-xs text-white/40">
                لن نشارك بريدك مع أي طرف ثالث. سنراسلك فقط عند الإطلاق.
              </p>
            </form>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
              <CheckCircleIcon className="h-16 w-16 text-blue-400" />
              <h2 className="text-2xl font-bold">تم تسجيلك بنجاح!</h2>
              <p className="max-w-sm text-white/70">
                شكراً لانضمامك لقائمة انتظار SVU AI Studio. رح نراسلك على بريدك
                فور إطلاق المنصّة.
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                تسجيل بريد آخر
              </button>
            </div>
          )}

          {status === 'duplicate' && (
            <div className="flex flex-col items-center gap-3 py-6 text-center" role="status">
              <CheckCircleIcon className="h-16 w-16 text-purple-400" />
              <h2 className="text-2xl font-bold">أنت مسجّل بالفعل!</h2>
              <p className="max-w-sm text-white/70">
                هذا البريد موجود مسبقاً في قائمة الانتظار. رح نخبرك عند الإطلاق —
                ما في داعي تسجّل مرة تانية.
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                تسجيل بريد آخر
              </button>
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Hydra · SVU AI Studio. جميع الحقوق محفوظة.
        </footer>
      </div>
    </main>
  );
};
