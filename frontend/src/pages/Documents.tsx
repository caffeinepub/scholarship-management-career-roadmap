import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import DocumentChecklist from '../components/DocumentChecklist';
import {
  useGetMyStudent,
  useGetDocumentsByStudent,
  useUploadDocument,
  useUpdateDocumentUploadStatus,
} from '../hooks/useQueries';
import { DocumentType } from '../backend';

export default function Documents() {
  const { data: student, isLoading: studentLoading } = useGetMyStudent();
  const studentId = student ? student.studentId : null;

  const { data: documents = [], isLoading: docsLoading } = useGetDocumentsByStudent(studentId);
  const uploadDocument = useUploadDocument();
  const updateDocumentStatus = useUpdateDocumentUploadStatus();

  const [uploadMessage, setUploadMessage] = useState('');

  const uploadedCount = documents.filter((d) => d.uploadStatus).length;
  const totalCount = documents.length;
  const mandatoryDocs = documents.filter((d) => d.documentType === DocumentType.Mandatory);
  const mandatoryUploaded = mandatoryDocs.filter((d) => d.uploadStatus).length;

  const handleDocumentUpload = async (
    documentName: string,
    _documentType: DocumentType,
    file: File,
  ) => {
    if (!studentId) {
      setUploadMessage('Please complete your profile first to track documents.');
      return;
    }
    setUploadMessage('');
    try {
      // Check if document already exists — if so, update its status; otherwise upload new
      const existing = documents.find((d) => d.documentName === documentName);
      if (existing) {
        await updateDocumentStatus.mutateAsync({
          documentId: existing.documentId,
          uploadStatus: true,
          fileUrl: `uploaded:${file.name}`,
          studentId,
        });
      } else {
        await uploadDocument.mutateAsync({
          studentId,
          documentName,
          filePath: `uploaded:${file.name}`,
        });
      }
      setUploadMessage(`"${documentName}" uploaded successfully!`);
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (err: unknown) {
      setUploadMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const isLoading = studentLoading || docsLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your scholarship documents
          </p>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Uploaded</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {uploadedCount}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ {totalCount}</span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Mandatory Uploaded</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {mandatoryUploaded}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {mandatoryDocs.length}
              </span>
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Missing Documents</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {totalCount - uploadedCount}
            </p>
          </div>
        </div>
      )}

      {/* Upload message */}
      {uploadMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            uploadMessage.includes('failed') || uploadMessage.includes('Please')
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {uploadMessage.includes('failed') || uploadMessage.includes('Please') ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          {uploadMessage}
        </div>
      )}

      {/* No profile warning */}
      {!studentLoading && !student && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Profile Required</p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Please complete your profile first to enable document tracking and persistence.
            </p>
          </div>
        </div>
      )}

      {/* Document Checklist */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading documents...</span>
        </div>
      ) : (
        <DocumentChecklist
          backendDocuments={documents}
          onDocumentUpload={handleDocumentUpload}
          isUploading={uploadDocument.isPending || updateDocumentStatus.isPending}
        />
      )}
    </div>
  );
}
