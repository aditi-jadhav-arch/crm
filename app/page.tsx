"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../lib/hooks/useAuth";
import {
  Users,
  TrendingUp,
  Activity,
  BarChart2,
  UsersRound,
  Moon,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: "Contact Management",
    desc: "Centralise every lead, prospect, and customer in one searchable hub.",
  },
  {
    icon: TrendingUp,
    title: "Deal Pipeline",
    desc: "Visualise your sales funnel and move deals through custom stages.",
  },
  {
    icon: Activity,
    title: "Activity Tracking",
    desc: "Log calls, emails, and meetings so nothing ever falls through the cracks.",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reports",
    desc: "Turn raw data into actionable revenue insights with a single click.",
  },
  {
    icon: UsersRound,
    title: "Team Collaboration",
    desc: "Assign owners, share notes, and keep every teammate in the loop.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    desc: "Work comfortably day or night with a beautifully crafted dark theme.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add your contacts",
    desc: "Import or manually add leads, customers, and partners in seconds.",
  },
  {
    num: "02",
    title: "Track your deals",
    desc: "Move opportunities through your pipeline with drag-and-drop ease.",
  },
  {
    num: "03",
    title: "Close more business",
    desc: "Use insights and reminders to follow up at exactly the right moment.",
  },
];



/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax-lite: subtle blob drift on mouse move
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 20;
      hero.style.setProperty("--blob-x", `${x}px`);
      hero.style.setProperty("--blob-y", `${y}px`);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const ctaHref = !loading && user ? "/dashboard" : undefined;

  return (
    <>
      <style>{`
        /* ── Smooth scroll ── */
        html { scroll-behavior: smooth; }

        /* ── Nav ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem;
          height: 60px;
          background: color-mix(in srgb, var(--background) 80%, transparent);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
        }
        .lp-logo {
          display: flex; align-items: center; gap: 0.5rem;
          font-weight: 800; font-size: 1.05rem; color: var(--foreground);
          text-decoration: none;
        }
        .lp-logo-icon {
          height: 32px; width: 32px; border-radius: 8px;
          background: var(--primary);
          color: var(--primary-foreground);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1rem;
        }
        .lp-nav-links { display: flex; align-items: center; gap: 0.75rem; }
        .lp-btn-ghost {
          padding: 0.45rem 1rem; border-radius: var(--radius);
          font-size: 0.875rem; font-weight: 600;
          color: var(--foreground); text-decoration: none;
          transition: background 0.15s;
          background: transparent; border: none; cursor: pointer;
        }
        .lp-btn-ghost:hover { background: var(--muted); }
        .lp-btn-primary {
          padding: 0.45rem 1.1rem; border-radius: var(--radius);
          font-size: 0.875rem; font-weight: 700;
          background: var(--primary); color: var(--primary-foreground);
          text-decoration: none; transition: opacity 0.15s;
          border: none; cursor: pointer;
        }
        .lp-btn-primary:hover { opacity: 0.88; }

        /* ── Hero ── */
        .lp-hero {
          position: relative; overflow: hidden;
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 7rem 1.5rem 5rem;
          background: var(--background);
          --blob-x: 0px; --blob-y: 0px;
        }
        .lp-hero-blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.35;
          pointer-events: none;
          transition: transform 0.4s ease-out;
        }
        .lp-hero-blob-1 {
          width: 600px; height: 600px;
          background: var(--primary);
          top: -150px; right: -100px;
          transform: translate(var(--blob-x), var(--blob-y));
        }
        .lp-hero-blob-2 {
          width: 400px; height: 400px;
          background: var(--chart-2);
          bottom: -80px; left: -80px;
          transform: translate(calc(var(--blob-x) * -0.5), calc(var(--blob-y) * -0.5));
        }
        .lp-hero-content { position: relative; max-width: 760px; }
        .lp-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.85rem; border-radius: 999px;
          background: var(--muted); border: 1px solid var(--border);
          font-size: 0.78rem; font-weight: 600; color: var(--muted-foreground);
          margin-bottom: 1.5rem; letter-spacing: 0.04em;
        }
        .lp-badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--primary); display: inline-block;
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        .lp-hero h1 {
          font-size: clamp(2.25rem, 6vw, 4rem);
          font-weight: 800; line-height: 1.1;
          color: var(--foreground); margin-bottom: 1.25rem;
          letter-spacing: -0.03em;
        }
        .lp-hero h1 span { color: var(--primary); }
        .lp-hero p {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: var(--muted-foreground); max-width: 560px;
          margin: 0 auto 2.25rem; line-height: 1.6;
        }
        .lp-cta-group { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
        .lp-btn-hero-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.75rem; border-radius: var(--radius);
          font-size: 1rem; font-weight: 700;
          background: var(--primary); color: var(--primary-foreground);
          text-decoration: none; transition: opacity 0.15s, transform 0.15s;
          box-shadow: 0 4px 20px color-mix(in srgb, var(--primary) 35%, transparent);
        }
        .lp-btn-hero-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .lp-btn-hero-secondary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.75rem; border-radius: var(--radius);
          font-size: 1rem; font-weight: 700;
          background: transparent;
          border: 1.5px solid var(--border);
          color: var(--foreground); text-decoration: none;
          transition: background 0.15s, transform 0.15s;
        }
        .lp-btn-hero-secondary:hover { background: var(--muted); transform: translateY(-1px); }

        /* ── Section shared ── */
        .lp-section { padding: 5rem 1.5rem; }
        .lp-section-inner { max-width: 1100px; margin: 0 auto; }
        .lp-section-inner--centered { text-align: center; }
        .lp-section-inner--centered .lp-section-sub { margin-left: auto; margin-right: auto; }
        .lp-section-label {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--primary);
          margin-bottom: 0.6rem;
        }
        .lp-section-title {
          font-size: clamp(1.6rem, 4vw, 2.25rem);
          font-weight: 800; color: var(--foreground);
          margin-bottom: 0.75rem; letter-spacing: -0.02em;
        }
        .lp-section-sub {
          color: var(--muted-foreground); font-size: 1rem;
          max-width: 520px; line-height: 1.6;
        }

        /* ── Features ── */
        .lp-features-bg { background: var(--muted); }
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem; margin-top: 2.5rem;
        }
        .lp-feature-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: calc(var(--radius) + 4px);
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .lp-feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px color-mix(in srgb, var(--foreground) 8%, transparent);
        }
        .lp-feature-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: color-mix(in srgb, var(--primary) 12%, transparent);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
          color: var(--primary);
        }
        .lp-feature-card h3 {
          font-size: 0.975rem; font-weight: 700;
          color: var(--foreground); margin-bottom: 0.4rem;
        }
        .lp-feature-card p {
          font-size: 0.875rem; color: var(--muted-foreground); line-height: 1.55;
        }

        /* ── How it works ── */
        .lp-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem; margin-top: 2.5rem;
          position: relative;
        }
        .lp-step { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .lp-step-num {
          font-size: 3rem; font-weight: 800; line-height: 1;
          color: color-mix(in srgb, var(--primary) 22%, transparent);
          margin-bottom: 0.75rem;
          letter-spacing: -0.04em;
        }
        .lp-step-line {
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          margin-bottom: 0.6rem;
        }
        .lp-step-check { color: var(--primary); flex-shrink: 0; }
        .lp-step h3 {
          font-size: 1.05rem; font-weight: 700; color: var(--foreground);
        }
        .lp-step p {
          font-size: 0.9rem; color: var(--muted-foreground); line-height: 1.6;
        }

        /* ── Footer ── */
        .lp-footer {
          background: var(--background);
          border-top: 1px solid var(--border);
          padding: 0;
        }
        .lp-footer-main {
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 1.5rem;
          padding: 2rem 1.5rem;
        }
        .lp-footer-brand {
          display: flex; align-items: center; gap: 0.5rem;
          font-weight: 800; font-size: 1.05rem; color: var(--foreground);
          text-decoration: none;
        }
        .lp-footer-links {
          display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: center;
        }
        .lp-footer-link {
          font-size: 0.875rem; font-weight: 600;
          color: var(--muted-foreground); text-decoration: none;
          transition: color 0.15s;
        }
        .lp-footer-link:hover { color: var(--foreground); }
        .lp-footer-bottom {
          border-top: 1px solid var(--border);
        }
        .lp-footer-bottom-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 1rem 1.5rem;
          font-size: 0.78rem; color: var(--muted-foreground);
        }
        @media (max-width: 640px) {
          .lp-footer-main { justify-content: center; text-align: center; }
          .lp-footer-links { justify-content: center; }
          .lp-footer-bottom-inner { text-align: center; }
        }
      `}</style>

      {/* ── Navigation ── */}
      <nav className="lp-nav">
        <a href="/" className="lp-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" style={{borderRadius:"7px"}}>
            <rect width="32" height="32" rx="7" ry="7" fill="#c96442"/>
            <text x="16" y="23" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="20" fontWeight="800" fill="#ffffff" textAnchor="middle" letterSpacing="-0.5">E</text>
          </svg>
          Elara
        </a>
        <div className="lp-nav-links">
          <a href="#features" className="lp-btn-ghost">Features</a>
          <a href="#how-it-works" className="lp-btn-ghost">How it works</a>
          <Link href={ctaHref ?? "/login"} className="lp-btn-ghost">Sign In</Link>
          <Link href={ctaHref ?? "/register"} className="lp-btn-primary">Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero" ref={heroRef}>
        <div className="lp-hero-blob lp-hero-blob-1" aria-hidden="true" />
        <div className="lp-hero-blob lp-hero-blob-2" aria-hidden="true" />
        <div className="lp-hero-content">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Now free for all teams
          </div>
          <h1>
            The CRM built for<br /><span>modern teams</span>
          </h1>
          <p>
            Manage every contact, track every deal, and close more business,
            all from one beautifully simple workspace.
          </p>
          <div className="lp-cta-group">
            <Link
              href={ctaHref ?? "/register"}
              id="hero-cta-primary"
              className="lp-btn-hero-primary"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href={ctaHref ?? "/login"}
              id="hero-cta-secondary"
              className="lp-btn-hero-secondary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>



      {/* ── Features ── */}
      <section id="features" className="lp-section lp-features-bg">
        <div className="lp-section-inner lp-section-inner--centered">
          <p className="lp-section-label">Features</p>
          <h2 className="lp-section-title">Everything your team needs</h2>
          <p className="lp-section-sub">
            Powerful tools that grow with your business. No bloat, no steep
            learning curve.
          </p>
          <div className="lp-features-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div className="lp-feature-card" key={title}>
                <div className="lp-feature-icon" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="lp-section">
        <div className="lp-section-inner lp-section-inner--centered">
          <p className="lp-section-label">How it works</p>
          <h2 className="lp-section-title">Up and running in minutes</h2>
          <p className="lp-section-sub">
            Three simple steps to your first closed deal in Elara.
          </p>
          <div className="lp-steps">
            {STEPS.map(({ num, title, desc }) => (
              <div className="lp-step" key={num}>
                <div className="lp-step-num">{num}</div>
                <div className="lp-step-line">
                  <CheckCircle2 size={18} className="lp-step-check" />
                  <h3>{title}</h3>
                </div>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section
        className="lp-section"
        style={{ background: "var(--muted)", borderTop: "1px solid var(--border)" }}
      >
        <div className="lp-section-inner" style={{ textAlign: "center" }}>
          <h2 className="lp-section-title" style={{ margin: "0 auto 0.75rem" }}>
            Ready to close more deals?
          </h2>
          <p className="lp-section-sub" style={{ margin: "0 auto 2rem" }}>
            Join thousands of teams who manage their customers smarter with Elara.
          </p>
          <div className="lp-cta-group">
            <Link
              href={ctaHref ?? "/register"}
              id="bottom-cta-primary"
              className="lp-btn-hero-primary"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href={ctaHref ?? "/login"}
              id="bottom-cta-secondary"
              className="lp-btn-hero-secondary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-main">
          <a href="/" className="lp-footer-brand">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" style={{borderRadius:"6px"}}>
              <rect width="32" height="32" rx="7" ry="7" fill="#c96442"/>
              <text x="16" y="23" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="20" fontWeight="800" fill="#ffffff" textAnchor="middle" letterSpacing="-0.5">E</text>
            </svg>
            Elara
          </a>
          <div className="lp-footer-links">
            <a href="#features" className="lp-footer-link">Features</a>
            <a href="#how-it-works" className="lp-footer-link">How it Works</a>
            <Link href={ctaHref ?? "/login"} className="lp-footer-link">Sign In</Link>
            <Link href={ctaHref ?? "/register"} className="lp-footer-link">Get Started</Link>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <div className="lp-footer-bottom-inner">
            © {new Date().getFullYear()} Elara. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
