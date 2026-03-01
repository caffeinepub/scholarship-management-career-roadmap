import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Gender, Category } from '../backend';
import type { MasterUserRecord } from '../backend';
import ProfileCompletionMeter from '../components/ProfileCompletionMeter';
import { useGetProfileCompletion } from '../hooks/useQueries';

export default function Profile() {
  const { t } = useTranslation();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useGetCallerUserProfile();
  const { data: completion } = useGetProfileCompletion();
  const { mutateAsync: saveProfile, isPending: saving } = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.male);
  const [category, setCategory] = useState<Category>(Category.general);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setInitialized(true);
      setName(profile.name);
      setEmail(profile.email);
      setDob(profile.dob);
      setGender(profile.gender);
      setCategory(profile.category);
    }
  }, [profile, initialized]);

  if (!identity) {
    navigate({ to: '/login' });
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    const updatedProfile: MasterUserRecord = {
      name: name.trim(),
      email: email.trim(),
      dob,
      gender,
      category,
      academics: profile?.academics ?? [],
      career: profile?.career ?? [],
      documents: profile?.documents ?? [],
    };

    try {
      await saveProfile(updatedProfile);
      toast.success(t('profile.saved'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-teal-900">{t('profile.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Profile Completion */}
          <Card className="border-teal-100 shadow-sm">
            <CardContent className="p-5 flex items-center gap-6">
              <ProfileCompletionMeter
                completionPercentage={completion?.completionPercentage ?? 0}
                missingItems={completion?.missingFields ?? []}
                size={100}
              />
              <div>
                <h3 className="font-semibold text-teal-900 mb-1">{t('profile.completion')}</h3>
                <p className="text-sm text-gray-500">
                  {completion?.missingFields.length === 0
                    ? 'Your profile is complete!'
                    : `${completion?.missingFields.length ?? 0} items still needed`}
                </p>
                {completion && completion.missingFields.length > 0 && (
                  <ul className="mt-2 space-y-0.5">
                    {completion.missingFields.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-xs text-amber-600">
                        • {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Form */}
          <Card className="border-teal-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-teal-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('profile.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">{t('profile.name')} *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">{t('profile.email')}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">{t('profile.dob')}</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="border-gray-200 focus:border-teal-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">{t('profile.gender')}</Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.male}>{t('profile.male')}</SelectItem>
                      <SelectItem value={Gender.female}>{t('profile.female')}</SelectItem>
                      <SelectItem value={Gender.other}>{t('profile.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-600">{t('profile.category')}</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Category.general}>{t('scholarships.filter.general')}</SelectItem>
                      <SelectItem value={Category.obc}>{t('scholarships.filter.obc')}</SelectItem>
                      <SelectItem value={Category.sc}>{t('scholarships.filter.sc')}</SelectItem>
                      <SelectItem value={Category.st}>{t('scholarships.filter.st')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? t('profile.saving') : t('profile.save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Principal ID */}
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">Principal ID</p>
              <p className="text-xs text-gray-400 font-mono break-all">
                {identity?.getPrincipal().toString()}
              </p>
            </CardContent>
          </Card>
        </>
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
