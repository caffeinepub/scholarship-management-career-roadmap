import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Info,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Variant_V2_Approved_Rejected_Pending } from "../backend";
import { type DocumentRecord, DocumentType } from "../types";

export interface VerificationResult {
  status: Variant_V2_Approved_Rejected_Pending;
  reason: string;
  confidence?: number;
}

interface ChecklistItem {
  name: string;
  documentType: DocumentType;
  description: string;
  required: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    name: "10th Marksheet",
    documentType: DocumentType.Mandatory,
    description: "Class X board examination marksheet",
    required: true,
  },
  {
    name: "12th Marksheet",
    documentType: DocumentType.Mandatory,
    description: "Class XII board examination marksheet",
    required: true,
  },
  {
    name: "Income Certificate",
    documentType: DocumentType.Mandatory,
    description: "Annual family income certificate",
    required: true,
  },
  {
    name: "Identity Proof",
    documentType: DocumentType.Mandatory,
    description: "Aadhaar card, PAN card, or passport",
    required: true,
  },
  {
    name: "Admission Letter",
    documentType: DocumentType.Mandatory,
    description: "College/university admission letter",
    required: true,
  },
  {
    name: "Fee Receipt",
    documentType: DocumentType.Mandatory,
    description: "Current year fee receipt",
    required: true,
  },
  {
    name: "Caste Certificate",
    documentType: DocumentType.Conditional,
    description: "Required for SC/ST/OBC category students",
    required: false,
  },
  {
    name: "OBC Certificate",
    documentType: DocumentType.Conditional,
    description: "Required for OBC category students",
    required: false,
  },
  {
    name: "Disability Certificate",
    documentType: DocumentType.Conditional,
    description: "Required for differently-abled students",
    required: false,
  },
  {
    name: "Character Certificate",
    documentType: DocumentType.Optional,
    description: "Character certificate from previous institution",
    required: false,
  },
  {
    name: "Bank Passbook Copy",
    documentType: DocumentType.Optional,
    description: "First page of bank passbook",
    required: false,
  },
  {
    name: "Affidavit",
    documentType: DocumentType.Optional,
    description: "Income affidavit if income certificate unavailable",
    required: false,
  },
];

interface DocumentChecklistProps {
  backendDocuments: DocumentRecord[];
  onDocumentUpload: (
    documentName: string,
    documentType: DocumentType,
    file: File,
  ) => Promise<void>;
  isUploading: boolean;
  ocrProcessingDoc?: string | null;
  verificationResults?: Record<string, VerificationResult>;
}

function isDigiLockerDoc(doc: DocumentRecord): boolean {
  const src = doc.source as unknown as Record<string, unknown>;
  return "DigiLockerVerified" in src;
}

/** Normalise status enum to a simple discriminant string */
function normaliseStatus(
  status: Variant_V2_Approved_Rejected_Pending,
): "Approved" | "Rejected" | "Pending" {
  if (status === Variant_V2_Approved_Rejected_Pending.Approved)
    return "Approved";
  if (status === Variant_V2_Approved_Rejected_Pending.Rejected)
    return "Rejected";
  return "Pending";
}

/** Confidence dot indicators */
function ConfidenceDots({ confidence }: { confidence: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 ml-1"
      title={`Confidence: ${confidence}/2`}
    >
      {[0, 1].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < confidence
              ? confidence === 2
                ? "bg-green-500"
                : "bg-amber-400"
              : "bg-muted-foreground/30"
          }`}
        />
      ))}
    </span>
  );
}

export default function DocumentChecklist({
  backendDocuments,
  onDocumentUpload,
  isUploading,
  ocrProcessingDoc,
  verificationResults = {},
}: DocumentChecklistProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const getDocumentStatus = (name: string): DocumentRecord | undefined => {
    return backendDocuments.find((d) => d.documentName === name);
  };

  const handleFileUpload = async (
    documentName: string,
    documentType: DocumentType,
    file: File,
  ) => {
    setUploadingDoc(documentName);
    try {
      await onDocumentUpload(documentName, documentType, file);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    documentName: string,
    documentType: DocumentType,
  ) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(documentName, documentType, file);
    }
  };

  const renderStatusBadge = (doc: DocumentRecord | undefined, name: string) => {
    const isOcrProcessing = ocrProcessingDoc === name;
    const verResult = verificationResults[name];

    if (isOcrProcessing) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          Scanning...
        </span>
      );
    }

    if (verResult) {
      const normStatus = normaliseStatus(verResult.status);
      const confidence =
        verResult.confidence ??
        (normStatus === "Approved" ? 2 : normStatus === "Pending" ? 1 : 0);

      if (normStatus === "Approved") {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Approved
            <ConfidenceDots confidence={confidence} />
          </span>
        );
      }
      if (normStatus === "Rejected") {
        return (
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"
            title={verResult.reason}
          >
            <X className="w-3 h-3" />
            Rejected
            <ConfidenceDots confidence={confidence} />
          </span>
        );
      }
      // Pending / Manual Review
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"
          title={verResult.reason}
        >
          <Clock className="w-3 h-3" />
          Manual Review
          <ConfidenceDots confidence={confidence} />
        </span>
      );
    }

    if (!doc) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
          <Clock className="w-3 h-3" />
          Not Uploaded
        </span>
      );
    }

    if (!doc.uploadStatus) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }

    if (
      doc.verificationStatus === "Verified" ||
      doc.verificationStatus === "Approved"
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  };

  const renderSourceBadge = (doc: DocumentRecord | undefined) => {
    if (!doc || !doc.uploadStatus) return null;

    if (isDigiLockerDoc(doc)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[oklch(0.95_0.04_250)] text-[oklch(0.35_0.15_250)] border border-[oklch(0.80_0.08_250)]">
          🏛️ DigiLocker (Government Verified)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
        Manual
      </span>
    );
  };

  /**
   * Renders the verification result detail panel below the document name.
   * Shows confidence score and the descriptive note from the backend.
   */
  const renderVerificationDetail = (name: string) => {
    const verResult = verificationResults[name];
    if (!verResult || !verResult.reason) return null;

    const normStatus = normaliseStatus(verResult.status);
    const confidence =
      verResult.confidence ??
      (normStatus === "Approved" ? 2 : normStatus === "Pending" ? 1 : 0);

    const colorClass =
      normStatus === "Approved"
        ? "text-green-700 bg-green-50 border-green-200"
        : normStatus === "Rejected"
          ? "text-red-700 bg-red-50 border-red-200"
          : "text-amber-700 bg-amber-50 border-amber-200";

    const Icon =
      normStatus === "Approved"
        ? CheckCircle
        : normStatus === "Rejected"
          ? AlertCircle
          : Info;

    return (
      <div
        className={`mt-2 flex items-start gap-2 px-3 py-2 rounded-lg border text-xs ${colorClass}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold mr-1">
            Confidence {confidence}/2 —
          </span>
          <span>{verResult.reason}</span>
        </div>
      </div>
    );
  };

  const renderSection = (
    title: string,
    items: ChecklistItem[],
    color: string,
  ) => (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${color}`}>
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const doc = getDocumentStatus(item.name);
          const isThisUploading =
            uploadingDoc === item.name || ocrProcessingDoc === item.name;
          const isDigiLocked = doc ? isDigiLockerDoc(doc) : false;

          return (
            <div
              key={item.name}
              className={`bg-card border rounded-xl p-4 transition-all ${
                dragOver === item.name
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } ${isDigiLocked ? "border-[oklch(0.80_0.08_250)] bg-[oklch(0.98_0.02_250)]" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(item.name);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, item.name, item.documentType)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      doc?.uploadStatus ? "bg-green-100" : "bg-muted"
                    }`}
                  >
                    <FileText
                      className={`w-4 h-4 ${doc?.uploadStatus ? "text-green-600" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      {renderStatusBadge(doc, item.name)}
                      {renderSourceBadge(doc)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                    {renderVerificationDetail(item.name)}
                  </div>
                </div>

                {/* Upload button — hidden for DigiLocker docs */}
                {!isDigiLocked && (
                  <label
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isThisUploading || isUploading
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {isThisUploading ? (
                      <>
                        <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" />
                        {doc?.uploadStatus ? "Re-upload" : "Upload"}
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      disabled={isThisUploading || isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                          handleFileUpload(item.name, item.documentType, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const mandatoryItems = CHECKLIST_ITEMS.filter(
    (i) => i.documentType === DocumentType.Mandatory,
  );
  const conditionalItems = CHECKLIST_ITEMS.filter(
    (i) => i.documentType === DocumentType.Conditional,
  );
  const optionalItems = CHECKLIST_ITEMS.filter(
    (i) => i.documentType === DocumentType.Optional,
  );

  return (
    <div className="space-y-6">
      {renderSection("Mandatory Documents", mandatoryItems, "text-red-600")}
      {renderSection(
        "Conditional Documents",
        conditionalItems,
        "text-yellow-600",
      )}
      {renderSection(
        "Optional Documents",
        optionalItems,
        "text-muted-foreground",
      )}
    </div>
  );
}
