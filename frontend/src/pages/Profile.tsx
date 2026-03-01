import React, { useState, useEffect } from 'react';
import { User, Save, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import {
  useGetMyStudent,
  useRegisterStudent,
} from '../hooks/useQueries';

interface ProfileFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  category: string;
  annualFamilyIncome: string;
  courseName: string;
  // Extended fields (display only when student already exists)
  gender: string;
  disabilityStatus: string;
  state: string;
  district: string;
  courseLevel: string;
  instituteName: string;
  currentYear: string;
}

const defaultForm: ProfileFormData = {
  fullName: '',
  email: '',
  mobileNumber: '',
  category: 'general',
  annualFamilyIncome: 'Below 1L',
  courseName: '',
  gender: 'male',
  disabilityStatus: 'none',
  state: '',
  district: '',
  courseLevel: 'undergraduate',
  instituteName: '',
  currentYear: '1',
};

function computeProfileCompletion(form: ProfileFormData): number {
  const fields = [
    form.fullName,
    form.email,
    form.mobileNumber,
    form.category,
    form.annualFamilyIncome,
    form.courseName,
    form.gender,
    form.state,
    form.district,
    form.courseLevel,
    form.instituteName,
    form.currentYear,
  ];
  const filled = fields.filter((f) => f && f.trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
}

export default function Profile() {
  const { data: student, isLoading: studentLoading } = useGetMyStudent();
  const registerStudent = useRegisterStudent();

  const [form, setForm] = useState<ProfileFormData>(defaultForm);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Pre-populate form from backend data
  useEffect(() => {
    if (student) {
      setForm({
        fullName: student.fullName,
        email: student.email,
        mobileNumber: student.mobileNumber,
        category: student.category as string,
        annualFamilyIncome: student.annualFamilyIncome,
        courseName: student.courseName,
        gender: student.gender as string,
        disabilityStatus: student.disabilityStatus as string,
        state: student.state,
        district: student.district,
        courseLevel: student.courseLevel,
        instituteName: student.instituteName,
        currentYear: String(student.currentYear),
      });
    }
  }, [student]);

  const profileCompletion = computeProfileCompletion(form);
  const isSaving = registerStudent.isPending;
  const isExistingStudent = !!student;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSave = async () => {
    if (isExistingStudent) return; // Profile already registered; no update endpoint available
    setSaveSuccess(false);
    setSaveError('');

    // Validate required fields
    if (!form.fullName.trim()) { setSaveError('Full name is required.'); return; }
    if (!form.email.trim()) { setSaveError('Email is required.'); return; }
    if (!form.mobileNumber.trim()) { setSaveError('Mobile number is required.'); return; }
    if (!form.courseName.trim()) { setSaveError('Course name is required.'); return; }

    try {
      await registerStudent.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobileNumber,
        course: form.courseName,
        category: form.category,
        income: form.annualFamilyIncome,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  };

  const completionColor =
    profileCompletion >= 80
      ? 'text-green-600'
      : profileCompletion >= 50
        ? 'text-yellow-600'
        : 'text-red-500';

  const completionBg =
    profileCompletion >= 80
      ? 'bg-green-500'
      : profileCompletion >= 50
        ? 'bg-yellow-500'
        : 'bg-red-500';

  if (studentLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal and academic information</p>
        </div>
      </div>

      {/* Registered notice */}
      {isExistingStudent && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 text-sm">Profile Registered</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Your student profile is saved on-chain. Contact support if you need to update your details.
            </p>
          </div>
        </div>
      )}

      {/* Profile Completion Meter */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-foreground">Profile Completion</span>
          <span className={`font-bold text-lg ${completionColor}`}>{profileCompletion}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${completionBg}`}
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        {profileCompletion < 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            Complete your profile to improve your scholarship readiness score.
          </p>
        )}
        {profileCompletion === 100 && (
          <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Profile is 100% complete!
          </p>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-foreground text-lg border-b border-border pb-2">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Mobile Number</label>
            <input
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter mobile number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="general">General</option>
              <option value="obc">OBC</option>
              <option value="sc">SC</option>
              <option value="st">ST</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Disability Status</label>
            <select
              name="disabilityStatus"
              value={form.disabilityStatus}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="none">None</option>
              <option value="hearingImpaired">Hearing Impaired</option>
              <option value="sightImpaired">Sight Impaired</option>
              <option value="physicalImpaired">Physical Impaired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Annual Family Income</label>
            <select
              name="annualFamilyIncome"
              value={form.annualFamilyIncome}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="Below 1L">Below ₹1 Lakh</option>
              <option value="1L-2.5L">₹1L – ₹2.5L</option>
              <option value="2.5L-5L">₹2.5L – ₹5L</option>
              <option value="5L-8L">₹5L – ₹8L</option>
              <option value="Above 8L">Above ₹8L</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-foreground text-lg border-b border-border pb-2">Location</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter your state"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">District</label>
            <input
              name="district"
              value={form.district}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter your district"
            />
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-foreground text-lg border-b border-border pb-2">
          Academic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Course Name</label>
            <input
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="e.g. B.Tech Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Course Level</label>
            <select
              name="courseLevel"
              value={form.courseLevel}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="diploma">Diploma</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Institute Name</label>
            <input
              name="instituteName"
              value={form.instituteName}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Enter institute name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Current Year</label>
            <select
              name="currentYear"
              value={form.currentYear}
              onChange={handleChange}
              disabled={isExistingStudent}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button — only shown when no student record exists yet */}
      {!isExistingStudent && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Register Profile
              </>
            )}
          </button>
          {saveSuccess && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Profile registered successfully!
            </span>
          )}
          {saveError && (
            <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> {saveError}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
