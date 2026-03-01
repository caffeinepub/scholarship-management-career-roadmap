import React, { useRef, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { DocumentRecord, DocumentType } from '../backend';

interface DocumentItem {
  name: string;
  type: 'Mandatory' | 'Conditional' | 'Optional';
  description: string;
}

interface DocumentChecklistProps {
  backendDocuments?: DocumentRecord[];
  onDocumentUpload?: (name: string, type: DocumentType, file: File) => Promise<void>;
  isUploading?: boolean;
}

const ALL_DOCUMENTS: DocumentItem[] = [
  // Mandatory
  { name: '10th Marksheet', type: 'Mandatory', description: 'Class 10 board examination marksheet' },
  { name: '12th Marksheet', type: 'Mandatory', description: 'Class 12 board examination marksheet' },
  { name: 'Income Certificate', type: 'Mandatory', description: 'Family income certificate from competent authority' },
  { name: 'Identity Proof', type: 'Mandatory', description: 'Government-issued photo ID (Voter ID, Passport, Driving License)' },
  { name: 'Domicile Certificate', type: 'Mandatory', description: 'State domicile/residence certificate' },
  { name: 'Passport Size Photo', type: 'Mandatory', description: 'Recent passport size photograph' },
  { name: 'Admission Letter', type: 'Mandatory', description: 'Current year admission/enrollment letter from institute' },
  { name: 'Fee Receipt', type: 'Mandatory', description: 'Current year fee payment receipt' },
  // Conditional
  { name: 'Caste Certificate', type: 'Conditional', description: 'Required for SC/ST/OBC category students' },
  { name: 'OBC Certificate', type: 'Conditional', description: 'OBC non-creamy layer certificate' },
  { name: 'Disability Certificate', type: 'Conditional', description: 'Required for students with disabilities' },
  { name: 'Migration Certificate', type: 'Conditional', description: 'Required if migrated from another state/board' },
  { name: 'Gap Certificate', type: 'Conditional', description: 'Required if there is a gap in education' },
  { name: 'Minority Certificate', type: 'Conditional', description: 'Required for minority community students' },
  { name: 'BPL Card', type: 'Conditional', description: 'Below Poverty Line card if applicable' },
  { name: 'Single Girl Child Certificate', type: 'Conditional', description: 'Required for single girl child scholarships' },
  // Optional
  { name: 'Sports Certificate', type: 'Optional', description: 'State/national level sports achievement certificate' },
  { name: 'NSS/NCC Certificate', type: 'Optional', description: 'NSS or NCC participation certificate' },
  { name: 'Research Publication', type: 'Optional', description: 'Published research papers or articles' },
  { name: 'Internship Certificate', type: 'Optional', description: 'Industry internship completion certificate' },
  { name: 'Community Service Certificate', type: 'Optional', description: 'Volunteer or community service certificate' },
  { name: 'Language Proficiency Certificate', type: 'Optional', description: 'Foreign language proficiency certificate' },
  { name: 'Previous Scholarship Certificate', type: 'Optional', description: 'Certificate of previously received scholarships' },
  { name: 'Bank Passbook Copy', type: 'Optional', description: 'First page of bank passbook (masked account number)' },
  { name: 'Ration Card', type: 'Optional', description: 'Family ration card copy' },
  { name: 'Electricity Bill', type: 'Optional', description: 'Recent electricity bill for address proof' },
  { name: 'Affidavit', type: 'Optional', description: 'Self-declaration affidavit if required' },
  { name: 'Character Certificate', type: 'Optional', description: 'Character certificate from previous institution' },
];

const typeConfig = {
  Mandatory: {
    label: 'Mandatory',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  Conditional: {
    label: 'Conditional',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  Optional: {
    label: 'Optional',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
};

const verificationConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  Verified: {
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    label: 'Verified',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  Pending: {
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  Rejected: {
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
};

export default function DocumentChecklist({
  backendDocuments = [],
  onDocumentUpload,
  isUploading = false,
}: DocumentChecklistProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Mandatory' | 'Conditional' | 'Optional'>('All');

  const getBackendDoc = (name: string): DocumentRecord | undefined =>
    backendDocuments.find((d) => d.documentName === name);

  const isUploaded = (name: string): boolean => {
    const bd = getBackendDoc(name);
    return bd ? bd.uploadStatus : false;
  };

  const getVerificationStatus = (name: string): string | null => {
    const bd = getBackendDoc(name);
    return bd && bd.uploadStatus ? bd.verificationStatus : null;
  };

  const handleUploadClick = (docName: string) => {
    setUploadingDoc(docName);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingDoc || !onDocumentUpload) return;

    const docItem = ALL_DOCUMENTS.find((d) => d.name === uploadingDoc);
    if (!docItem) return;

    const docTypeMap: Record<string, DocumentType> = {
      Mandatory: DocumentType.Mandatory,
      Conditional: DocumentType.Conditional,
      Optional: DocumentType.Optional,
    };

    await onDocumentUpload(uploadingDoc, docTypeMap[docItem.type], file);
    setUploadingDoc(null);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredDocs =
    activeFilter === 'All' ? ALL_DOCUMENTS : ALL_DOCUMENTS.filter((d) => d.type === activeFilter);

  const uploadedCount = ALL_DOCUMENTS.filter((d) => isUploaded(d.name)).length;
  const mandatoryMissing = ALL_DOCUMENTS.filter(
    (d) => d.type === 'Mandatory' && !isUploaded(d.name),
  ).length;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-foreground text-lg">Document Checklist</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {uploadedCount} of {ALL_DOCUMENTS.length} documents uploaded
            </p>
          </div>
          {mandatoryMissing > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {mandatoryMissing} mandatory document{mandatoryMissing > 1 ? 's' : ''} missing — High Rejection Risk
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {(['All', 'Mandatory', 'Conditional', 'Optional'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Document list */}
      <div className="divide-y divide-border">
        {filteredDocs.map((doc) => {
          const uploaded = isUploaded(doc.name);
          const verStatus = getVerificationStatus(doc.name);
          const cfg = typeConfig[doc.type];
          const isCurrentlyUploading = isUploading && uploadingDoc === doc.name;

          return (
            <div
              key={doc.name}
              className={`flex items-start gap-3 p-4 transition-colors ${
                uploaded ? 'bg-green-50/40' : ''
              }`}
            >
              {/* Status icon */}
              <div className="shrink-0 mt-0.5">
                {uploaded ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>

              {/* Document info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">{doc.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                    {doc.type}
                  </span>
                  {/* Verification status badge */}
                  {verStatus && verificationConfig[verStatus] && (
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${verificationConfig[verStatus].className}`}
                    >
                      {verificationConfig[verStatus].icon}
                      {verificationConfig[verStatus].label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
              </div>

              {/* Upload button */}
              <div className="shrink-0">
                <button
                  onClick={() => handleUploadClick(doc.name)}
                  disabled={isCurrentlyUploading}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                    uploaded
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  {isCurrentlyUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : uploaded ? (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      Replace
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileChange}
      />
    </div>
  );
}
