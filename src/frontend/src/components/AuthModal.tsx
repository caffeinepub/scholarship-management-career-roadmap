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
  Search,
  Shield,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resetModal = () => {
    setStep(1);
    setSelectedCountry(COUNTRIES[0]);
    setMobile("");
    setMobileError("");
    setOtp(["", "", "", "", "", ""]);
    setIsLoading(false);
    setCountryDropdownOpen(false);
    setCountrySearch("");
    setResendTimer(0);
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

  const handleSendOtp = async () => {
    if (!mobile || !/^\d{5,15}$/.test(mobile)) {
      setMobileError("Please enter a valid mobile number");
      return;
    }
    setMobileError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success(`OTP sent to ${selectedCountry.code} ${mobile}`, {
      description: "Use any 6-digit code for demo.",
    });
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(30);
    setStep(2);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    toast.success("Registration successful! Welcome to ScholarSync 🎓");
    handleOpenChange(false);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(30);
    toast.success("OTP resent successfully");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[420px] p-0 overflow-visible"
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
                Student Registration
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center px-6 pt-4">
          <StepDot step={1} current={step} label="Mobile" />
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
              mobile={mobile}
              setMobile={setMobile}
              mobileError={mobileError}
              setMobileError={setMobileError}
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
              mobile={mobile}
              selectedCountry={selectedCountry}
              otp={otp}
              otpRefs={otpRefs}
              isLoading={isLoading}
              resendTimer={resendTimer}
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
  mobile,
  setMobile,
  mobileError,
  setMobileError,
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
  mobile: string;
  setMobile: (v: string) => void;
  mobileError: string;
  setMobileError: (v: string) => void;
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

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground mb-0.5">
          Enter your mobile number
        </p>
        <p className="text-xs text-muted-foreground">
          {"We'll send a verification code to confirm your identity"}
        </p>
      </div>

      {/* Phone input row */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-stretch rounded-xl"
          style={{
            border: `1.5px solid ${mobileError ? "oklch(0.577 0.245 27)" : "oklch(0.82 0.04 265)"}`,
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
            <span className="text-xl leading-none">{selectedCountry.flag}</span>
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
              if (mobileError) setMobileError("");
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

      {mobileError && (
        <p
          className="text-xs"
          style={{ color: "oklch(0.55 0.22 27)" }}
          data-ocid="auth.error_state"
        >
          {mobileError}
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
        disabled={isLoading || mobile.length < 5}
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
          "Get OTP →"
        )}
      </Button>
    </div>
  );
}

function StepTwo({
  mobile,
  selectedCountry,
  otp,
  otpRefs,
  isLoading,
  resendTimer,
  onOtpChange,
  onOtpKeyDown,
  onOtpPaste,
  onSubmit,
  onBack,
  onResend,
}: {
  mobile: string;
  selectedCountry: Country;
  otp: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  isLoading: boolean;
  resendTimer: number;
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
            {"Sent to "}
            <span
              className="font-semibold"
              style={{ color: "oklch(0.25 0.06 265)" }}
            >
              {selectedCountry.flag} {selectedCountry.code} {mobile}
            </span>
          </p>
        </div>
      </div>

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
