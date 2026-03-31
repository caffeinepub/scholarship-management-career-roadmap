# ScholarSync — Demo Scholarship Auto-Apply + Login/Logout Fix

## Current State
- Platform is a full scholarship management app with profile, documents, scholarships, chatbot, roadmap
- Scholarships page shows cards from static data with a detail modal + redirect to external site
- Login page still has "ScholarPath" branding in several places
- Several components (RedirectWarningModal, ProfileSetupModal, DigiLockerFlowModal, Help, ChatbotWidget, Roadmap, i18n/translations.ts) still say "ScholarPath" instead of "ScholarSync"
- Login page only offers Internet Identity; AuthModal exists but not wired to login page
- Logout is functional in DashboardLayout but login page doesn't show demo OTP login option
- Documents are stored only in component-level state (not persisted to localStorage)

## Requested Changes (Diff)

### Add
- New page: `ScholarshipApplyPage.tsx` at route `/apply/future-leaders`
  - Auto-fills from `scholarSync_profile` / `studentProfile` localStorage: name, email, phone, education details
  - Auto-fills documents section from `scholarSync_documents` localStorage (Aadhaar, Marksheet, Income Certificate)
  - Shows banner: "Your details and documents have been auto-filled"
  - All fields are editable
  - Submit button shows toast: "Application submitted successfully" and saves to `scholarSync_applications` localStorage
- Demo scholarship card "Future Leaders Scholarship" on Scholarships page (featured section at top)
  - Apply button navigates to `/apply/future-leaders`
- AuthModal wired to LoginPage as "Login with Mobile OTP" option (on OTP success, set localStorage token and redirect to /)
- Save documents to `scholarSync_documents` localStorage key when DigiLocker connects

### Modify
- LoginPage.tsx: fix all "ScholarPath" → "ScholarSync" references
- RedirectWarningModal.tsx: fix "ScholarPath" → "ScholarSync"
- ProfileSetupModal.tsx: fix "ScholarPath" → "ScholarSync"
- DigiLockerFlowModal.tsx: fix "ScholarPath" → "ScholarSync"; on success save documents to localStorage
- ChatbotWidget.tsx: fix "ScholarPath" → "ScholarSync"
- Roadmap.tsx: fix "ScholarPath" → "ScholarSync"
- Help.tsx: fix "ScholarPath" → "ScholarSync"
- i18n/translations.ts: fix "ScholarPath" → "ScholarSync"
- App.tsx: add route `/apply/future-leaders`

### Remove
- Nothing removed

## Implementation Plan
1. Create `ScholarshipApplyPage.tsx` — reads profile from localStorage, reads docs from localStorage, shows auto-fill banner, editable form, submit success
2. Add route in App.tsx for the apply page
3. Add "Future Leaders Scholarship" featured card to top of Scholarships.tsx with Apply button that navigates to `/apply/future-leaders`
4. Wire AuthModal to LoginPage — add "Login with Mobile OTP" button, on OTP success set token and navigate to /
5. Update DigiLockerFlowModal to save fetched docs to `scholarSync_documents` localStorage
6. Replace all "ScholarPath" occurrences with "ScholarSync" across: LoginPage, RedirectWarningModal, ProfileSetupModal, DigiLockerFlowModal, ChatbotWidget, Roadmap, Help, translations.ts
