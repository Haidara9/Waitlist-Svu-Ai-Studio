"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  SparklesIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CpuChipIcon,
  BoltIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  DocumentTextIcon,
  LightBulbIcon,
  BookOpenIcon,
  ArrowRightIcon,
  UserIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { VaporText } from "./VaporText";
import { registerToWaitlist, getWaitlistCount } from "../services/waitlist";

// ──────────────────────────────────────────────
//  Subtle particle canvas (fewer, slower)
// ──────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    type P = { x: number; y: number; vx: number; vy: number; r: number; blue: boolean };
    let pts: P[] = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const n = w < 768 ? 22 : 45;
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.2 + 0.3,
        blue: Math.random() > 0.15,
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
        ctx.fillStyle = p.blue ? "rgba(37,99,235,0.35)" : "rgba(220,38,38,0.25)";
        ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
          const dx = p.x - pts[j].x, dy = p.y - pts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(37,99,235,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.4;
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
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-0 opacity-60" />;
}

// ──────────────────────────────────────────────
//  Feature card
// ──────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: "blue" | "red" | "orange";
}) {
  const colors = {
    blue: { bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.18)", text: "#60a5fa", glow: "rgba(37,99,235,0.15)" },
    red: { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.18)", text: "#f87171", glow: "rgba(220,38,38,0.15)" },
    orange: { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.18)", text: "#fb923c", glow: "rgba(249,115,22,0.15)" },
  };
  const c = colors[accent];

  return (
    <div
      className="glass-card rounded-2xl p-6 flex flex-col gap-4 group"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.glow}` }}
      >
        <span style={{ color: c.text }}><Icon className="w-6 h-6" /></span>
      </div>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
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
  dir = "ltr",
  error,
  icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  dir?: "rtl" | "ltr";
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <div className="relative">
        {Icon && (
          <span className="absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" style={{ left: "1rem" }}>
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={dir}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-3.5 px-4 rounded-xl text-white placeholder-slate-500 text-sm font-medium outline-none transition-all duration-200"
          style={{
            background: "rgba(15,23,42,0.8)",
            border: `1px solid ${error ? "rgba(220,38,38,0.5)" : focused ? "rgba(37,99,235,0.5)" : "rgba(37,99,235,0.12)"}`,
            paddingLeft: Icon ? "2.75rem" : "1rem",
            boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
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

// ══════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════
export function WaitlistLanding() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string }>({});
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getWaitlistCount().then(setCount).catch(() => {});
  }, []);

  const validate = () => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = "Full Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Invalid email format";
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
        university.trim() || undefined,
        major.trim() || undefined
      );

      if (result.status === "success") {
        setSubmitted(true);
        setCount((c) => (c ?? 0) + 1);
        // Send confirmation email (fire-and-forget)
        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), name: name.trim() }),
        }).catch(() => {});
      } else if (result.status === "duplicate") {
        setGlobalError("This email is already registered.");
      } else {
        setGlobalError(result.message || "Something went wrong. Please try again.");
      }
    } catch {
      setGlobalError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: "#020617", color: "#ffffff" }}>
      <ParticleCanvas />

      {/* Ambient glow blobs */}
      <div className="fixed pointer-events-none animate-float" style={{ top: "-20%", left: "-10%", width: "50vw", height: "50vw", maxWidth: 700, background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
      <div className="fixed pointer-events-none animate-float-slow" style={{ bottom: "-15%", right: "-8%", width: "45vw", height: "45vw", maxWidth: 600, background: "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />

      {/* ══════════════════════════════════════════════════ */}
      {/* NAVBAR */}
      {/* ══════════════════════════════════════════════════ */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b" style={{ borderColor: "rgba(37,99,235,0.08)", background: "rgba(2,6,23,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
            Svu Ai Studio
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#94a3b8" }}>Team</span>
          <span className="text-xs font-black tracking-wide" style={{ backgroundImage: "linear-gradient(110deg, #ffffff, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>From FTM</span>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Text */}
          <div className="space-y-8 animate-fade-up">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                <span className="text-white">The Future of</span>
                <br />
                <span className="inline-block" style={{ backgroundImage: "linear-gradient(135deg, #2563EB 0%, #DC2626 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  <VaporText
                    texts={["AI Education", "Study Smarter", "SVU AI Studio"]}
                    interval={4000}
                  />
                </span>
                <br />
                <span className="text-white">Starts Here</span>
              </h1>
              <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-lg">
                Join Svu Ai Studio — the all-in-one platform built for students, creators, and innovators. Learn, build, and grow with the power of AI.
              </p>
            </div>

            {/* Mini feature badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: AcademicCapIcon, label: "For Students" },
                { icon: LightBulbIcon, label: "For Innovators" },
                { icon: CpuChipIcon, label: "AI Powered" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
                  <item.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Counter */}
            {count !== null && count > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-[#020617] flex items-center justify-center text-[9px] font-bold text-white" style={{ background: `linear-gradient(135deg, ${["#2563EB", "#7c3aed", "#DC2626"][i]}, ${["#1d4ed8", "#6d28d9", "#b91c1c"][i]})` }}>
                      {["S", "A", "M"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-400">
                  <span className="text-white font-bold">{count}+</span> students already joined
                </span>
              </div>
            )}
          </div>

          {/* Right — Registration Form */}
          <div className="animate-fade-up delay-200">
            <div className="rounded-3xl p-8 md:p-10" style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(37,99,235,0.12)", boxShadow: "0 0 80px rgba(37,99,235,0.06), 0 32px 64px rgba(0,0,0,0.4)", backdropFilter: "blur(24px)" }}>
              {!submitted ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", boxShadow: "0 8px 24px rgba(37,99,235,0.35)" }}>
                      <UserGroupIcon className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-white mb-1">Join Svu Ai Studio</h2>
                    <p className="text-sm text-slate-400">Create your account to be part of the future of AI learning and innovation.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <InputField
                      value={name}
                      onChange={(v) => { setName(v); setFieldErrors((p) => ({ ...p, name: undefined })); }}
                      placeholder="Full Name"
                      icon={UserIcon}
                      error={fieldErrors.name}
                    />
                    <InputField
                      value={email}
                      onChange={(v) => { setEmail(v); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                      placeholder="Email Address"
                      type="email"
                      icon={EnvelopeIcon}
                      error={fieldErrors.email}
                    />
                    <InputField
                      value={university}
                      onChange={setUniversity}
                      placeholder="Student / School (Optional)"
                      icon={BuildingLibraryIcon}
                    />
                    <InputField
                      value={major}
                      onChange={setMajor}
                      placeholder="Study Major"
                      icon={AcademicCapIcon}
                    />

                    {globalError && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs text-red-400 font-semibold" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)" }}>
                        <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                        {globalError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 rounded-xl font-bold text-white text-sm tracking-wide transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background: submitting ? "rgba(37,99,235,0.4)" : "linear-gradient(135deg, #2563EB 0%, #1d4ed8 50%, #DC2626 200%)", boxShadow: submitting ? "none" : "0 8px 28px rgba(37,99,235,0.35)" }}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-6 animate-fade-up py-6">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", boxShadow: "0 8px 32px rgba(37,99,235,0.4)" }}>
                    <CheckCircleIcon className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white mb-2">You&apos;re In! 🎉</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">Your registration was successful. We&apos;ll send you the early access link very soon.</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
                    <p className="text-xs text-blue-300">A confirmation email has been sent to your inbox.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* CTA BANNER */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(37,99,235,0.12)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
                <RocketLaunchIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Be one of the first to experience Svu Ai Studio.</p>
                <p className="text-xs text-slate-400">Sign up now and get early access to exclusive features and learning tools.</p>
              </div>
            </div>
            <a href="#hero" className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105" style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
              Join the Waitlist
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* FEATURES SECTION */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Why Join{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg, #2563EB, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Svu Ai Studio
              </span>
              ?
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">Everything you need to study smarter, powered by cutting-edge AI technology.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={CpuChipIcon}
              title="AI Exam Generator"
              description="Generate practice exams from your study materials using AI. Get custom questions tailored to your curriculum."
              accent="blue"
            />
            <FeatureCard
              icon={BookOpenIcon}
              title="Smart Study Planner"
              description="AI-powered scheduling that adapts to your progress, deadlines, and learning pace."
              accent="blue"
            />
            <FeatureCard
              icon={BoltIcon}
              title="Flashcards Generator"
              description="Automatically create smart flashcards from PDFs, lectures, and notes with spaced repetition."
              accent="orange"
            />
            <FeatureCard
              icon={SparklesIcon}
              title="Golden Sheets Mode"
              description="Distill entire courses into concise golden sheets — the ultimate review material before exams."
              accent="red"
            />
            <FeatureCard
              icon={DocumentTextIcon}
              title="PDF Analysis"
              description="Upload any PDF and get instant summaries, key points, and generated questions from the content."
              accent="blue"
            />
            <FeatureCard
              icon={LightBulbIcon}
              title="AI Study Assistant"
              description="Your personal AI tutor that answers questions, explains concepts, and guides your learning journey."
              accent="orange"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* ABOUT SECTION */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            About{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #2563EB, #DC2626)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SVU AI Studio</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            SVU AI Studio is an AI-powered educational platform built specifically for Syrian Virtual University students to improve studying, organization, productivity, and exam preparation. Our mission is to make education smarter, more accessible, and more effective through cutting-edge artificial intelligence.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            {[
              { value: "500+", label: "Early Access" },
              { value: "6", label: "AI Tools" },
              { value: "24/7", label: "AI Assistant" },
              { value: "100%", label: "Free Beta" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4" style={{ background: "rgba(15,23,42,0.5)", border: "1px solid rgba(37,99,235,0.1)" }}>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* FINAL CTA */}
      {/* ══════════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            <VaporText
              texts={["Ready to Study Smarter?", "Join the AI Revolution", "Your Future Starts Now"]}
              className="text-white"
              interval={4500}
            />
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Don&apos;t miss your chance to be among the first students to experience AI-powered learning. Sign up today.
          </p>
          <a
            href="#hero"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all duration-300 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", boxShadow: "0 8px 32px rgba(37,99,235,0.35)" }}
          >
            Join the Waitlist Now
            <ArrowRightIcon className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ══════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t px-6 md:px-12 py-10" style={{ borderColor: "rgba(37,99,235,0.08)", background: "rgba(2,6,23,0.9)" }}>
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)" }}>
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>Svu Ai Studio</span>
          </div>
          <p className="text-xs text-slate-500">Built with passion. Designed for the future.</p>
          {/* By HYDRA — footer only */}
          <p
            className="text-sm font-black tracking-[0.3em] uppercase"
            style={{
              backgroundImage: "linear-gradient(110deg, #60a5fa 0%, #2563EB 35%, #7c3aed 55%, #DC2626 80%, #f87171 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            BY HYDRA
          </p>
          <p className="text-[10px] text-slate-700 mt-2">&copy; {new Date().getFullYear()} SVU AI Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
