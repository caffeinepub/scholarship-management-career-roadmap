import React, { useRef } from 'react';
import { CheckCircle2, AlertCircle, Upload, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { DocumentReference, MasterUserRecord } from '../backend';

interface DocumentChecklistProps {
  requiredDocuments: string[];
  userDocuments: DocumentReference[];
  userProfile: MasterUserRecord | null;
  onDocumentUploaded?: () => void;
}

const DOC_TYPE_MAP: Record<string, string> = {
  marksheet: 'marksheet',
  incomeCertificate: 'incomeCertificate',
  casteCertificate: 'casteCertificate',
  aadhaar: 'aadhaar',
  photo: 'photo',
  bankPassbook: 'bankPassbook',
};

export default function DocumentChecklist({
  requiredDocuments,
  userDocuments,
  userProfile,
  onDocumentUploaded,
}: DocumentChecklistProps) {
  const { t } = useTranslation();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const getUploadedDoc = (docName: string): DocumentReference | undefined => {
    return userDocuments.find(
      (d) =>
        d.uploadStatus &&
        (d.documentType === docName ||
          d.fileName.toLowerCase().includes(docName.toLowerCase()) ||
          d.documentType.toLowerCase().includes(docName.toLowerCase()))
    );
  };

  const handleUpload = async (docName: string, file: File) => {
    if (!userProfile) {
      toast.error('Please complete your profile first');
      return;
    }

    const docType = DOC_TYPE_MAP[docName] ?? docName;
    const newDoc: DocumentReference = {
      fileName: file.name,
      documentType: docType,
      uploadStatus: true,
    };

    // Remove existing doc of same type and add new one
    const updatedDocs = [
      ...userProfile.documents.filter((d) => d.documentType !== docType),
      newDoc,
    ];

    const updatedProfile: MasterUserRecord = {
      ...userProfile,
      documents: updatedDocs,
    };

    try {
      await saveProfile(updatedProfile);
      toast.success(t('documents.uploadSuccess'));
      onDocumentUploaded?.();
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="space-y-2">
      {requiredDocuments.map((docName) => {
        const uploaded = getUploadedDoc(docName);
        const docLabel =
          t(`documents.${docName}`) !== `documents.${docName}`
            ? t(`documents.${docName}`)
            : docName;

        return (
          <div
            key={docName}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              uploaded
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {uploaded ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{docLabel}</p>
                {uploaded ? (
                  <p className="text-xs text-emerald-600 truncate">{uploaded.fileName}</p>
                ) : (
                  <p className="text-xs text-red-500">{t('documents.missing')}</p>
                )}
              </div>
            </div>

            <div className="shrink-0 ml-3">
              <input
                type="file"
                ref={(el) => {
                  fileInputRefs.current[docName] = el;
                }}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(docName, file);
                  e.target.value = '';
                }}
              />
              <Button
                size="sm"
                variant={uploaded ? 'outline' : 'default'}
                disabled={isPending}
                onClick={() => fileInputRefs.current[docName]?.click()}
                className={
                  uploaded
                    ? 'text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 h-7 px-2'
                    : 'text-xs bg-saffron hover:bg-saffron-dark text-white h-7 px-2'
                }
              >
                {uploaded ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t('documents.replace')}
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    {t('documents.upload')}
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
