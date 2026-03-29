import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { GraduationCap, Phone, Shield } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetModal = () => {
    setStep(1);
    setMobile("");
    setOtp("");
    setMobileError("");
    setIsLoading(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetModal();
    onOpenChange(value);
  };

  const validateMobile = (value: string) => {
    if (!/^[6-9]\d{9}$/.test(value)) {
      return "Please enter a valid 10-digit Indian mobile number";
    }
    return "";
  };

  const handleSendOtp = async () => {
    const error = validateMobile(mobile);
    if (error) {
      setMobileError(error);
      return;
    }
    setMobileError("");
    setIsLoading(true);
    // Simulate OTP dispatch delay
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    toast.success(`OTP sent to +91${mobile}`, {
      description: "Use 123456 for demo purposes.",
    });
    setStep(2);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setIsLoading(true);
    // Simulate verification delay
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    toast.success("Registration successful!", {
      description: "Welcome to ScholarSync!",
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" data-ocid="auth.modal">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "oklch(0.18 0.05 265)" }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Student Registration
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <StepDot step={1} current={step} label="Mobile" />
          <div
            className="flex-1 h-0.5 rounded-full transition-colors duration-300"
            style={{
              background:
                step >= 2 ? "oklch(0.47 0.18 265)" : "oklch(0.85 0.02 265)",
            }}
          />
          <StepDot step={2} current={step} label="Verify" />
        </div>

        {step === 1 ? (
          <Step1
            mobile={mobile}
            setMobile={setMobile}
            mobileError={mobileError}
            setMobileError={setMobileError}
            isLoading={isLoading}
            onSubmit={handleSendOtp}
          />
        ) : (
          <Step2
            mobile={mobile}
            otp={otp}
            setOtp={setOtp}
            isLoading={isLoading}
            onSubmit={handleVerifyOtp}
            onBack={() => setStep(1)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step dot indicator
function StepDot({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
        style={{
          background: done
            ? "oklch(0.47 0.18 265)"
            : active
              ? "oklch(0.18 0.05 265)"
              : "oklch(0.92 0.02 265)",
          color: done || active ? "white" : "oklch(0.55 0.03 265)",
        }}
      >
        {done ? "✓" : step}
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// Step 1: Enter Mobile Number
function Step1({
  mobile,
  setMobile,
  mobileError,
  setMobileError,
  isLoading,
  onSubmit,
}: {
  mobile: string;
  setMobile: (v: string) => void;
  mobileError: string;
  setMobileError: (v: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: "oklch(0.95 0.02 265)" }}
      >
        <Phone
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "oklch(0.47 0.18 265)" }}
        />
        <p className="text-sm text-muted-foreground">
          Enter your mobile number to receive a one-time verification code.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="auth-mobile" className="text-sm font-semibold">
          Mobile Number
        </Label>
        <div className="flex">
          <div
            className="flex items-center justify-center px-3 text-sm font-medium border border-r-0 rounded-l-md"
            style={{
              background: "oklch(0.95 0.02 265)",
              borderColor: "oklch(0.85 0.03 265)",
              color: "oklch(0.35 0.04 265)",
            }}
          >
            +91
          </div>
          <Input
            id="auth-mobile"
            data-ocid="auth.input"
            className="rounded-l-none"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setMobile(val);
              if (mobileError) setMobileError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            placeholder="98XXXXXXXX"
          />
        </div>
        {mobileError && (
          <p
            className="text-xs"
            style={{ color: "oklch(0.55 0.2 25)" }}
            data-ocid="auth.error_state"
          >
            {mobileError}
          </p>
        )}
      </div>

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={isLoading || mobile.length < 10}
        data-ocid="auth.submit_button"
        style={{
          background: "oklch(0.18 0.05 265)",
          color: "white",
        }}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Sending OTP...
          </>
        ) : (
          "Send OTP →"
        )}
      </Button>
    </div>
  );
}

// Step 2: Verify OTP
function Step2({
  mobile,
  otp,
  setOtp,
  isLoading,
  onSubmit,
  onBack,
}: {
  mobile: string;
  otp: string;
  setOtp: (v: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 p-3 rounded-xl"
        style={{ background: "oklch(0.95 0.02 265)" }}
      >
        <Shield
          className="w-4 h-4 mt-0.5 shrink-0"
          style={{ color: "oklch(0.47 0.18 265)" }}
        />
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground">+91{mobile}</span>
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Verification Code</Label>
        <div className="flex justify-center pt-1">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            data-ocid="auth.input"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={isLoading || otp.length < 6}
        data-ocid="auth.confirm_button"
        style={{
          background: "oklch(0.18 0.05 265)",
          color: "white",
        }}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          "Verify & Register"
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        data-ocid="auth.cancel_button"
        className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Change mobile number
      </button>
    </div>
  );
}
