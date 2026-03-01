# Specification

## Summary
**Goal:** Build the initial version of ScholarPath Portal — a scholarship management and career roadmap platform on the Internet Computer with a Motoko backend and a React frontend.

**Planned changes:**

### Backend (Motoko — single actor in backend/main.mo)
- Store and manage a Master User Record per user principal: personal info, academic history, career achievements, and document references (filename, type, isUploaded flag)
- Expose get/update functions for each profile section (personal, academic, career, documents)
- Store a scholarship catalog with id, title, provider, deadline, description, required documents, and eligibility criteria; expose list, search/filter, and get-by-id functions
- Implement scholarship application tracking: create application records per user per scholarship with status (Draft, Submitted, Under Review, Approved, Rejected); expose status update and user application list functions
- Implement an eligibility check function that compares a user's profile against a scholarship's criteria and returns `isEligible`, a `missingRequirements` list, and a `missingDocuments` list
- Implement an auto-fill function that maps user profile fields to a scholarship's application form fields and returns a pre-populated form object
- Implement a profile completion score function returning a 0–100 numeric score and a list of human-readable missing field labels

### Frontend
- **Student Dashboard:** top navbar (with language toggle), sidebar navigation (Dashboard, Scholarships, My Applications, Resume Builder, Documents, Profile), and a main content area with summary cards (Profile Completion, Active Applications, Upcoming Deadlines, Scholarships Matched)
- **Profile Completion Meter:** circular SVG progress bar showing percentage inside; arc color is red (0–40%), amber (41–79%), green (80–100%); hover/tap tooltip lists missing items
- **Skill Gap Analysis widget:** two-column display of user skills vs. top matched scholarship's required skills, with green check (matched) and red alert (missing) icons
- **Scholarship Search & Browse page:** search bar, filter controls (category, deadline range, provider), card grid showing title, provider, deadline, description, Apply Now button, and eligibility badge (Eligible/Check Eligibility)
- **Scholarship Application detail page:** scholarship info, eligibility summary, document checklist, pre-filled application form with "Auto-Fill from Profile" button, and submit button gated on required documents being uploaded
- **Document Checklist component:** reusable list of required documents per scholarship; uploaded docs show green check + filename; missing docs show red alert + Upload button; used on Application page and standalone Documents section
- **Resume Builder page:** two tabs (Academic Details, Career Details) with respective form fields, "Auto-Fill from Profile" button per tab, and "Save to Profile" button with validation
- **Multilingual toggle (EN/HI):** navbar button switching all visible UI text between English and Hindi via a dedicated i18n module; selected language persisted in localStorage
- **FAQ/Help Chatbot widget:** floating button on all pages; chat interface using a predefined JSON knowledge base with keyword matching for English and Hinglish queries; responses include answer text and a clickable internal page link; fallback message when no match is found
- **Visual theme:** deep teal primary + saffron accent color scheme via Tailwind config; institutional/government-portal aesthetic; card-based layouts with shadows; consistent color-coded status indicators (green/amber/red)

**User-visible outcome:** Students can log in, build a comprehensive profile (academic + career), browse and search scholarships, check eligibility with skill gap analysis, auto-fill and submit applications, track application status, manage required documents with a visual checklist, build a resume, and get help via a Hinglish-capable chatbot — all within a cohesive bilingual (English/Hindi) portal.
