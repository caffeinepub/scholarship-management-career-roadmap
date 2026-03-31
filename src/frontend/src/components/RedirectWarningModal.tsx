import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import React from "react";

interface RedirectWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarshipName: string;
  provider: string;
  url: string;
}

export default function RedirectWarningModal({
  isOpen,
  onClose,
  scholarshipName,
  provider,
  url,
}: RedirectWarningModalProps) {
  const handleProceed = () => {
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-ocid="redirect_warning.dialog"
        className="max-w-md w-full"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <ExternalLink className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              You are being redirected
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are visiting the official{" "}
            <strong className="text-foreground">{provider}</strong> website to
            complete your application for{" "}
            <strong className="text-foreground">{scholarshipName}</strong>. Make
            sure to read their guidelines carefully before submitting.
          </p>

          {/* Warning note */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              You will leave ScholarSync and open an external website. Ensure
              you save your progress before proceeding.
            </p>
          </div>

          {/* URL preview */}
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono break-all">
            {url}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <Button
              data-ocid="redirect_warning.cancel_button"
              variant="outline"
              onClick={onClose}
              className="flex-1 gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              data-ocid="redirect_warning.confirm_button"
              onClick={handleProceed}
              className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <ExternalLink className="w-4 h-4" />
              Proceed to Official Site
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
