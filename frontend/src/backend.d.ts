import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
}
export interface DocumentRecord {
    documentName: string;
    documentType: DocumentType;
    studentId: bigint;
    uploadStatus: boolean;
    owner: Principal;
    documentId: bigint;
    remarks: string;
    verificationStatus: string;
    uploadedAt: bigint;
    fileUrl: string;
}
export interface ScholarshipApplication {
    studentId: bigint;
    applicationId: bigint;
    owner: Principal;
    rejectionReason: string;
    lastUpdated: bigint;
    applicationStatus: string;
    appliedDate: bigint;
    scholarshipId: bigint;
}
export interface CareerAchievement {
    duration: string;
    role: string;
    employer: string;
    skills: Array<string>;
}
export interface AcademicRecord {
    marksheetRef?: string;
    institution: string;
    year: bigint;
    degree: string;
    percentage: number;
}
export interface DocumentReference {
    documentType: string;
    uploadStatus: boolean;
    fileName: string;
}
export interface Scholarship {
    id: bigint;
    title: string;
    provider: string;
    requiredDocuments: Array<string>;
    eligibleCategories: Array<string>;
    description: string;
    deadline: bigint;
    isActive: boolean;
    eligibility: {
        category: Category;
        requiredSkills: Array<string>;
        minPercentage: number;
        incomeLimit: bigint;
    };
    incomeLimit: bigint;
    eligibleCourseLevels: Array<string>;
}
export interface EligibilityCheckResult {
    missingDocuments: Array<string>;
    eligibilityStatus: string;
    readinessScore: bigint;
    unmetRequirements: Array<string>;
    riskLevel: string;
    urgentAlert: boolean;
}
export interface Student {
    profileCompletionPercentage: bigint;
    instituteName: string;
    documents: Array<DocumentReference>;
    studentId: bigint;
    courseLevel: string;
    academicRecords: Array<AcademicRecord>;
    owner: Principal;
    disabilityStatus: DisabilityStatus;
    createdAt: bigint;
    fullName: string;
    mobileNumber: string;
    careerAchievements: Array<CareerAchievement>;
    email: string;
    district: string;
    updatedAt: bigint;
    state: string;
    currentYear: bigint;
    gender: Gender;
    category: Category;
    courseName: string;
    annualFamilyIncome: string;
}
export enum Category {
    sc = "sc",
    st = "st",
    obc = "obc",
    general = "general"
}
export enum DisabilityStatus {
    none = "none",
    hearingImpaired = "hearingImpaired",
    physicalImpaired = "physicalImpaired",
    sightImpaired = "sightImpaired"
}
export enum DocumentType {
    Mandatory = "Mandatory",
    Conditional = "Conditional",
    Optional = "Optional"
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createApplication(studentId: bigint, scholarshipId: bigint): Promise<bigint>;
    createScholarship(title: string, provider: string, deadline: bigint, description: string, requiredDocuments: Array<string>, incomeLimit: bigint, eligibleCategories: Array<string>, eligibleCourseLevels: Array<string>, isActive: boolean): Promise<bigint>;
    getApplicationsByStudent(studentId: bigint): Promise<Array<ScholarshipApplication>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDocumentsByStudent(studentId: bigint): Promise<Array<DocumentRecord>>;
    getEligibilityInsights(studentId: bigint, scholarshipId: bigint): Promise<EligibilityCheckResult>;
    getMyApplications(): Promise<Array<ScholarshipApplication>>;
    getMyStudent(): Promise<Student | null>;
    getScholarshipById(scholarshipId: bigint): Promise<Scholarship | null>;
    getScholarships(): Promise<Array<Scholarship>>;
    getStudent(studentId: bigint): Promise<Student | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerStudent(fullName: string, email: string, mobile: string, course: string, category: string, income: string): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateApplicationStatus(applicationId: bigint, applicationStatus: string, rejectionReason: string): Promise<void>;
    updateDocumentUploadStatus(documentId: bigint, uploadStatus: boolean, fileUrl: string): Promise<void>;
    updateDocumentVerificationStatus(documentId: bigint, verificationStatus: string, remarks: string): Promise<void>;
    uploadDocument(studentId: bigint, documentName: string, filePath: string): Promise<string>;
}
