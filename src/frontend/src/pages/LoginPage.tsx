import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BarChart3,
  CheckCircle,
  FileText,
  Globe,
  GraduationCap,
  Loader2,
  Shield,
  UserRound,
} from "lucide-react";
import React from "react";
import { useState } from "react";
import AuthModal from "../components/AuthModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: GraduationCap,
    title: "Smart Scholarship Matching",
    description:
      "AI-powered eligibility checks match you with the right scholarships instantly.",
  },
  {
    icon: FileText,
    title: "One-Click Auto-Fill",
    description:
      "Your profile data auto-fills scholarship applications — no repetitive typing.",
  },
  {
    icon: BarChart3,
    title: "Profile Completion Meter",
    description:
      "Track your profile strength and know exactly what to improve.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Available in English, Hindi, Tamil, and Telugu for wider accessibility.",
  },
  {
    icon: Shield,
    title: "Secure & Decentralized",
    description:
      "Built on the Internet Computer — your data is private and tamper-proof.",
  },
];

export default function LoginPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const queryClient = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";
  const isAuthenticated = !!identity;

  const handleLogin = async () => {
    if (isAuthenticated) return;
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === "User is already authenticated") {
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("token", `guest-${Date.now()}`);
    localStorage.setItem("isGuest", "true");
    // Set a minimal guest profile so the dashboard loads cleanly
    const guestProfile = {
      profileId: `guest-${Date.now()}`,
      name: "Guest Student",
      email: "",
      phone: "",
      course: "",
      year: "",
      income: "",
      state: "",
      district: "",
      skills: [],
      isGuest: true,
    };
    localStorage.setItem("studentProfile", JSON.stringify(guestProfile));
    localStorage.setItem("scholarSync_profile", JSON.stringify(guestProfile));
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Award className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg text-foreground font-display leading-none">
                ScholarSync
              </span>
              <p className="text-xs text-muted-foreground">
                Scholarship Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>Secured by Internet Computer</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/8 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Now live on Internet Computer
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight font-display">
                  Your Gateway to{" "}
                  <span className="text-primary">Scholarships</span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  ScholarSync helps students discover, apply, and track
                  scholarships — all in one secure, decentralized platform.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Smart eligibility matching based on your profile",
                  "Auto-fill applications from your resume data",
                  "Track all applications in one dashboard",
                  "Secure login — no passwords needed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="pt-2 space-y-3">
                {/* Primary: Internet Identity */}
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn || isAuthenticated}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Login with Internet Identity
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground">
                  No password required · Decentralized & secure · Free to use
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* OTP login (mobile or email) */}
                <button
                  type="button"
                  onClick={() => setShowOtpModal(true)}
                  data-ocid="login.secondary_button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors"
                >
                  <span>📱</span> Login with Mobile / Email OTP
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Guest login */}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  data-ocid="login.guest_button"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-dashed border-border bg-transparent text-muted-foreground font-medium text-sm hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <UserRound className="w-4 h-4" />
                  Continue as Guest
                </button>
                <p className="text-xs text-muted-foreground">
                  Explore the platform without signing up. Data won't be saved.
                </p>
              </div>
            </div>

            {/* Right: Hero image + stats */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                  <img
                    src="/assets/generated/dashboard-hero-banner.dim_1200x300.png"
                    alt="ScholarSync Dashboard"
                    className="w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                  <p className="text-2xl font-bold text-primary">500+</p>
                  <p className="text-xs text-muted-foreground">
                    Scholarships Listed
                  </p>
                </div>
                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: "oklch(0.55 0.18 65)" }}
                  >
                    ₹50Cr+
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Aid Available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">
              Everything you need to succeed
            </h2>
            <p className="mt-2 text-muted-foreground">
              Powerful tools designed for Indian students
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="shrink-0 border-t border-border py-6 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ScholarSync. All rights reserved.</p>
          <p>
            Built with <span className="text-red-500">♥</span> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "scholarsync")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline cursor-pointer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      <AuthModal
        open={showOtpModal}
        onOpenChange={setShowOtpModal}
        onSuccess={() => {
          localStorage.setItem("token", `demo-otp-${Date.now()}`);
          localStorage.removeItem("isGuest");
          window.location.href = "/";
        }}
      />
    </div>
  );
}
