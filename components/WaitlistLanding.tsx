"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  SparklesIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BookOpenIcon,
  CpuChipIcon,
  BoltIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  KeyIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import {
  registerToWaitlist,
  getWaitlistCount,
  FOUNDING_LIMIT,
  CODE_MAX_USES,
} from "../services/inviteCode";

// ──────────────────────────────────────────────
//  Animated particle canvas
// ──────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0,
      h = 0,
      raf = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; red: boolean };
    let pts: P[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const n = w < 768 ? 38 : 75;
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        r: Math.random() * 1.6 + 0.4,
        red: Math.random() < 0.13,
      }));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.red ? "rgba(239,68,68,0.55)" : "rgba(59,130,246,0.5)";
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const dx = p.x - pts[j].x,
            dy = p.y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 145) {
            const a = 0.16 * (1 - d / 145);
            ctx.beginPath();
            ctx.strokeStyle =
              p.red || pts[j].red
                ? `rgba(239,68,68,${a})`
                : `rgba(59,130,246,${a * 1.5})`;
            ctx.lineWidth = 0.55;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    resize();
    tick();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0" />;
}

// ──────────────────────────────────────────────
//  Feature pill
// ──────────────────────────────────────────────
function FeaturePill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group cursor-default"
      style={{
        background: "rgba(29,78,216,0.1)",
        border: "1px solid rgba(59,130,246,0.2)",
      }}
    >
      <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      <span className="text-[11px] font-semibold text-slate-300 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Copy button
// ──────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95"
      style={{
        background: copied ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
        border: copied ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(59,130,246,0.35)",
        color: copied ? "#4ade80" : "#93c5fd",
      }}
    >
      {copied ? (
        <>
          <CheckIcon className="w-3.5 h-3.5" />
          تم النسخ
        </>
      ) : (
        <>
          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
          نسخ
        </>
      )}
    </button>
  );
}

// ──────────────────────────────────────────────
//  Input field
// ──────────────────────────────────────────────
function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  error,
  icon: Icon,
  maxLength,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  dir?: "rtl" | "ltr";
  error?: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  maxLength?: number;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? "rgba(239,68,68,0.6)"
    : focused
    ? "rgba(59,130,246,0.55)"
    : "rgba(59,130,246,0.18)";

  const bg = error
    ? "rgba(239,68,68,0.05)"
    : "rgba(15,31,63,0.6)";

  return (
    <div className={className}>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{
              [dir === "rtl" ? "right" : "left"]: "1rem",
              color: error ? "#f87171" : "#60a5fa",
            }}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          dir={dir}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-3.5 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all"
          style={{
            background: bg,
            border: `1px solid ${borderColor}`,
            paddingRight: Icon && dir === "rtl" ? "2.75rem" : "1.25rem",
            paddingLeft: Icon && dir === "ltr" ? "2.75rem" : "1.25rem",
            boxShadow: focused ? `0 0 0 3px rgba(59,130,246,0.08)` : "none",
          }}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-red-400 font-semibold">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
//  Main component
// ──────────────────────────────────────────────
export const WaitlistLanding: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myCode, setMyCode] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    code?: string;
  }>({});
  const [count, setCount] = useState<number | null>(null);

  const isFounding = count !== null && count < FOUNDING_LIMIT;
  const foundingLeft = count !== null ? Math.max(0, FOUNDING_LIMIT - count) : FOUNDING_LIMIT;

  useEffect(() => {
    getWaitlistCount()
      .then(setCount)
      .catch(() => {});
  }, []);

  const clearFieldError = (field: "name" | "email" | "code") =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = "الاسم الكامل مطلوب";
    else if (name.trim().length > 100) errs.name = "الاسم طويل جداً (حد 100 حرف)";

    if (!email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "صيغة البريد غير صحيحة";

    if (!isFounding && !inviteCode.trim()) errs.code = "كود الدعوة مطلوب";
    else if (!isFounding && inviteCode.trim().length !== 5)
      errs.code = "الكود يجب أن يكون 5 خانات";

    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const result = await registerToWaitlist(
        email.trim(),
        name.trim(),
        isFounding ? undefined : inviteCode.trim()
      );

      switch (result.status) {
        case "success":
          setMyCode(result.myCode);
          setSubmitted(true);
          setCount((c) => (c ?? 0) + 1);
          break;
        case "duplicate":
          setGlobalError("هذا البريد الإلكتروني مسجّل مسبقاً في قائمة الانتظار");
          break;
        case "invalid_code":
          setFieldErrors((p) => ({ ...p, code: result.reason }));
          break;
        case "code_required":
          setFieldErrors((p) => ({ ...p, code: "كود الدعوة مطلوب للتسجيل" }));
          break;
        default:
          setGlobalError("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setGlobalError("حدث خطأ غير متوقع. يرجى المحاولة مجدداً.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#050A14", color: "#f8fafc" }}
      dir="rtl"
    >
      {/* ── Ambient blobs ── */}
      <div
        className="fixed pointer-events-none animate-float"
        style={{
          bottom: "-12%",
          left: "-6%",
          width: "60vw",
          height: "60vw",
          maxWidth: 720,
          maxHeight: 720,
          background:
            "radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none animate-float-slow"
        style={{
          top: "-10%",
          right: "-8%",
          width: "48vw",
          height: "48vw",
          maxWidth: 620,
          maxHeight: 620,
          background:
            "radial-gradient(circle, rgba(220,38,38,0.13) 0%, transparent 70%)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      <ParticleCanvas />

      {/* ── Page content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="w-full max-w-lg mx-auto flex flex-col gap-7 animate-fade-up">

          {/* Brand badge */}
          <div className="flex justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(29,78,216,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                backdropFilter: "blur(12px)",
              }}
            >
              <SparklesIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold tracking-widest text-blue-300 uppercase">
                By Focus Media Team
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center space-y-2">
            <h1
              className="font-black tracking-tight leading-none select-none animate-gradient bg-clip-text"
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "clamp(2.4rem, 8.5vw, 4.8rem)",
                backgroundImage:
                  "linear-gradient(130deg, #93c5fd 0%, #3b82f6 30%, #ef4444 68%, #dc2626 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
              }}
            >
              SVU AI STUDIO
            </h1>
            <p
              className="text-lg font-bold text-slate-300"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              المرافق الأكاديمي الذكي
            </p>
            <p className="text-xs text-slate-500 tracking-wide">
              Academic Zameel · From Hedra
            </p>
          </div>

          {/* Founding / invite-only badge */}
          {count !== null && (
            <div className="flex justify-center">
              {isFounding ? (
                <div
                  className="flex items-center gap-2 px-5 py-2 rounded-full"
                  style={{
                    background: "rgba(29,78,216,0.12)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    boxShadow: "0 0 24px rgba(59,130,246,0.1)",
                  }}
                >
                  <UserGroupIcon className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-bold text-blue-300">
                    {foundingLeft} مقعد تأسيسي متبقٍّ من {FOUNDING_LIMIT}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 px-5 py-2 rounded-full"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <KeyIcon className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-xs font-bold text-red-300">
                    التسجيل بكود دعوة فقط
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <FeaturePill icon={BookOpenIcon} label="ملخصات ذكية" />
            <FeaturePill icon={CpuChipIcon} label="اختبارات تفاعلية" />
            <FeaturePill icon={BoltIcon} label="بطاقات تذكير" />
            <FeaturePill icon={RocketLaunchIcon} label="استوديو فيديو" />
          </div>

          {/* ── Registration card ── */}
          <div
            className="rounded-3xl p-7 sm:p-9"
            style={{
              background: "rgba(8,18,40,0.78)",
              border: "1px solid rgba(59,130,246,0.18)",
              boxShadow:
                "0 0 80px rgba(29,78,216,0.1), 0 32px 64px rgba(0,0,0,0.55)",
              backdropFilter: "blur(24px)",
            }}
          >
            {!submitted ? (
              <>
                {/* Card header */}
                <div className="text-center mb-7">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      width: 52,
                      height: 52,
                      background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                      boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
                    }}
                  >
                    <EnvelopeIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2
                    className="text-lg font-black text-white mb-1"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    انضم إلى قائمة الانتظار
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isFounding
                      ? `أنت من الفريق التأسيسي — لا تحتاج كود دعوة`
                      : `أدخل كود الدعوة · كل كود يستوعب ${CODE_MAX_USES} تسجيلات`}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                  {/* Invite code — only when not founding */}
                  {!isFounding && (
                    <InputField
                      value={inviteCode}
                      onChange={(v) => {
                        setInviteCode(v.toUpperCase());
                        clearFieldError("code");
                      }}
                      placeholder="كود الدعوة (5 خانات)"
                      dir="ltr"
                      maxLength={5}
                      icon={KeyIcon}
                      error={fieldErrors.code}
                    />
                  )}

                  <InputField
                    value={name}
                    onChange={(v) => { setName(v); clearFieldError("name"); }}
                    placeholder="الاسم الكامل"
                    maxLength={100}
                    error={fieldErrors.name}
                  />

                  <InputField
                    value={email}
                    onChange={(v) => { setEmail(v); clearFieldError("email"); }}
                    placeholder="البريد الإلكتروني"
                    type="email"
                    dir="ltr"
                    icon={EnvelopeIcon}
                    error={fieldErrors.email}
                  />

                  {globalError && (
                    <div
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-400 font-semibold"
                      style={{
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.18)",
                      }}
                    >
                      <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                      {globalError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl font-black text-white text-sm tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                    style={{
                      background: submitting
                        ? "rgba(29,78,216,0.5)"
                        : "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
                      boxShadow: submitting
                        ? "none"
                        : "0 8px 28px rgba(59,130,246,0.38)",
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting)
                        e.currentTarget.style.boxShadow =
                          "0 8px 28px rgba(239,68,68,0.32)";
                    }}
                    onMouseLeave={(e) => {
                      if (!submitting)
                        e.currentTarget.style.boxShadow =
                          "0 8px 28px rgba(59,130,246,0.38)";
                    }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        جارٍ التسجيل…
                      </span>
                    ) : (
                      "سجّل في قائمة الانتظار ←"
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* ── Success state ── */
              <div className="text-center space-y-6 animate-fade-up">
                {/* Check icon */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                    boxShadow: "0 8px 32px rgba(59,130,246,0.45)",
                  }}
                >
                  <CheckCircleIcon className="w-9 h-9 text-white" />
                </div>

                <div>
                  <h2
                    className="text-xl font-black text-white mb-1"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    تم تسجيلك بنجاح! 🎉
                  </h2>
                  <p className="text-sm text-slate-400">
                    سنُبلّغك فور إطلاق النسخة التجريبية
                  </p>
                </div>

                {/* Personal invite code */}
                <div
                  className="rounded-2xl p-5 space-y-3"
                  style={{
                    background: "rgba(15,35,80,0.6)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    boxShadow: "0 0 40px rgba(29,78,216,0.12)",
                  }}
                >
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    كودك الشخصي للمشاركة
                  </p>

                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <span
                      className="text-3xl font-black tracking-[0.28em] text-white"
                      style={{ fontFamily: "Orbitron, monospace" }}
                    >
                      {myCode}
                    </span>
                    <CopyButton text={myCode} />
                  </div>

                  <div
                    className="text-xs text-slate-400 px-4 py-2.5 rounded-xl leading-relaxed"
                    style={{
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    🔗 شارك هذا الكود — يُتيح لـ{" "}
                    <span className="text-blue-300 font-bold">{CODE_MAX_USES}</span>{" "}
                    أصدقاء التسجيل، وكل منهم سيحصل على كوده الخاص
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-700 tracking-wide">
            SVU AI Studio · Focus Media Team · Academic Zameel · Powered by HYDRA
          </p>
        </div>
      </div>
    </div>
  );
};


