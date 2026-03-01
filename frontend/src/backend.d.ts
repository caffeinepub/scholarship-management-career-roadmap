import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DocumentReference {
    documentType: string;
    uploadStatus: boolean;
    fileName: string;
}
export interface MasterUserRecord {
    dob: string;
    documents: Array<DocumentReference>;
    academics: Array<AcademicRecord>;
    name: string;
    email: string;
    gender: Gender;
    category: Category;
    career: Array<CareerAchievement>;
}
export interface Scholarship {
    id: bigint;
    title: string;
    provider: string;
    requiredDocuments: Array<string>;
    description: string;
    deadline: string;
    eligibility: {
        category: Category;
        requiredSkills: Array<string>;
        minPercentage: number;
        incomeLimit: bigint;
    };
}
export interface CareerAchievement {
    duration: string;
    role: string;
    employer: string;
    skills: Array<string>;
}
export interface EligibilityCheckResult {
    missingDocuments: Array<string>;
    isEligible: boolean;
    unmetRequirements: Array<string>;
}
export interface AcademicRecord {
    marksheetRef?: string;
    institution: string;
    year: bigint;
    degree: string;
    percentage: number;
}
export interface ProfileCompletionResult {
    completionPercentage: number;
    missingFields: Array<string>;
}
export interface ScholarshipApplication {
    status: ApplicationStatus;
    userId: Principal;
    filledFields: MasterUserRecord;
    scholarshipId: bigint;
}
export enum ApplicationStatus {
    submitted = "submitted",
    underReview = "underReview",
    approved = "approved",
    rejected = "rejected",
    draft = "draft"
}
export enum Category {
    sc = "sc",
    st = "st",
    obc = "obc",
    general = "general"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Apply to a scholarship. Requires #user role.
     */
    applyToScholarship(scholarshipId: bigint, application: ScholarshipApplication): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Return a pre-populated application form from the user's Master User Record.
     * / Caller must be the owner of the record or an admin, because this exposes
     * / private personal, academic, and career data.
     */
    autoFillApplication(scholarshipId: bigint, user: Principal): Promise<MasterUserRecord | null>;
    /**
     * / Check eligibility of a user for a scholarship.
     * / Caller must be the owner of the record or an admin, because the result
     * / exposes private academic and career data.
     */
    checkEligibility(scholarshipId: bigint, user: Principal): Promise<EligibilityCheckResult>;
    /**
     * / Create a new scholarship. Admin only.
     */
    createScholarship(scholarship: Scholarship): Promise<bigint>;
    /**
     * / Get the calling user's own Master User Record.
     */
    getCallerUserProfile(): Promise<MasterUserRecord | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Calculate the profile completion score for a user.
     * / Caller must be the owner of the record or an admin, because the result
     * / reveals which private fields are missing.
     */
    getProfileCompletion(user: Principal): Promise<ProfileCompletionResult>;
    /**
     * / Get a single scholarship by id. Public — no auth required.
     */
    getScholarship(id: bigint): Promise<Scholarship>;
    /**
     * / Retrieve all applications for a user. Caller must be the owner or an admin.
     */
    getUserApplications(user: Principal): Promise<Array<ScholarshipApplication>>;
    /**
     * / Fetch another user's profile. Caller must be the owner or an admin.
     */
    getUserProfile(user: Principal): Promise<MasterUserRecord | null>;
    /**
     * / Retrieve a user record. Caller must be the owner or an admin.
     */
    getUserRecord(user: Principal): Promise<MasterUserRecord | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all scholarships. Public — no auth required.
     */
    listScholarships(): Promise<Array<Scholarship>>;
    /**
     * / Save/update the calling user's own Master User Record.
     */
    saveCallerUserProfile(record: MasterUserRecord): Promise<void>;
    /**
     * / Update the calling user's own Master User Record.
     */
    updateUserRecord(record: MasterUserRecord): Promise<void>;
}
