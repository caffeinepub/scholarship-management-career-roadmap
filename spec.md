# Specification

## Summary
**Goal:** Implement student registration and document upload functionality in the Motoko backend actor, and wire the frontend React Query hooks to use these new backend methods.

**Planned changes:**
- Extend the `Student` type in `backend/main.mo` to include `full_name`, `email`, `mobile`, `course`, `category`, and `income` fields
- Add a `registerStudent` update call that stores a new student record and returns the generated student ID
- Add a `DocumentRecord` type with `student_id`, `document_name`, `file_path`, and `upload_status` fields
- Add an `uploadDocument` update call that stores a document linked to a student, sets `upload_status` to "Uploaded", and returns a success message
- Add a query to retrieve documents by `student_id`
- Update `useRegisterStudent` mutation in `useQueries.ts` to call the backend `registerStudent` actor method
- Update `useUploadDocument` mutation in `useQueries.ts` to call the backend `uploadDocument` actor method
- Invalidate React Query cache after successful mutations so lists refresh automatically

**User-visible outcome:** Students can be registered via the Profile page and documents can be uploaded via the Documents page, with all data persisted in the ICP Motoko backend actor.
