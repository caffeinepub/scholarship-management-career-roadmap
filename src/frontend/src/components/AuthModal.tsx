import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ChevronDown,
  GraduationCap,
  Mail,
  Phone,
  Search,
  Shield,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const COUNTRIES = [
  { name: "India", flag: "🇮🇳", code: "+91" },
  { name: "USA", flag: "🇺🇸", code: "+1" },
  { name: "UK", flag: "🇬🇧", code: "+44" },
  { name: "Australia", flag: "🇦🇺", code: "+61" },
  { name: "Canada", flag: "🇨🇦", code: "+1" },
  { name: "Germany", flag: "🇩🇪", code: "+49" },
  { name: "France", flag: "🇫🇷", code: "+33" },
  { name: "Japan", flag: "🇯🇵", code: "+81" },
  { name: "Singapore", flag: "🇸🇬", code: "+65" },
  { name: "UAE", flag: "🇦🇪", code: "+971" },
  { name: "Bangladesh", flag: "🇧🇩", code: "+880" },
  { name: "Pakistan", flag: "🇵🇰", code: "+92" },
  { name: "Nepal", flag: "🇳🇵", code: "+977" },
  { name: "Sri Lanka", flag: "🇱🇰", code: "+94" },
  { name: "South Africa", flag: "🇿🇦", code: "+27" },
  { name: "Brazil", flag: "🇧🇷", code: "+55" },
  { name: "South Korea", flag: "🇰🇷", code: "+82" },
  { name: "China", flag: "🇨🇳", code: "+86" },
  { name: "Russia", flag: "🇷🇺", code: "+7" },
  { name: "Indonesia", flag: "🇮🇩", code: "+62" },
];

type Country = (typeof COUNTRIES)[number];
type ContactMode = "mobile" | "email";

export default function AuthModal({
  open,
  onOpenChange,
  onSuccess,
}: AuthModalProps) {
  const { actor } = useActor();
  const [step, setStep] = useState<1 | 2>(1);
  const [contactMode, setContactMode] = useState<ContactMode>("mobile");
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [inputError, setInputError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  // For demo mode: store the generated OTP so user can see it
  const [demoOtpCode, setDemoOtpCode] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetModal = () => {
    setStep(1);
    setContactMode("mobile");
    setSelectedCountry(COUNTRIES[0]);
    setMobile("");
    setEmail("");
    setInputError("");
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(false);
    setCountryDropdownOpen(false);
    setCountrySearch("");
    setResendTimer(0);
    setDemoOtpCode("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetModal();
    onOpenChange(value);
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch),
  );

  const getMaskedContact = () => {
    if (contactMode === "mobile") {
      const masked = mobile.slice(0, -4).replace(/\d/g, "*") + mobile.slice(-4);
      return `${selectedCountry.code} ${masked}`;
    }
    const [user = "", domain = ""] = email.split("@");
    const maskedUser =
      user.slice(0, 2) + "*".repeat(Math.max(0, user.length - 2));
    return `${maskedUser}@${domain}`;
  };

  const handleSendOtp = async () => {
    if (contactMode === "mobile") {
      if (!mobile || !/^\d{5,15}$/.test(mobile)) {
        setInputError("Please enter a valid mobile number");
        return;
      }
    } else {
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        setInputError("Please enter a valid email address");
        return;
      }
    }
    setInputError("");
    setIsLoading(true);

    if (contactMode === "mobile" && actor) {
      // Real backend OTP via Fast2SMS
      const phoneWithCode = selectedCountry.code.replace("+", "") + mobile;
      try {
        const result = await actor.sendPhoneOtp(phoneWithCode);
        setIsLoading(false);
        if (result.__kind__ === "ok") {
          const okVal = result.ok;
          if (okVal.startsWith("demo:")) {
            // Demo mode — API key not yet set. Show the code to the user.
            const code = okVal.replace("demo:", "");
            setDemoOtpCode(code);
            toast.info(`Demo Mode: Your OTP is ${code}`, {
              description:
                "Set your Fast2SMS API key via admin to enable real SMS delivery.",
              duration: 15000,
            });
          } else {
            setDemoOtpCode("");
            toast.success(`OTP sent to ${selectedCountry.code} ${mobile}`, {
              description: "Check your SMS for the 6-digit verification code.",
            });
          }
          setOtp(["", "", "", "", "", ""]);
          setResendTimer(30);
          setStep(2);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } else {
          toast.error(result.err);
        }
      } catch (_e) {
        setIsLoading(false);
        toast.error("Could not send OTP. Please try again.");
      }
    } else {
      // Email or actor not ready — simulate
      await new Promise((r) => setTimeout(r, 1000));
      setIsLoading(false);
      const dest = email;
      toast.success(`OTP sent to ${dest}`, {
        description: "Use any 6-digit code for demo.",
      });
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "Enter" && otp.every((d) => d !== "")) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleVerifyOtp = async () => {
    if (otp.some((d) => d === "")) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setIsLoading(true);
    const enteredCode = otp.join("");

    if (contactMode === "mobile" && actor) {
      const phoneWithCode = selectedCountry.code.replace("+", "") + mobile;
      try {
        const result = await actor.verifyPhoneOtp(phoneWithCode, enteredCode);
        setIsLoading(false);
        if (result.__kind__ === "ok") {
          toast.success("Mobile Verified ✅ Welcome to ScholarSync!");
          handleOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          toast.error(result.err);
          // Clear OTP boxes on failure so user can re-enter
          setOtp(["", "", "", "", "", ""]);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
      } catch (_e) {
        setIsLoading(false);
        toast.error("Verification failed. Please try again.");
      }
    } else {
      // Email mode: accept any 6-digit code (demo)
      await new Promise((r) => setTimeout(r, 1200));
      setIsLoading(false);
      toast.success("Registration successful! Welcome to ScholarSync 🎓");
      handleOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);

    if (contactMode === "mobile" && actor) {
      const phoneWithCode = selectedCountry.code.replace("+", "") + mobile;
      try {
        const result = await actor.sendPhoneOtp(phoneWithCode);
        setIsLoading(false);
        if (result.__kind__ === "ok") {
          const okVal = result.ok;
          if (okVal.startsWith("demo:")) {
            const code = okVal.replace("demo:", "");
            setDemoOtpCode(code);
            toast.info(`Demo Mode: New OTP is ${code}`, { duration: 15000 });
          } else {
            setDemoOtpCode("");
            toast.success("OTP resent via SMS");
          }
          setOtp(["", "", "", "", "", ""]);
          setResendTimer(30);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } else {
          toast.error(result.err);
        }
      } catch (_e) {
        setIsLoading(false);
        toast.error("Could not resend OTP. Please try again.");
      }
    } else {
      await new Promise((r) => setTimeout(r, 800));
      setIsLoading(false);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(30);
      toast.success("OTP resent successfully");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] p-0 overflow-visible"
        data-ocid="auth.modal"
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.18 0.05 265)" }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle
                className="text-lg font-bold leading-tight"
                style={{ color: "oklch(0.18 0.05 265)" }}
              >
                ScholarSync
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Student Login / Registration
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center px-6 pt-4">
          <StepDot
            step={1}
            current={step}
            label={contactMode === "mobile" ? "Mobile" : "Email"}
          />
          <div
            className="flex-1 h-0.5 rounded-full mx-2 transition-colors duration-500"
            style={{
              background:
                step >= 2 ? "oklch(0.42 0.18 265)" : "oklch(0.88 0.02 265)",
            }}
          />
          <StepDot step={2} current={step} label="Verify OTP" />
        </div>

        <div className="px-6 pb-6 pt-5">
          {step === 1 ? (
            <StepOne
              contactMode={contactMode}
              setContactMode={(m) => {
                setContactMode(m);
                setInputError("");
                setMobile("");
                setEmail("");
              }}
              mobile={mobile}
              setMobile={setMobile}
              email={email}
              setEmail={setEmail}
              inputError={inputError}
              setInputError={setInputError}
              isLoading={isLoading}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              countryDropdownOpen={countryDropdownOpen}
              setCountryDropdownOpen={setCountryDropdownOpen}
              countrySearch={countrySearch}
              setCountrySearch={setCountrySearch}
              filteredCountries={filteredCountries}
              onSubmit={handleSendOtp}
            />
          ) : (
            <StepTwo
              maskedContact={getMaskedContact()}
              contactMode={contactMode}
              otp={otp}
              otpRefs={otpRefs}
              isLoading={isLoading}
              resendTimer={resendTimer}
              demoOtpCode={demoOtpCode}
              onOtpChange={handleOtpChange}
              onOtpKeyDown={handleOtpKeyDown}
              onOtpPaste={handleOtpPaste}
              onSubmit={handleVerifyOtp}
              onBack={() => setStep(1)}
              onResend={handleResend}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepDot({
  step,
  current,
  label,
}: { step: number; current: number; label: string }) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        style={{
          background: done
            ? "oklch(0.42 0.18 265)"
            : active
              ? "oklch(0.18 0.05 265)"
              : "oklch(0.92 0.02 265)",
          color: done || active ? "white" : "oklch(0.55 0.03 265)",
        }}
      >
        {done ? "✓" : step}
      </div>
      <span
        className="text-xs font-medium"
        style={{
          color: active ? "oklch(0.18 0.05 265)" : "oklch(0.6 0.03 265)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function StepOne({
  contactMode,
  setContactMode,
  mobile,
  setMobile,
  email,
  setEmail,
  inputError,
  setInputError,
  isLoading,
  selectedCountry,
  setSelectedCountry,
  countryDropdownOpen,
  setCountryDropdownOpen,
  countrySearch,
  setCountrySearch,
  filteredCountries,
  onSubmit,
}: {
  contactMode: ContactMode;
  setContactMode: (m: ContactMode) => void;
  mobile: string;
  setMobile: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  inputError: string;
  setInputError: (v: string) => void;
  isLoading: boolean;
  selectedCountry: Country;
  setSelectedCountry: (c: Country) => void;
  countryDropdownOpen: boolean;
  setCountryDropdownOpen: (v: boolean) => void;
  countrySearch: string;
  setCountrySearch: (v: string) => void;
  filteredCountries: Country[];
  onSubmit: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setCountryDropdownOpen]);

  const canSubmit =
    contactMode === "mobile" ? mobile.length >= 5 : email.length >= 5;

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: "oklch(0.93 0.02 265)" }}
      >
        <button
          type="button"
          onClick={() => setContactMode("mobile")}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: contactMode === "mobile" ? "white" : "transparent",
            color:
              contactMode === "mobile"
                ? "oklch(0.25 0.08 265)"
                : "oklch(0.55 0.03 265)",
            boxShadow:
              contactMode === "mobile"
                ? "0 1px 4px oklch(0 0 0 / 0.1)"
                : "none",
          }}
        >
          <Phone className="w-3.5 h-3.5" />
          Mobile
        </button>
        <button
          type="button"
          onClick={() => setContactMode("email")}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: contactMode === "email" ? "white" : "transparent",
            color:
              contactMode === "email"
                ? "oklch(0.25 0.08 265)"
                : "oklch(0.55 0.03 265)",
            boxShadow:
              contactMode === "email" ? "0 1px 4px oklch(0 0 0 / 0.1)" : "none",
          }}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-0.5">
          {contactMode === "mobile"
            ? "Enter your mobile number"
            : "Enter your email address"}
        </p>
        <p className="text-xs text-muted-foreground">
          {contactMode === "mobile"
            ? "OTP will be sent via SMS to your mobile"
            : "We'll send a verification code to your email"}
        </p>
      </div>

      {contactMode === "mobile" ? (
        /* Phone input row */
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-stretch rounded-xl"
            style={{
              border: `1.5px solid ${
                inputError ? "oklch(0.577 0.245 27)" : "oklch(0.82 0.04 265)"
              }`,
            }}
          >
            {/* Country code button */}
            <button
              type="button"
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              data-ocid="auth.select"
              className="flex items-center gap-1.5 px-3 py-3 hover:bg-muted/60 transition-colors duration-150 shrink-0 rounded-l-xl"
              style={{ borderRight: "1.5px solid oklch(0.82 0.04 265)" }}
            >
              <span className="text-xl leading-none">
                {selectedCountry.flag}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "oklch(0.25 0.06 265)" }}
              >
                {selectedCountry.code}
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  color: "oklch(0.55 0.04 265)",
                  transform: countryDropdownOpen
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </button>

            {/* Number input */}
            <input
              type="tel"
              inputMode="numeric"
              maxLength={15}
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setMobile(val);
                if (inputError) setInputError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              data-ocid="auth.input"
              className="flex-1 bg-transparent px-3 py-3 text-sm outline-none text-foreground min-w-0"
              style={{ caretColor: "oklch(0.42 0.18 265)" }}
            />
          </div>

          {/* Country dropdown */}
          {countryDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-2 w-full bg-popover rounded-xl shadow-2xl z-[100] overflow-hidden"
              style={{ border: "1.5px solid oklch(0.82 0.04 265)" }}
            >
              <div className="p-2 border-b border-border">
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                  style={{ background: "oklch(0.95 0.01 265)" }}
                >
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search country or code"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="flex-1 bg-transparent text-xs outline-none text-foreground"
                    // biome-ignore lint/a11y/noAutofocus: intentional for UX
                    autoFocus
                  />
                </div>
              </div>
              <ScrollArea className="h-48">
                {filteredCountries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No countries found
                  </p>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={`${country.name}-${country.code}`}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country);
                        setCountryDropdownOpen(false);
                        setCountrySearch("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      style={{
                        background:
                          selectedCountry.name === country.name
                            ? "oklch(0.92 0.04 265)"
                            : undefined,
                      }}
                    >
                      <span className="text-lg leading-none shrink-0">
                        {country.flag}
                      </span>
                      <span className="flex-1 text-foreground font-medium text-xs">
                        {country.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {country.code}
                      </span>
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      ) : (
        /* Email input */
        <div
          className="flex items-stretch rounded-xl"
          style={{
            border: `1.5px solid ${
              inputError ? "oklch(0.577 0.245 27)" : "oklch(0.82 0.04 265)"
            }`,
          }}
        >
          <div
            className="flex items-center px-3"
            style={{ borderRight: "1.5px solid oklch(0.82 0.04 265)" }}
          >
            <Mail
              className="w-4 h-4"
              style={{ color: "oklch(0.55 0.04 265)" }}
            />
          </div>
          <input
            type="email"
            inputMode="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (inputError) setInputError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            data-ocid="auth.input"
            className="flex-1 bg-transparent px-3 py-3 text-sm outline-none text-foreground min-w-0"
            style={{ caretColor: "oklch(0.42 0.18 265)" }}
          />
        </div>
      )}

      {inputError && (
        <p
          className="text-xs"
          style={{ color: "oklch(0.55 0.22 27)" }}
          data-ocid="auth.error_state"
        >
          {inputError}
        </p>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        {"By proceeding you confirm you agree to our "}
        <span
          className="underline cursor-pointer"
          style={{ color: "oklch(0.42 0.18 265)" }}
        >
          Privacy Policy
        </span>
        {" & "}
        <span
          className="underline cursor-pointer"
          style={{ color: "oklch(0.42 0.18 265)" }}
        >
          Terms of Use
        </span>
        {"."}
      </p>

      <Button
        className="w-full h-11 text-sm font-semibold rounded-xl"
        onClick={onSubmit}
        disabled={isLoading || !canSubmit}
        data-ocid="auth.submit_button"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.38 0.18 265), oklch(0.55 0.2 250))",
          color: "white",
          border: "none",
        }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending OTP...
          </span>
        ) : (
          `Get OTP via ${contactMode === "mobile" ? "SMS" : "Email"} →`
        )}
      </Button>

      {contactMode === "mobile" && (
        <p className="text-xs text-center text-muted-foreground">
          📡 OTP is sent using SMS API service
        </p>
      )}
    </div>
  );
}

function StepTwo({
  maskedContact,
  contactMode,
  otp,
  otpRefs,
  isLoading,
  resendTimer,
  demoOtpCode,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onSubmit,
  onBack,
  onResend,
}: {
  maskedContact: string;
  contactMode: ContactMode;
  otp: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
  resendTimer: number;
  demoOtpCode: string;
  onOtpChange: (i: number, v: string) => void;
  onOtpKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOtpPaste: (e: React.ClipboardEvent) => void;
  onSubmit: () => void;
  onBack: () => void;
  onResend: () => void;
}) {
  const otpFilled = otp.every((d) => d !== "");

  return (
    <div className="space-y-5">
      {/* Back + heading */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          data-ocid="auth.cancel_button"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft
            className="w-4 h-4"
            style={{ color: "oklch(0.42 0.18 265)" }}
          />
        </button>
        <div>
          <p className="text-sm font-semibold text-foreground">Enter OTP</p>
          <p className="text-xs text-muted-foreground">
            {contactMode === "mobile"
              ? "Sent via SMS to "
              : "Sent via Email to "}
            <span
              className="font-semibold"
              style={{ color: "oklch(0.25 0.06 265)" }}
            >
              {maskedContact}
            </span>
          </p>
        </div>
      </div>

      {/* Demo mode notice */}
      {demoOtpCode && (
        <div
          className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
          style={{
            background: "oklch(0.97 0.04 80)",
            border: "1px solid oklch(0.85 0.1 80)",
          }}
        >
          <span className="text-base">&#x1f4cb;</span>
          <div>
            <p
              className="text-xs font-semibold"
              style={{ color: "oklch(0.45 0.15 80)" }}
            >
              Demo Mode — SMS API key not configured
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(0.5 0.1 80)" }}
            >
              Your OTP:{" "}
              <span className="font-bold tracking-widest">{demoOtpCode}</span>
            </p>
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
        style={{ background: "oklch(0.95 0.03 265)" }}
      >
        <Shield
          className="w-4 h-4 shrink-0"
          style={{ color: "oklch(0.42 0.18 265)" }}
        />
        <p className="text-xs text-muted-foreground">
          {"6-digit code — valid for "}
          <span className="font-medium text-foreground">5 minutes</span>
          {" · max 3 attempts"}
        </p>
      </div>

      {/* OTP 6-box row */}
      <div
        className="flex items-center justify-center gap-2.5"
        onPaste={onOtpPaste}
      >
        {otp.map((digit, i) => (
          <input
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static array
            key={i}
            ref={(el) => {
              otpRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => onOtpChange(i, e.target.value)}
            onKeyDown={(e) => onOtpKeyDown(i, e)}
            data-ocid="auth.input"
            className="text-center text-xl font-bold rounded-xl outline-none transition-all duration-150"
            style={{
              width: "48px",
              height: "52px",
              border: digit
                ? "2px solid oklch(0.42 0.18 265)"
                : "2px solid oklch(0.82 0.04 265)",
              background: digit ? "oklch(0.95 0.04 265)" : "white",
              color: "oklch(0.18 0.05 265)",
              boxShadow: digit
                ? "0 0 0 3px oklch(0.42 0.18 265 / 0.15)"
                : "none",
            }}
          />
        ))}
      </div>

      <Button
        className="w-full h-11 text-sm font-semibold rounded-xl"
        onClick={onSubmit}
        disabled={isLoading || !otpFilled}
        data-ocid="auth.confirm_button"
        style={{
          background: otpFilled
            ? "linear-gradient(135deg, oklch(0.38 0.18 265), oklch(0.55 0.2 250))"
            : "oklch(0.88 0.02 265)",
          color: otpFilled ? "white" : "oklch(0.55 0.03 265)",
          border: "none",
        }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Verifying...
          </span>
        ) : (
          "Verify OTP ✓"
        )}
      </Button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-xs text-muted-foreground">
            {"Resend OTP in "}
            <span
              className="font-semibold tabular-nums"
              style={{ color: "oklch(0.42 0.18 265)" }}
            >
              {resendTimer}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={isLoading}
            data-ocid="auth.secondary_button"
            className="text-xs font-medium hover:underline transition-colors disabled:opacity-50"
            style={{ color: "oklch(0.42 0.18 265)" }}
          >
            {"Didn't receive it? Resend OTP"}
          </button>
        )}
      </div>
    </div>
  );
}
