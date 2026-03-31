import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Student {
    profileCompletionPercentage: bigint;
    instituteName: string;
    documents: Array<DocumentReference>;
    courseLevel: string;
    academicRecords: Array<AcademicRecord>;
    owner: Principal;
    disabilityStatus: DisabilityStatus;
    createdAt: bigint;
    profileId: bigint;
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
export interface DocumentReference {
    documentType: string;
    uploadStatus: boolean;
    fileName: string;
}
export interface DocumentVerificationResult {
    status: Variant_V2_Approved_Rejected_Pending;
    updatedTimestamp: bigint;
    reason: string;
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
export interface UserProfile {
    name: string;
    email: string;
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
export enum Variant_V2_Approved_Rejected_Pending {
    V2 = "V2",
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cleanDemoStudents(): Promise<string>;
    connectDigiLocker(studentId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<Student | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Load demo students (admin-only).
     */
    loadDemoStudents(): Promise<void>;
    registerStudent(fullName: string, email: string, mobileNumber: string, gender: Gender, category: Category, disabilityStatus: DisabilityStatus, annualFamilyIncome: string, state: string, district: string, courseName: string, courseLevel: string, instituteName: string, currentYear: bigint): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setFast2SmsApiKey(key: string): Promise<void>;
    sendPhoneOtp(phone: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyPhoneOtp(phone: string, code: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    uploadDocument(studentId: bigint, documentName: string, filePath: string): Promise<string>;
    verifyDocument(studentId: bigint, documentType: string, ocrText: string): Promise<DocumentVerificationResult>;
}
