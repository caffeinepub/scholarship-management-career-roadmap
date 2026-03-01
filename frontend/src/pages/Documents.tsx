import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import DocumentChecklist from '../components/DocumentChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react';

const ALL_DOCUMENT_TYPES = [
  'marksheet',
  'incomeCertificate',
  'casteCertificate',
  'aadhaar',
  'photo',
  'bankPassbook',
];

export default function Documents() {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useGetCallerUserProfile();

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  const uploadedCount = profile?.documents.filter((d) => d.uploadStatus).length ?? 0;
  const totalCount = ALL_DOCUMENT_TYPES.length;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-teal-900">{t('documents.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your documents for scholarship applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-teal-100 shadow-sm">
          <CardContent className="p-4 text-center">
            <FolderOpen className="h-6 w-6 text-teal-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-teal-700">{totalCount}</p>
            <p className="text-xs text-gray-500">Total Required</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-700">{uploadedCount}</p>
            <p className="text-xs text-gray-500">{t('documents.uploaded')}</p>
          </CardContent>
        </Card>
        <Card className="border-red-100 shadow-sm">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{totalCount - uploadedCount}</p>
            <p className="text-xs text-gray-500">{t('documents.missing')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Document Checklist */}
      <Card className="border-teal-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-teal-800">
            {t('documents.allDocuments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : (
            <DocumentChecklist
              requiredDocuments={ALL_DOCUMENT_TYPES}
              userDocuments={profile?.documents ?? []}
              userProfile={profile ?? null}
            />
          )}
        </CardContent>
      </Card>

      {/* Uploaded documents list */}
      {profile && profile.documents.length > 0 && (
        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-teal-800">
              Uploaded Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.documents
                .filter((d) => d.uploadStatus)
                .map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.fileName}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {t(`documents.${doc.documentType}`) !== `documents.${doc.documentType}`
                            ? t(`documents.${doc.documentType}`)
                            : doc.documentType}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      {t('documents.uploaded')}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs border-t border-gray-100">
        © {new Date().getFullYear()} ScholarPath · Built with ❤️ using{' '}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            window.location.hostname || 'scholarpath'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
