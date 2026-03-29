import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Shield,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Variant_V2_Approved_Rejected_Pending } from "../backend";
import DigiLockerFlowModal from "../components/DigiLockerFlowModal";
import {
  useConnectDigiLocker,
  useGetMyProfile,
  useUploadDocument,
  useVerifyDocument,
} from "../hooks/useQueries";

const DOCUMENT_TYPES = [
  { key: "marksheet", label: "10th/12th Marksheet", required: true },
  { key: "incomeCertificate", label: "Income Certificate", required: true },
  { key: "idProof", label: "ID Proof", required: true },
  { key: "aadhaarKyc", label: "Aadhaar KYC", required: true },
  { key: "casteCertificate", label: "Caste Certificate", required: false },
  { key: "addressProof", label: "Address Proof", required: false },
  {
    key: "disabilityCertificate",
    label: "Disability Certificate",
    required: false,
  },
  { key: "birthCertificate", label: "Birth Certificate", required: false },
  { key: "bankStatement", label: "Bank Statement", required: false },
  { key: "feeReceipt", label: "Fee Receipt", required: false },
  { key: "admissionLetter", label: "Admission Letter", required: false },
  { key: "degreeCertificate", label: "Degree Certificate", required: false },
];

const OCR_STEPS = [
  "Reading document...",
  "Extracting text...",
  "Verifying keywords...",
];

interface UploadedDoc {
  documentType: string;
  fileName: string;
  ocrText: string;
  verificationStatus: Variant_V2_Approved_Rejected_Pending | null;
  verificationReason: string;
  confidence: number;
  source: "manual" | "digilocker";
}

interface AnalyzingState {
  docType: string;
  fileName: string;
  step: number;
}

function StatusBadge({
  status,
}: { status: Variant_V2_Approved_Rejected_Pending | null }) {
  if (!status)
    return (
      <Badge variant="outline" className="text-xs gap-1">
        <X className="w-3 h-3 text-red-400" />
        Not Uploaded
      </Badge>
    );
  switch (status) {
    case Variant_V2_Approved_Rejected_Pending.Approved:
      return (
        <Badge className="text-xs gap-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          <CheckCircle className="w-3 h-3" />
          Verified
        </Badge>
      );
    case Variant_V2_Approved_Rejected_Pending.Rejected:
      return (
        <Badge variant="destructive" className="text-xs gap-1">
          <X className="w-3 h-3" />
          Rejected
        </Badge>
      );
    case Variant_V2_Approved_Rejected_Pending.Pending:
      return (
        <Badge className="text-xs gap-1 bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
          <Clock className="w-3 h-3" />
          Manual Review
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          Unknown
        </Badge>
      );
  }
}

// OCR Simulation overlay
function OcrAnalyzingOverlay({ analyzing }: { analyzing: AnalyzingState }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <FileText className="w-7 h-7 text-primary absolute inset-0 m-auto" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg mb-1">
            Analyzing Document
          </h3>
          <p className="text-sm text-muted-foreground truncate max-w-xs mx-auto">
            {analyzing.fileName}
          </p>
        </div>
        <div className="space-y-3">
          {OCR_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  i < analyzing.step
                    ? "bg-green-500"
                    : i === analyzing.step
                      ? "bg-primary animate-pulse"
                      : "bg-border"
                }`}
              >
                {i < analyzing.step ? (
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                ) : i === analyzing.step ? (
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                )}
              </div>
              <span
                className={`text-sm ${
                  i <= analyzing.step
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
        <div>
          <Progress
            value={Math.min(
              100,
              ((analyzing.step + 1) / OCR_STEPS.length) * 100,
            )}
            className="h-1.5"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Please wait — AI-powered document analysis in progress
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const { profile, isLoading, isFetched } = useGetMyProfile();
  const uploadDocument = useUploadDocument();
  const verifyDocument = useVerifyDocument();
  const connectDigiLocker = useConnectDigiLocker();

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>(
    {},
  );
  const [activeDocType, setActiveDocType] = useState<string | null>(null);
  const [ocrInputs, setOcrInputs] = useState<Record<string, string>>({});
  const [showDigiLocker, setShowDigiLocker] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [digiLockerError, setDigiLockerError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<AnalyzingState | null>(null);
  const pendingFileRef = useRef<{ file: File; docType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentId = profile?.profileId ?? null;

  // Advance OCR steps
  useEffect(() => {
    if (!analyzing) return;
    if (analyzing.step >= OCR_STEPS.length - 1) return;
    const timer = setTimeout(() => {
      setAnalyzing((prev) => (prev ? { ...prev, step: prev.step + 1 } : null));
    }, 500);
    return () => clearTimeout(timer);
  }, [analyzing]);

  // Stable upload callback — stored in a ref so the step-watcher effect below
  // doesn't need it in its own dependency array.
  const runUploadCallback = useCallback(async () => {
    const pending = pendingFileRef.current;
    if (!pending || !studentId) {
      setAnalyzing(null);
      pendingFileRef.current = null;
      return;
    }
    const { file, docType } = pending;
    try {
      const simulatedOcr = `Sample OCR text for ${docType} document uploaded from ${file.name}. This document contains relevant information for verification purposes.`;
      await uploadDocument.mutateAsync({
        studentId,
        documentName: file.name,
        filePath: file.name,
      });
      const result = await verifyDocument.mutateAsync({
        studentId,
        documentType: docType,
        ocrText: simulatedOcr,
      });
      const confidence =
        result.status === Variant_V2_Approved_Rejected_Pending.Approved
          ? 2
          : result.status === Variant_V2_Approved_Rejected_Pending.Pending
            ? 1
            : 0;
      setUploadedDocs((prev) => ({
        ...prev,
        [docType]: {
          documentType: docType,
          fileName: file.name,
          ocrText: simulatedOcr,
          verificationStatus: result.status,
          verificationReason: result.reason,
          confidence,
          source: "manual",
        },
      }));
      toast.success("Document uploaded and verified");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAnalyzing(null);
      pendingFileRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveDocType(null);
    }
  }, [studentId, uploadDocument, verifyDocument]);

  const runUploadRef = useRef(runUploadCallback);
  runUploadRef.current = runUploadCallback;

  // After OCR simulation finishes, trigger the actual upload
  useEffect(() => {
    if (!analyzing) return;
    if (analyzing.step < OCR_STEPS.length - 1) return;
    // Small delay to show the last step, then run upload via stable ref
    const delay = setTimeout(() => runUploadRef.current(), 400);
    return () => clearTimeout(delay);
  }, [analyzing]);

  const handleFileSelect = (docType: string) => {
    setActiveDocType(docType);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocType) return;
    if (!studentId) {
      toast.error("Please register your profile first");
      return;
    }
    pendingFileRef.current = { file, docType: activeDocType };
    setAnalyzing({ docType: activeDocType, fileName: file.name, step: 0 });
  };

  const handleManualOcr = async (docType: string) => {
    if (!studentId) {
      toast.error("Please register your profile first");
      return;
    }
    const ocrText = ocrInputs[docType] ?? "";
    if (!ocrText.trim()) {
      toast.error("Please enter OCR text");
      return;
    }
    try {
      const result = await verifyDocument.mutateAsync({
        studentId,
        documentType: docType,
        ocrText,
      });
      const confidence =
        result.status === Variant_V2_Approved_Rejected_Pending.Approved
          ? 2
          : result.status === Variant_V2_Approved_Rejected_Pending.Pending
            ? 1
            : 0;
      setUploadedDocs((prev) => ({
        ...prev,
        [docType]: {
          documentType: docType,
          fileName: "Manual OCR Entry",
          ocrText,
          verificationStatus: result.status,
          verificationReason: result.reason,
          confidence,
          source: "manual",
        },
      }));
      toast.success("Document verified");
      setOcrInputs((prev) => ({ ...prev, [docType]: "" }));
      setExpandedDoc(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const handleDigiLockerConnect = useCallback(async () => {
    if (!studentId) {
      const msg = "Please register your profile first";
      setDigiLockerError(msg);
      throw new Error(msg);
    }
    setDigiLockerError(null);
    try {
      await connectDigiLocker.mutateAsync(studentId);
      const digiLockerDocs = [
        "marksheet",
        "incomeCertificate",
        "casteCertificate",
        "aadhaarKyc",
        "addressProof",
        "idProof",
      ];
      const newDocs: Record<string, UploadedDoc> = {};
      for (const dt of digiLockerDocs) {
        newDocs[dt] = {
          documentType: dt,
          fileName: `DigiLocker — ${dt}`,
          ocrText: "",
          verificationStatus: Variant_V2_Approved_Rejected_Pending.Approved,
          verificationReason: "Government verified via DigiLocker",
          confidence: 2,
          source: "digilocker",
        };
      }
      setUploadedDocs((prev) => ({ ...prev, ...newDocs }));
      toast.success("DigiLocker documents imported successfully!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "DigiLocker connection failed";
      setDigiLockerError(msg);
      throw err;
    }
  }, [studentId, connectDigiLocker]);

  const uploadedCount = Object.keys(uploadedDocs).length;
  const approvedCount = Object.values(uploadedDocs).filter(
    (d) =>
      d.verificationStatus === Variant_V2_Approved_Rejected_Pending.Approved,
  ).length;

  if (isLoading && !isFetched) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }, (_, i) => i).map((i) => (
            <Skeleton key={`doc-skeleton-${i}`} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isFetched && !profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Profile Required
          </h2>
          <p className="text-sm text-muted-foreground">
            Please register your profile before uploading documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* OCR analyzing overlay */}
      {analyzing && <OcrAnalyzingOverlay analyzing={analyzing} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Document Vault
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upload and verify your documents for scholarship applications
          </p>
        </div>
        <Button
          data-ocid="documents.digilocker.button"
          variant="outline"
          onClick={() => {
            setDigiLockerError(null);
            setShowDigiLocker(true);
          }}
          disabled={!studentId}
          className="gap-2"
        >
          <Shield className="w-4 h-4 text-primary" />
          Connect DigiLocker
        </Button>
      </div>

      {/* Stats */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-3 gap-4 min-w-[280px]">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {uploadedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Uploaded</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Verified</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {DOCUMENT_TYPES.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Types</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Document Completion
          </span>
          <span className="text-sm font-bold text-primary">
            {Math.round((approvedCount / DOCUMENT_TYPES.length) * 100)}%
          </span>
        </div>
        <Progress
          value={(approvedCount / DOCUMENT_TYPES.length) * 100}
          className="h-2"
        />
      </div>

      {/* Document Vault section */}
      <div data-ocid="documents.vault.section">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
          <Shield className="w-4 h-4 text-primary" />
          Document Vault
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_TYPES.map(({ key, label, required }, idx) => {
            const doc = uploadedDocs[key];
            const isExpanded = expandedDoc === key;
            const ocrText = ocrInputs[key] ?? "";

            return (
              <div
                key={key}
                className="bg-card border border-border rounded-xl p-4 space-y-3 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {label}
                      </p>
                      {required && (
                        <span className="text-xs text-destructive">
                          Mandatory
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={doc?.verificationStatus ?? null} />
                </div>

                {doc && (
                  <div className="text-xs text-muted-foreground">
                    <p className="truncate">{doc.fileName}</p>
                    {doc.source === "digilocker" && (
                      <p className="text-green-600 flex items-center gap-1 mt-0.5">
                        <Shield className="w-3 h-3" />
                        DigiLocker (Government Verified)
                      </p>
                    )}
                  </div>
                )}

                {doc?.verificationReason && (
                  <button
                    type="button"
                    onClick={() => setExpandedDoc(isExpanded ? null : key)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {isExpanded ? "Hide details" : "View details"}
                  </button>
                )}

                {isExpanded && doc && (
                  <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                    <p className="text-foreground font-medium">
                      Verification Result
                    </p>
                    <p className="text-muted-foreground">
                      {doc.verificationReason}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-muted-foreground">Confidence:</span>
                      {Array.from({ length: 2 }, (_, i) => i).map((i) => (
                        <span
                          key={`conf-dot-${i}`}
                          className={`w-2 h-2 rounded-full ${i < doc.confidence ? "bg-primary" : "bg-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && !doc && (
                  <div className="space-y-2">
                    <textarea
                      className="w-full text-xs border border-border rounded-lg p-2 bg-background resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Paste OCR text from your document for verification..."
                      value={ocrText}
                      onChange={(e) =>
                        setOcrInputs((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleManualOcr(key)}
                      disabled={verifyDocument.isPending}
                      className="w-full text-xs"
                    >
                      {verifyDocument.isPending
                        ? "Verifying..."
                        : "Verify with OCR"}
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    data-ocid={`documents.upload.button.${idx + 1}`}
                    size="sm"
                    variant={doc ? "outline" : "default"}
                    onClick={() => handleFileSelect(key)}
                    disabled={
                      uploadDocument.isPending || !studentId || !!analyzing
                    }
                    className="flex-1 text-xs gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    {doc ? "Re-upload" : "Upload"}
                  </Button>
                  {!doc && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedDoc(isExpanded ? null : key)}
                      className="text-xs gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      OCR
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* DigiLocker modal */}
      {showDigiLocker && (
        <DigiLockerFlowModal
          open={showDigiLocker}
          onClose={() => setShowDigiLocker(false)}
          onConnect={handleDigiLockerConnect}
          isConnecting={connectDigiLocker.isPending}
          connectError={digiLockerError}
        />
      )}
    </div>
  );
}
