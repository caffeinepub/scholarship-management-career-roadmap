import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  Loader2,
  Lock,
  Shield,
  Smartphone,
} from "lucide-react";
import React, { useState } from "react";

type Step = "auth" | "otp" | "consent" | "fetching" | "success" | "error";

const DIGILOCKER_DOCUMENTS = [
  {
    name: "10th Marksheet",
    icon: "📄",
    desc: "Class X Board Examination Marksheet",
  },
  {
    name: "12th Marksheet",
    icon: "📄",
    desc: "Class XII Board Examination Marksheet",
  },
  {
    name: "Income Certificate",
    icon: "📋",
    desc: "Family Income Certificate (Govt. Issued)",
  },
  {
    name: "Caste Certificate",
    icon: "📋",
    desc: "Caste/Category Certificate (Govt. Issued)",
  },
  {
    name: "Domicile Certificate",
    icon: "🏠",
    desc: "State Domicile / Residence Certificate",
  },
  { name: "Aadhaar Card", icon: "🪪", desc: "Aadhaar Card (UIDAI)" },
];

interface DigiLockerFlowModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  connectError: string | null;
}

export default function DigiLockerFlowModal({
  open,
  onClose,
  onConnect,
  isConnecting: _isConnecting,
  connectError,
}: DigiLockerFlowModalProps) {
  const [step, setStep] = useState<Step>("auth");
  const [aadhaar, setAadhaar] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [authError, setAuthError] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleClose = () => {
    // Reset state on close
    setStep("auth");
    setAadhaar("");
    setMobile("");
    setOtp("");
    setConsentGiven(false);
    setAuthError("");
    setOtpError("");
    onClose();
  };

  const handleAuthSubmit = () => {
    setAuthError("");
    if (aadhaar.replace(/\s/g, "").length !== 12) {
      setAuthError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (mobile.replace(/\s/g, "").length !== 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }
    // Simulate OTP sent
    setStep("otp");
  };

  const handleOtpSubmit = () => {
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Please enter the 6-digit OTP sent to your mobile.");
      return;
    }
    // Simulate OTP verification — any 6-digit code is accepted
    setStep("consent");
  };

  const handleConsentSubmit = async () => {
    if (!consentGiven) return;
    setStep("fetching");
    try {
      await onConnect();
      setStep("success");
    } catch {
      setStep("error");
    }
  };

  const formatAadhaar = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-md w-full">
        {/* DigiLocker Header Branding */}
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.45_0.18_250)] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold leading-tight">
                DigiLocker Connect
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-tight mt-0.5">
                Government of India — Ministry of Electronics &amp; IT
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step: Authentication */}
        {step === "auth" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700">
                Your credentials are secured with 256-bit encryption. DigiLocker
                does not share your data without consent.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="aadhaar" className="text-sm font-medium">
                  Aadhaar Number
                </Label>
                <Input
                  id="aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                  maxLength={14}
                  className="font-mono tracking-widest"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="text-sm font-medium">
                  Registered Mobile Number
                </Label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted border border-border rounded-md text-sm text-muted-foreground shrink-0">
                    +91
                  </span>
                  <Input
                    id="mobile"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    maxLength={10}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {authError}
              </div>
            )}

            <Button className="w-full" onClick={handleAuthSubmit}>
              Send OTP
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              An OTP will be sent to your Aadhaar-linked mobile number
            </p>
          </div>
        )}

        {/* Step: OTP Verification */}
        {step === "otp" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              <Smartphone className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700">
                OTP sent to +91 ••••••{mobile.slice(-4)}. Valid for 10 minutes.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="otp" className="text-sm font-medium">
                Enter OTP
              </Label>
              <Input
                id="otp"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="font-mono tracking-[0.5em] text-center text-lg"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter any 6-digit code to simulate verification
              </p>
            </div>

            {otpError && (
              <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {otpError}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("auth")}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handleOtpSubmit}>
                Verify OTP
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <button
              type="button"
              className="w-full text-xs text-primary hover:underline text-center"
              onClick={() => setOtp("")}
            >
              Resend OTP
            </button>
          </div>
        )}

        {/* Step: Consent */}
        {step === "consent" && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <BadgeCheck className="w-4 h-4 text-green-600 shrink-0" />
              <p className="text-xs text-green-700 font-medium">
                Identity verified successfully via DigiLocker
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Documents to be fetched:
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {DIGILOCKER_DOCUMENTS.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-3 py-2"
                  >
                    <span className="text-base shrink-0">{doc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground leading-tight">
                        {doc.desc}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                      Govt. Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <Checkbox
                id="consent"
                checked={consentGiven}
                onCheckedChange={(v) => setConsentGiven(!!v)}
                className="mt-0.5 shrink-0"
              />
              <Label
                htmlFor="consent"
                className="text-xs text-amber-800 cursor-pointer leading-relaxed"
              >
                I hereby give my consent to fetch the above documents from
                DigiLocker and auto-upload them to my ScholarPath profile. These
                documents will be marked as Government Verified.
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("otp")}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!consentGiven}
                onClick={handleConsentSubmit}
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                Fetch Documents
              </Button>
            </div>
          </div>
        )}

        {/* Step: Fetching / Loading */}
        {step === "fetching" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[oklch(0.45_0.18_250)]/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[oklch(0.45_0.18_250)]" />
              </div>
              <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.18_250)] absolute -top-1 -right-1" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">
                Fetching from DigiLocker...
              </p>
              <p className="text-sm text-muted-foreground">
                Securely retrieving your government-issued documents
              </p>
            </div>
            <div className="w-full space-y-1.5">
              {DIGILOCKER_DOCUMENTS.map((doc, i) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                  <span>Fetching {doc.name}...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">
                  Documents Fetched!
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  All documents have been auto-uploaded and verified.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              {DIGILOCKER_DOCUMENTS.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">
                    {doc.name}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                    Approved
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700">
                Source: <strong>DigiLocker (Government Verified)</strong> — No
                OCR scanning required.
              </p>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}

        {/* Step: Error */}
        {step === "error" && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">
                  Connection Failed
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {connectError ||
                    "Unable to fetch documents from DigiLocker. Please try again."}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setStep("consent");
                  setConsentGiven(false);
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Step indicator dots */}
        {(step === "auth" || step === "otp" || step === "consent") && (
          <div className="flex justify-center gap-1.5 pt-1">
            {(["auth", "otp", "consent"] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s
                    ? "w-6 bg-primary"
                    : ["auth", "otp", "consent"].indexOf(step) > i
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
