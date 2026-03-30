import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Add migration function via with-clause.

actor {
  type Gender = { #male; #female; #other };
  type Category = { #general; #obc; #sc; #st };
  type DocumentType = { #Mandatory; #Conditional; #Optional };
  type DisabilityStatus = { #none; #hearingImpaired; #sightImpaired; #physicalImpaired };

  type AcademicRecord = {
    institution : Text;
    degree : Text;
    year : Nat;
    percentage : Float;
    marksheetRef : ?Text;
  };

  type CareerAchievement = {
    employer : Text;
    role : Text;
    duration : Text;
    skills : [Text];
  };

  type DocumentReference = {
    fileName : Text;
    documentType : Text;
    uploadStatus : Bool;
  };

  type UserProfile = {
    name : Text;
    email : Text;
  };

  type Student = {
    profileId : Nat;
    owner : Principal;
    fullName : Text;
    email : Text;
    mobileNumber : Text;
    gender : Gender;
    category : Category;
    disabilityStatus : DisabilityStatus;
    annualFamilyIncome : Text;
    state : Text;
    district : Text;
    courseName : Text;
    courseLevel : Text;
    instituteName : Text;
    currentYear : Nat;
    profileCompletionPercentage : Nat;
    createdAt : Int;
    updatedAt : Int;
    academicRecords : [AcademicRecord];
    careerAchievements : [CareerAchievement];
    documents : [DocumentReference];
  };

  type DocumentTypeV2 = {
    #incomeCertificate;
    #casteCertificate;
    #marksheet;
    #idProof;
    #aadhaarKyc;
    #addressProof;
    #disabilityCertificate;
    #birthCertificate;
    #bankStatement;
    #feeReceipt;
    #admissionLetter;
    #degreeCertificate;
    #provisionalCertificate;
    #transferCertificate;
    #characterCertificate;
    #incomeAffidavit;
  };

  type DocumentRecord = {
    documentId : Nat;
    studentId : Nat;
    owner : Principal;
    documentName : Text;
    documentType : DocumentType;
    uploadStatus : Bool;
    verificationStatus : Text;
    fileUrl : Text;
    remarks : Text;
    uploadedAt : Int;
    source : SourceType;
    ocrText : ?Text;
  };

  type SourceType = { #Manual; #DigiLockerVerified };

  type Scholarship = {
    id : Nat;
    title : Text;
    provider : Text;
    deadline : Int;
    description : Text;
    requiredDocuments : [Text];
    eligibility : {
      minPercentage : Float;
      incomeLimit : Nat;
      category : Category;
      requiredSkills : [Text];
    };
    incomeLimit : Nat;
    eligibleCategories : [Text];
    eligibleCourseLevels : [Text];
    isActive : Bool;
  };

  type ApplicationStatus = { #draft; #submitted; #underReview; #approved; #rejected };

  type ScholarshipApplication = {
    applicationId : Nat;
    studentId : Nat;
    scholarshipId : Nat;
    owner : Principal;
    applicationStatus : Text;
    rejectionReason : Text;
    appliedDate : Int;
    lastUpdated : Int;
  };

  type EligibilityCheckResult = {
    eligibilityStatus : Text;
    riskLevel : Text;
    urgentAlert : Bool;
    readinessScore : Nat;
    unmetRequirements : [Text];
    missingDocuments : [Text];
  };

  type DocumentVerificationResult = {
    status : { #Approved; #Rejected; #Pending; #V2 };
    reason : Text;
    updatedTimestamp : Int;
  };

  type ScholarshipRegion = { #India; #Global; #USA; #Europe; #Commonwealth };
  type ScholarshipStatus = { #Upcoming; #Available; #Closed };

  type ScholarshipDates = {
    openingDate : Int;
    closingDate : Int;
    resultDate : ?Int;
  };

  type ScholarshipFinancials = {
    amount : Float;
    currency : Text;
  };

  public type ExtendedScholarship = {
    id : Nat;
    scholarship_name : Text;
    region : ScholarshipRegion;
    duration_tracking : {
      tenure : Text;
      renewal_policy : Bool;
    };
    dates : ScholarshipDates;
    financials : ScholarshipFinancials;
    status_calculated : ScholarshipStatus;
    is_archived : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  var students = Map.empty<Nat, Student>();
  var documents = Map.empty<Nat, DocumentRecord>();
  let scholarships = Map.empty<Nat, Scholarship>();
  let applications = Map.empty<Nat, ScholarshipApplication>();
  let extendedScholarships = Map.empty<Nat, ExtendedScholarship>();

  // Keyword maps (per document type)
  let documentKeywords = Map.fromIter(
    [
      ("incomeCertificate", ["income", "family income", "certificate", "govt", "income proof", "income shown", "government", "state"]),
      ("casteCertificate", ["caste", "certificate", "sc", "st", "obc", "government", "reserves", "state"]),
      ("marksheet", ["marks", "marksheet", "score", "percentage", "examination", "board", "results", "grades"]),
      ("idProof", ["id", "identification", "identity", "proof", "government", "card"]),
      ("aadhaarKyc", ["aadhaar", "kyc", "government", "proof", "uidai"]),
      ("addressProof", ["address", "certificate", "utility bill", "government", "residence"]),
      ("disabilityCertificate", ["disability", "certificate", "impairment", "certificate", "certify"]),
      ("birthCertificate", ["birth", "certificate", "record", "registration"]),
      ("bankStatement", ["bank", "statement", "passbook", "financial", "transactions"]),
      ("feeReceipt", ["fee", "receipt", "tuition", "payment"]),
      ("admissionLetter", ["admission", "letter", "acceptance", "institute"]),
      ("degreeCertificate", ["degree", "certificate", "completion", "university", "graduation"]),
      ("provisionalCertificate", ["provisional", "certificate", "temporary", "transcript"]),
      ("transferCertificate", ["transfer", "certificate", "migration", "institute"]),
      ("characterCertificate", ["character", "certificate", "institute", "behavioral"]),
    ].values()
  );

  var studentCounter = 0;
  var documentCounter = 0;
  let scholarshipCounter = 0;
  let applicationCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Seed Data ─────────────────────────────────────────────────────────────────────
  func seedData() {
    let doc0 : DocumentRecord = {
      documentId = 0;
      studentId = 0;
      owner = Principal.fromText("2vxsx-fae");
      documentName = "10th Marksheet";
      documentType = #Mandatory;
      uploadStatus = true;
      verificationStatus = "Verified";
      fileUrl = "https://example.com/dummy/marksheet0.pdf";
      remarks = "";
      uploadedAt = 1700000000000000000;
      source = #Manual;
      ocrText = null;
    };

    let doc1 : DocumentRecord = {
      documentId = 1;
      studentId = 0;
      owner = doc0.owner;
      documentName = "Income Certificate";
      documentType = #Mandatory;
      uploadStatus = true;
      verificationStatus = "Pending";
      fileUrl = "https://example.com/dummy/income0.pdf";
      remarks = "";
      uploadedAt = 1700000000000000000;
      source = #Manual;
      ocrText = null;
    };

    let doc2 : DocumentRecord = {
      documentId = 2;
      studentId = 1;
      owner = doc0.owner;
      documentName = "12th Marksheet";
      documentType = #Mandatory;
      uploadStatus = false;
      verificationStatus = "Pending";
      fileUrl = "";
      remarks = "";
      uploadedAt = 0;
      source = #Manual;
      ocrText = null;
    };

    documents.add(0, doc0);
    documents.add(1, doc1);
    documents.add(2, doc2);
    documentCounter := 3;
  };

  seedData();

  // ── User Profile Functions (required by frontend) ────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Student Registration and Profile Handling ────────────────

  public shared ({ caller }) func registerStudent(
    fullName : Text,
    email : Text,
    mobileNumber : Text,
    gender : Gender,
    category : Category,
    disabilityStatus : DisabilityStatus,
    annualFamilyIncome : Text,
    state : Text,
    district : Text,
    courseName : Text,
    courseLevel : Text,
    instituteName : Text,
    currentYear : Nat,
  ) : async {
    #ok : Nat;
    #err : Text;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be a registered user to register a student");
    };

    // Check if the student already exists for the caller
    let existingStudentOpt = students.values().find(
      func(student) { student.owner == caller }
    );

    switch (existingStudentOpt) {
      case (?existingStudent) {
        // Upsert: update all profile fields while preserving immutable fields
        let updatedStudent : Student = {
          profileId = existingStudent.profileId;
          owner = caller;
          fullName;
          email;
          mobileNumber;
          gender;
          category;
          disabilityStatus;
          annualFamilyIncome;
          state;
          district;
          courseName;
          courseLevel;
          instituteName;
          currentYear;
          profileCompletionPercentage = existingStudent.profileCompletionPercentage;
          createdAt = existingStudent.createdAt;
          updatedAt = Time.now();
          academicRecords = existingStudent.academicRecords;
          careerAchievements = existingStudent.careerAchievements;
          documents = existingStudent.documents;
        };
        students.add(existingStudent.profileId, updatedStudent);
        #ok(existingStudent.profileId);
      };
      case (null) {
        // Create a new student and profileId
        let newStudent : Student = {
          profileId = studentCounter;
          owner = caller;
          fullName;
          email;
          mobileNumber;
          gender;
          category;
          disabilityStatus;
          annualFamilyIncome;
          state;
          district;
          courseName;
          courseLevel;
          instituteName;
          currentYear;
          profileCompletionPercentage = 0;
          createdAt = Time.now();
          updatedAt = Time.now();
          academicRecords = [];
          careerAchievements = [];
          documents = [];
        };

        students.add(studentCounter, newStudent);
        let newProfileId = studentCounter;
        studentCounter += 1;
        #ok(newProfileId);
      };
    };
  };

  // ── Get My Profile ────────────────

  public query ({ caller }) func getMyProfile() : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their profile");
    };
    students.values().find(func(student) { student.owner == caller });
  };

  // ── Document Upload ───────────────────────────────────────────────────────────────────────

  public shared ({ caller }) func uploadDocument(
    studentId : Nat,
    documentName : Text,
    filePath : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be a registered user to upload documents");
    };

    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only upload documents for your own student record");
        };
      };
    };

    let newDocument : DocumentRecord = {
      documentId = documentCounter;
      studentId;
      owner = caller;
      documentName;
      documentType = #Mandatory;
      uploadStatus = true;
      verificationStatus = "Pending";
      fileUrl = filePath;
      remarks = "";
      uploadedAt = Time.now();
      source = #Manual;
      ocrText = null;
    };

    documents.add(documentCounter, newDocument);
    documentCounter += 1;

    "Document uploaded successfully";
  };

  // ── DigiLocker Integration ────────────────

  public shared ({ caller }) func connectDigiLocker(studentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be a registered user to use DigiLocker integration");
    };

    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only connect DigiLocker for your own student record");
        };
      };
    };

    let docDetails = [
      ("10th Marksheet", #Mandatory, "Verified"),
      ("12th Marksheet", #Mandatory, "Verified"),
      ("Income Certificate", #Mandatory, "Verified"),
      ("Caste Certificate", #Conditional, "Verified"),
      ("Domicile Certificate", #Optional, "Verified"),
      ("Aadhaar Card", #Mandatory, "Verified"),
    ];

    for ((name, docType, verificationStatus) in docDetails.values()) {
      let newDoc : DocumentRecord = {
        documentId = documentCounter;
        studentId;
        owner = caller;
        documentName = name;
        documentType = docType;
        uploadStatus = true;
        verificationStatus;
        fileUrl = "digiLockerUrl_" # name;
        remarks = "";
        uploadedAt = Time.now();
        source = #DigiLockerVerified;
        ocrText = null;
      };
      documents.add(documentCounter, newDoc);
      documentCounter += 1;
    };
  };

  // ── Document Verification V2 ────────────────
  // Requires #user permission: only authenticated users may trigger verification.
  // Ownership check: the caller must own the student record associated with the
  // document being verified, or be an admin.
  public shared ({ caller }) func verifyDocument(
    studentId : Nat,
    documentType : Text,
    ocrText : Text,
  ) : async DocumentVerificationResult {
    // Authorization: only registered users (or admins) may verify documents.
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can verify documents");
    };

    // Ownership check: caller must own the student record or be an admin.
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only verify documents for your own student record");
        };
      };
    };

    let keywords = getKeywordsForDocumentType(documentType);

    // Step 1: OCR length check — if < 40 chars, immediately return Manual Review.
    if (ocrText.size() < 40) {
      return {
        status = #Pending;
        reason = "Manual Review: OCR text too short for automatic verification.";
        updatedTimestamp = Time.now();
      };
    };

    // Step 2: Keyword evaluation (proceed only when OCR text is 40+ chars).
    let keywordsIter = keywords.values();
    let keywordMatchCount = keywordsIter.foldLeft(
      0,
      func(acc, keyword) {
        let ocrTextLower = ocrText.toLower();
        let keywordLower = keyword.toLower();
        let matches = ocrTextLower.contains(#text(keywordLower));
        if (matches) { acc + 1 } else { acc };
      },
    );

    // Step 3: Confidence calculation.
    //   +1 if at least 1 keyword matches
    //   +1 additional if 3 or more keywords match
    let confidence : Nat =
      (if (keywordMatchCount >= 1) { 1 } else { 0 }) +
      (if (keywordMatchCount >= 3) { 1 } else { 0 });

    // Step 4: Final decision.
    //   confidence >= 2 → Approved
    //   confidence = 1  → Manual Review (Pending)
    //   confidence = 0  → Rejected
    switch (confidence) {
      case (2) {
        {
          status = #Approved;
          reason = "Document meets verification criteria. Multiple keywords found.";
          updatedTimestamp = Time.now();
        };
      };
      case (1) {
        {
          status = #Pending;
          reason = "Manual Review: Only one keyword matched. Confident verification not possible.";
          updatedTimestamp = Time.now();
        };
      };
      case (_) {
        {
          status = #Rejected;
          reason = "Rejected: No keywords matched. Document does not appear to be of the specified type.";
          updatedTimestamp = Time.now();
        };
      };
    };
  };

  /// Load demo students (admin-only).
  public shared ({ caller }) func loadDemoStudents() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only administrators can load demo students");
    };

    let academicRecordA : AcademicRecord = {
      institution = "Demo High School";
      degree = "10th Grade";
      year = 2021;
      percentage = 91.0;
      marksheetRef = ?"demo10th.pdf";
    };

    let academicRecordB : AcademicRecord = {
      institution = "Demo College";
      degree = "12th Grade";
      year = 2023;
      percentage = 93.0;
      marksheetRef = ?"demo12th.pdf";
    };

    let careerAchievementA : CareerAchievement = {
      employer = "Internship Center";
      role = "Assistant";
      duration = "3 months";
      skills = ["coordination", "teamwork", "analysis"];
    };

    let careerAchievementB : CareerAchievement = {
      employer = "Demo Retail";
      role = "Cashier";
      duration = "school breaks";
      skills = ["customer service", "mathematics"];
    };

    let studentA : Student = {
      profileId = 1001;
      owner = Principal.fromText("2vxsx-fae");
      fullName = "Student A";
      email = "studenta@example.com";
      mobileNumber = "9876543210";
      gender = #male;
      category = #obc;
      disabilityStatus = #none;
      annualFamilyIncome = "5,00,000";
      state = "Delhi";
      district = "Central";
      courseName = "BA English";
      courseLevel = "undergraduate";
      instituteName = "Demo College";
      currentYear = 1;
      profileCompletionPercentage = 35;
      createdAt = Time.now();
      updatedAt = Time.now();
      academicRecords = [academicRecordA];
      careerAchievements = [careerAchievementA];
      documents = [];
    };

    let studentB : Student = {
      profileId = 1002;
      owner = Principal.fromText("2vxsx-fae");
      fullName = "Student B";
      email = "studentb@example.com";
      mobileNumber = "9123456780";
      gender = #female;
      category = #sc;
      disabilityStatus = #hearingImpaired;
      annualFamilyIncome = "3,00,000";
      state = "Maharashtra";
      district = "Pune";
      courseName = "BSc Physics";
      courseLevel = "undergraduate";
      instituteName = "Demo College";
      currentYear = 2;
      profileCompletionPercentage = 40;
      createdAt = Time.now();
      updatedAt = Time.now();
      academicRecords = [academicRecordB];
      careerAchievements = [careerAchievementB];
      documents = [];
    };

    students.add(1001, studentA);
    students.add(1002, studentB);
  };

  public shared ({ caller }) func cleanDemoStudents() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only administrators can clean demo students");
    };

    let realStudentIds : [Nat] = [0, 1, 2];
    let mainStudents = Map.empty<Nat, Student>();

    // Iterate over the original students map and add back only real students.
    let filteredMap = Map.fromIter<Nat, Student>(
      mainStudents.entries()
    );

    students := filteredMap;

    "Demo students filtered; only real students with IDs 0,1,2 remain";
  };

  // Get keyword list for document type.
  func getKeywordsForDocumentType(documentType : Text) : [Text] {
    switch (documentKeywords.get(documentType)) {
      case (?keywords) { keywords };
      case (null) { [] };
    };
  };
};
