import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  public type Student = {
    studentId : Nat;
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
  };

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

  type ApplicationStatus = {
    #draft;
    #submitted;
    #underReview;
    #approved;
    #rejected;
  };

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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let students = Map.empty<Nat, Student>();
  let documents = Map.empty<Nat, DocumentRecord>();
  let scholarships = Map.empty<Nat, Scholarship>();
  let applications = Map.empty<Nat, ScholarshipApplication>();

  var studentCounter = 0;
  var documentCounter = 0;
  var scholarshipCounter = 0;
  var applicationCounter = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Seed data ──────────────────────────────────────────────────────────────

  func seedData() {
    // Seed scholarships (365 days as nanoseconds)
    let ms365Day = 31536000000000000;

    let s0 : Scholarship = {
      id = 0;
      title = "National Merit Scholarship";
      provider = "Ministry of Education";
      deadline = Time.now() + ms365Day; // 1 year from now in nanoseconds
      description = "Merit-based scholarship for undergraduate students from low-income families.";
      requiredDocuments = ["Marksheet", "Income Certificate", "Identity Proof"];
      eligibility = {
        minPercentage = 75.0;
        incomeLimit = 250000;
        category = #general;
        requiredSkills = [];
      };
      incomeLimit = 250000;
      eligibleCategories = ["general", "obc", "sc", "st"];
      eligibleCourseLevels = ["undergraduate"];
      isActive = true;
    };

    let s1 : Scholarship = {
      id = 1;
      title = "SC/ST Excellence Award";
      provider = "Social Welfare Department";
      deadline = Time.now() + 2 * ms365Day; // 2 years from now
      description = "Scholarship for SC/ST students pursuing higher education.";
      requiredDocuments = ["Caste Certificate", "Marksheet", "Income Certificate"];
      eligibility = {
        minPercentage = 60.0;
        incomeLimit = 150000;
        category = #sc;
        requiredSkills = [];
      };
      incomeLimit = 150000;
      eligibleCategories = ["sc", "st"];
      eligibleCourseLevels = ["undergraduate", "postgraduate"];
      isActive = true;
    };

    let s2 : Scholarship = {
      id = 2;
      title = "OBC Empowerment Grant";
      provider = "Backward Classes Commission";
      deadline = Time.now() + 3 * ms365Day; // 3 years from now
      description = "Financial support for OBC students in technical courses.";
      requiredDocuments = ["OBC Certificate", "Marksheet", "Fee Receipt"];
      eligibility = {
        minPercentage = 65.0;
        incomeLimit = 200000;
        category = #obc;
        requiredSkills = [];
      };
      incomeLimit = 200000;
      eligibleCategories = ["obc"];
      eligibleCourseLevels = ["undergraduate", "diploma"];
      isActive = true;
    };

    let s3 : Scholarship = {
      id = 3;
      title = "Girls STEM Scholarship";
      provider = "Science & Technology Foundation";
      deadline = Time.now() + 4 * ms365Day; // 4 years from now
      description = "Encouraging female students to pursue STEM education.";
      requiredDocuments = ["Marksheet", "Identity Proof", "Admission Letter"];
      eligibility = {
        minPercentage = 70.0;
        incomeLimit = 300000;
        category = #general;
        requiredSkills = [];
      };
      incomeLimit = 300000;
      eligibleCategories = ["general", "obc", "sc", "st"];
      eligibleCourseLevels = ["undergraduate", "postgraduate"];
      isActive = true;
    };

    let s4 : Scholarship = {
      id = 4;
      title = "Disability Support Scholarship";
      provider = "Department of Empowerment of Persons with Disabilities";
      deadline = Time.now() + 5 * ms365Day; // 5 years from now
      description = "Support for students with disabilities pursuing any course.";
      requiredDocuments = ["Disability Certificate", "Marksheet", "Income Certificate"];
      eligibility = {
        minPercentage = 50.0;
        incomeLimit = 500000;
        category = #general;
        requiredSkills = [];
      };
      incomeLimit = 500000;
      eligibleCategories = ["general", "obc", "sc", "st"];
      eligibleCourseLevels = ["undergraduate", "postgraduate", "diploma", "phd"];
      isActive = true;
    };

    scholarships.add(0, s0);
    scholarships.add(1, s1);
    scholarships.add(2, s2);
    scholarships.add(3, s3);
    scholarships.add(4, s4);
    scholarshipCounter := 5;

    // Seed dummy students (anonymous principal as placeholder owner)
    let dummyPrincipal = Principal.fromText("2vxsx-fae");

    let st0 : Student = {
      studentId = 0;
      owner = dummyPrincipal;
      fullName = "Arjun Sharma";
      email = "student***@example.com";
      mobileNumber = "98765XXXXX";
      gender = #male;
      category = #general;
      disabilityStatus = #none;
      annualFamilyIncome = "1L-2.5L";
      state = "Maharashtra";
      district = "Pune";
      courseName = "B.Tech Computer Science";
      courseLevel = "undergraduate";
      instituteName = "Fictional Institute of Technology";
      currentYear = 2;
      profileCompletionPercentage = 85;
      createdAt = 1700000000000000000;
      updatedAt = 1700000000000000000;
      academicRecords = [];
      careerAchievements = [];
      documents = [];
    };

    let st1 : Student = {
      studentId = 1;
      owner = dummyPrincipal;
      fullName = "Priya Verma";
      email = "student2***@example.com";
      mobileNumber = "91234XXXXX";
      gender = #female;
      category = #obc;
      disabilityStatus = #none;
      annualFamilyIncome = "2.5L-5L";
      state = "Uttar Pradesh";
      district = "Lucknow";
      courseName = "B.Sc Physics";
      courseLevel = "undergraduate";
      instituteName = "Fictional University of Sciences";
      currentYear = 3;
      profileCompletionPercentage = 70;
      createdAt = 1700000000000000000;
      updatedAt = 1700000000000000000;
      academicRecords = [];
      careerAchievements = [];
      documents = [];
    };

    let st2 : Student = {
      studentId = 2;
      owner = dummyPrincipal;
      fullName = "Ravi Kumar";
      email = "student3***@example.com";
      mobileNumber = "99887XXXXX";
      gender = #male;
      category = #sc;
      disabilityStatus = #none;
      annualFamilyIncome = "Below 1L";
      state = "Bihar";
      district = "Patna";
      courseName = "B.A. Economics";
      courseLevel = "undergraduate";
      instituteName = "Fictional Arts College";
      currentYear = 1;
      profileCompletionPercentage = 60;
      createdAt = 1700000000000000000;
      updatedAt = 1700000000000000000;
      academicRecords = [];
      careerAchievements = [];
      documents = [];
    };

    students.add(0, st0);
    students.add(1, st1);
    students.add(2, st2);
    studentCounter := 3;

    // Seed dummy documents
    let doc0 : DocumentRecord = {
      documentId = 0;
      studentId = 0;
      owner = dummyPrincipal;
      documentName = "10th Marksheet";
      documentType = #Mandatory;
      uploadStatus = true;
      verificationStatus = "Verified";
      fileUrl = "https://example.com/dummy/marksheet0.pdf";
      remarks = "";
      uploadedAt = 1700000000000000000;
    };

    let doc1 : DocumentRecord = {
      documentId = 1;
      studentId = 0;
      owner = dummyPrincipal;
      documentName = "Income Certificate";
      documentType = #Mandatory;
      uploadStatus = true;
      verificationStatus = "Pending";
      fileUrl = "https://example.com/dummy/income0.pdf";
      remarks = "";
      uploadedAt = 1700000000000000000;
    };

    let doc2 : DocumentRecord = {
      documentId = 2;
      studentId = 1;
      owner = dummyPrincipal;
      documentName = "12th Marksheet";
      documentType = #Mandatory;
      uploadStatus = false;
      verificationStatus = "Pending";
      fileUrl = "";
      remarks = "";
      uploadedAt = 0;
    };

    documents.add(0, doc0);
    documents.add(1, doc1);
    documents.add(2, doc2);
    documentCounter := 3;

    // Seed dummy applications
    let app0 : ScholarshipApplication = {
      applicationId = 0;
      studentId = 0;
      scholarshipId = 0;
      owner = dummyPrincipal;
      applicationStatus = "Under Review";
      rejectionReason = "";
      appliedDate = 1700000000000000000;
      lastUpdated = 1700000000000000000;
    };

    let app1 : ScholarshipApplication = {
      applicationId = 1;
      studentId = 1;
      scholarshipId = 2;
      owner = dummyPrincipal;
      applicationStatus = "Approved";
      rejectionReason = "";
      appliedDate = 1700000000000000000;
      lastUpdated = 1700000000000000000;
    };

    let app2 : ScholarshipApplication = {
      applicationId = 2;
      studentId = 2;
      scholarshipId = 1;
      owner = dummyPrincipal;
      applicationStatus = "Rejected";
      rejectionReason = "Income certificate not matching declared income.";
      appliedDate = 1700000000000000000;
      lastUpdated = 1700000000000000000;
    };

    applications.add(0, app0);
    applications.add(1, app1);
    applications.add(2, app2);
    applicationCounter := 3;
  };

  seedData();

  // ── User Profile functions (required by frontend) ──────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Student functions ──────────────────────────────────────────────────────
  public shared ({ caller }) func registerStudent(
    fullName : Text,
    email : Text,
    mobile : Text,
    course : Text,
    category : Text,
    income : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be registered to create students");
    };

    let newStudent : Student = {
      studentId = studentCounter;
      owner = caller;
      fullName;
      email;
      mobileNumber = mobile;
      gender = #male; // TODO: Parameterize (no gender on frontend)
      category = #general;
      disabilityStatus = #none;
      annualFamilyIncome = income;
      state = "India"; // Not used
      district = "India";
      courseName = course;
      courseLevel = category;
      instituteName = course;
      currentYear = 1;
      profileCompletionPercentage = 0;
      createdAt = Time.now();
      updatedAt = Time.now();
      academicRecords = [];
      careerAchievements = [];
      documents = [];
    };
    students.add(studentCounter, newStudent);
    studentCounter += 1;
    newStudent.studentId;
  };

  public query ({ caller }) func getStudent(studentId : Nat) : async ?Student {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get student records");
    };
    switch (students.get(studentId)) {
      case (null) { null };
      case (?student) {
        if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own student record");
        };
        ?student;
      };
    };
  };

  public query ({ caller }) func getMyStudent() : async ?Student {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get student records");
    };
    let allStudents = students.values().toArray();
    var result : ?Student = null;
    for (s in allStudents.vals()) {
      if (s.owner == caller) {
        result := ?s;
      };
    };
    result;
  };

  // ── Document functions ─────────────────────────────────────────────────────
  public shared ({ caller }) func uploadDocument(
    studentId : Nat,
    documentName : Text,
    filePath : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be registered to upload documents");
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
      documentType = #Mandatory; // default
      uploadStatus = true;
      verificationStatus = "Pending";
      fileUrl = filePath;
      remarks = "";
      uploadedAt = Time.now();
    };
    documents.add(documentCounter, newDocument);
    documentCounter += 1;
    "Document uploaded successfully";
  };

  public query ({ caller }) func getDocumentsByStudent(studentId : Nat) : async [DocumentRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get documents");
    };
    // Verify the student belongs to the caller (or caller is admin)
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view documents for your own student record");
        };
      };
    };
    let allDocs = documents.values().toArray();
    allDocs.filter(func(doc : DocumentRecord) : Bool { doc.studentId == studentId });
  };

  // Provided methods

  // Students can update upload status; only admins can update verification status
  public shared ({ caller }) func updateDocumentUploadStatus(
    documentId : Nat,
    uploadStatus : Bool,
    fileUrl : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update document upload status");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?document) {
        if (document.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own documents");
        };
        let updated : DocumentRecord = {
          document with
          uploadStatus;
          fileUrl;
        };
        documents.add(documentId, updated);
      };
    };
  };

  // Admin-only: update verification status
  public shared ({ caller }) func updateDocumentVerificationStatus(
    documentId : Nat,
    verificationStatus : Text,
    remarks : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update document verification status");
    };
    switch (documents.get(documentId)) {
      case (null) { Runtime.trap("Document not found") };
      case (?document) {
        let updated : DocumentRecord = {
          document with
          verificationStatus;
          remarks;
        };
        documents.add(documentId, updated);
      };
    };
  };

  // ── Scholarship functions ──────────────────────────────────────────────────

  // Public read - no auth required
  public query func getScholarships() : async [Scholarship] {
    scholarships.values().toArray();
  };

  public query func getScholarshipById(scholarshipId : Nat) : async ?Scholarship {
    scholarships.get(scholarshipId);
  };

  // Admin-only: create/update scholarships
  public shared ({ caller }) func createScholarship(
    title : Text,
    provider : Text,
    deadline : Int,
    description : Text,
    requiredDocuments : [Text],
    incomeLimit : Nat,
    eligibleCategories : [Text],
    eligibleCourseLevels : [Text],
    isActive : Bool,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create scholarships");
    };
    let newScholarship : Scholarship = {
      id = scholarshipCounter;
      title;
      provider;
      deadline;
      description;
      requiredDocuments;
      eligibility = {
        minPercentage = 0.0;
        incomeLimit;
        category = #general;
        requiredSkills = [];
      };
      incomeLimit;
      eligibleCategories;
      eligibleCourseLevels;
      isActive;
    };
    scholarships.add(scholarshipCounter, newScholarship);
    scholarshipCounter += 1;
    newScholarship.id;
  };

  // ── Application functions ──────────────────────────────────────────────────

  public shared ({ caller }) func createApplication(
    studentId : Nat,
    scholarshipId : Nat,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create applications");
    };
    // Verify the student belongs to the caller
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (student.owner != caller) {
          Runtime.trap("Unauthorized: You can only apply on behalf of your own student record");
        };
      };
    };
    let now = Time.now();
    let newApplication : ScholarshipApplication = {
      applicationId = applicationCounter;
      studentId;
      scholarshipId;
      owner = caller;
      applicationStatus = "Pending";
      rejectionReason = "";
      appliedDate = now;
      lastUpdated = now;
    };
    applications.add(applicationCounter, newApplication);
    applicationCounter += 1;
    newApplication.applicationId;
  };

  public query ({ caller }) func getApplicationsByStudent(studentId : Nat) : async [ScholarshipApplication] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get applications");
    };
    // Verify the student belongs to the caller (or caller is admin)
    switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own applications");
        };
      };
    };
    let allApps = applications.values().toArray();
    allApps.filter(func(app : ScholarshipApplication) : Bool { app.studentId == studentId });
  };

  public query ({ caller }) func getMyApplications() : async [ScholarshipApplication] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get applications");
    };
    let allApps = applications.values().toArray();
    allApps.filter(func(app : ScholarshipApplication) : Bool { app.owner == caller });
  };

  // Admin-only: update application status
  public shared ({ caller }) func updateApplicationStatus(
    applicationId : Nat,
    applicationStatus : Text,
    rejectionReason : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update application status");
    };
    switch (applications.get(applicationId)) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        let updated : ScholarshipApplication = {
          application with
          applicationStatus;
          rejectionReason;
          lastUpdated = Time.now();
        };
        applications.add(applicationId, updated);
      };
    };
  };

  // ── Eligibility Insights ───────────────────────────────────────────────────

  public query ({ caller }) func getEligibilityInsights(studentId : Nat, scholarshipId : Nat) : async EligibilityCheckResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get eligibility insights");
    };

    let student = switch (students.get(studentId)) {
      case (null) { Runtime.trap("Student not found") };
      case (?s) { s };
    };

    // Ownership check
    if (student.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only check eligibility for your own student record");
    };

    let scholarship = switch (scholarships.get(scholarshipId)) {
      case (null) { Runtime.trap("Scholarship not found") };
      case (?s) { s };
    };

    // Parse income from text range (use upper bound for conservative check)
    // Income ranges: "Below 1L"=100000, "1L-2.5L"=250000, "2.5L-5L"=500000, "5L-8L"=800000, "Above 8L"=1000000
    let studentIncomeUpper : Nat = switch (student.annualFamilyIncome) {
      case ("Below 1L") { 100000 };
      case ("1L-2.5L") { 250000 };
      case ("2.5L-5L") { 500000 };
      case ("5L-8L") { 800000 };
      case ("Above 8L") { 1000000 };
      case (_) { 0 };
    };

    let eligibilityStatus = if (studentIncomeUpper > scholarship.incomeLimit) {
      "Not Eligible";
    } else {
      "Eligible";
    };

    // Get student's documents
    let allDocs = documents.values().toArray();
    let studentDocs = allDocs.filter(func(doc : DocumentRecord) : Bool { doc.studentId == studentId });
    let mandatoryDocs = studentDocs.filter(func(doc : DocumentRecord) : Bool { doc.documentType == #Mandatory });

    let hasMissingMandatory = mandatoryDocs.filter(func(doc : DocumentRecord) : Bool { not doc.uploadStatus }).size() > 0;

    let riskLevel = if (hasMissingMandatory) {
      "High";
    } else if (student.profileCompletionPercentage < 80) {
      "Medium";
    } else {
      "Low";
    };

    // Urgent alert: deadline within 3 days (3 * 24 * 60 * 60 * 1_000_000_000 nanoseconds)
    let threeDaysNs : Int = 3 * 24 * 60 * 60 * 1_000_000_000;
    let urgentAlert = (scholarship.deadline - Time.now()) < threeDaysNs;

    // Readiness score: (profileCompletion * 0.4) + (uploadedMandatoryDocs / totalMandatoryDocs * 60)
    let totalMandatory = mandatoryDocs.size();
    let uploadedMandatory = mandatoryDocs.filter(func(doc : DocumentRecord) : Bool { doc.uploadStatus }).size();

    let profilePart : Nat = (student.profileCompletionPercentage * 40) / 100;
    let docPart : Nat = if (totalMandatory == 0) { 60 } else {
      (uploadedMandatory * 60) / totalMandatory;
    };
    let readinessScore : Nat = profilePart + docPart;

    {
      eligibilityStatus;
      riskLevel;
      urgentAlert;
      readinessScore;
      unmetRequirements = [];
      missingDocuments = [];
    };
  };
};
