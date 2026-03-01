import Text "mo:core/Text";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Gender = {
    #male;
    #female;
    #other;
  };

  type Category = { #general; #obc; #sc; #st };

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

  public type MasterUserRecord = {
    name : Text;
    email : Text;
    dob : Text;
    gender : Gender;
    category : Category;
    academics : [AcademicRecord];
    career : [CareerAchievement];
    documents : [DocumentReference];
  };

  type Scholarship = {
    id : Nat;
    title : Text;
    provider : Text;
    deadline : Text;
    description : Text;
    requiredDocuments : [Text];
    eligibility : {
      minPercentage : Float;
      incomeLimit : Nat;
      category : Category;
      requiredSkills : [Text];
    };
  };

  type ApplicationStatus = {
    #draft;
    #submitted;
    #underReview;
    #approved;
    #rejected;
  };

  type ScholarshipApplication = {
    userId : Principal;
    scholarshipId : Nat;
    status : ApplicationStatus;
    filledFields : MasterUserRecord;
  };

  type EligibilityCheckResult = {
    isEligible : Bool;
    unmetRequirements : [Text];
    missingDocuments : [Text];
  };

  type ProfileCompletionResult = {
    completionPercentage : Float;
    missingFields : [Text];
  };

  let users = Map.empty<Principal, MasterUserRecord>();
  let scholarships = Map.empty<Nat, Scholarship>();
  let applications = Map.empty<Principal, List.List<ScholarshipApplication>>();

  var scholarshipCounter = 0;

  // Initialize authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // -----------------------------------------------------------------------
  // Required profile functions (getCallerUserProfile, saveCallerUserProfile,
  // getUserProfile) as mandated by the instructions.
  // -----------------------------------------------------------------------

  /// Get the calling user's own Master User Record.
  public query ({ caller }) func getCallerUserProfile() : async ?MasterUserRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    users.get(caller);
  };

  /// Save/update the calling user's own Master User Record.
  public shared ({ caller }) func saveCallerUserProfile(record : MasterUserRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profile");
    };
    users.add(caller, record);
  };

  /// Fetch another user's profile. Caller must be the owner or an admin.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?MasterUserRecord {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // -----------------------------------------------------------------------
  // User Management (legacy / additional endpoints)
  // -----------------------------------------------------------------------

  /// Update the calling user's own Master User Record.
  public shared ({ caller }) func updateUserRecord(record : MasterUserRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Access Denied: Only registered users may update their own records.");
    };
    users.add(caller, record);
  };

  /// Retrieve a user record. Caller must be the owner or an admin.
  public query ({ caller }) func getUserRecord(user : Principal) : async ?MasterUserRecord {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Access Denied: Only admins or owners can view records.");
    };
    users.get(user);
  };

  // -----------------------------------------------------------------------
  // Scholarship Management
  // -----------------------------------------------------------------------

  /// Create a new scholarship. Admin only.
  public shared ({ caller }) func createScholarship(scholarship : Scholarship) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Access Denied: Only admins can create scholarships.");
    };

    let newId = scholarshipCounter;
    scholarshipCounter += 1;

    let newScholarship = {
      scholarship with id = newId;
    };
    scholarships.add(newId, newScholarship);
    newId;
  };

  /// Get a single scholarship by id. Public — no auth required.
  public query func getScholarship(id : Nat) : async Scholarship {
    switch (scholarships.get(id)) {
      case (?scholarship) { scholarship };
      case (null) { Runtime.trap("Scholarship not found") };
    };
  };

  /// List all scholarships. Public — no auth required.
  public query func listScholarships() : async [Scholarship] {
    scholarships.values().toArray();
  };

  // -----------------------------------------------------------------------
  // Application Management
  // -----------------------------------------------------------------------

  /// Apply to a scholarship. Requires #user role.
  public shared ({ caller }) func applyToScholarship(scholarshipId : Nat, application : ScholarshipApplication) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Access Denied: Only registered users may apply for scholarships.");
    };

    let userApps = switch (applications.get(caller)) {
      case (?existing) { existing };
      case (null) { List.empty<ScholarshipApplication>() };
    };

    userApps.add(application);
    applications.add(caller, userApps);
  };

  /// Retrieve all applications for a user. Caller must be the owner or an admin.
  public query ({ caller }) func getUserApplications(user : Principal) : async [ScholarshipApplication] {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Access Denied: Only admins or owners can view applications.");
    };

    switch (applications.get(user)) {
      case (?appList) { appList.toArray() };
      case (null) { [] };
    };
  };

  // -----------------------------------------------------------------------
  // Eligibility Checking
  // -----------------------------------------------------------------------

  /// Check eligibility of a user for a scholarship.
  /// Caller must be the owner of the record or an admin, because the result
  /// exposes private academic and career data.
  public query ({ caller }) func checkEligibility(scholarshipId : Nat, user : Principal) : async EligibilityCheckResult {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Access Denied: Only admins or the user themselves can check eligibility.");
    };

    switch (users.get(user)) {
      case (null) { Runtime.trap("User record not found") };
      case (?record) {
        switch (scholarships.get(scholarshipId)) {
          case (null) { Runtime.trap("Scholarship not found") };
          case (?scholarship) {
            let unmet : List.List<Text> = List.empty<Text>();
            let missingDocs : List.List<Text> = List.empty<Text>();

            if (record.academics.size() > 0) {
              let academics = record.academics;
              if (academics[0].percentage < scholarship.eligibility.minPercentage) {
                unmet.add("Minimum percentage not met");
              };
            } else {
              unmet.add("Missing academic records");
            };

            for (reqSkill in scholarship.eligibility.requiredSkills.values()) {
              if (record.career.size() == 0) {
                unmet.add("Missing required skill: " # reqSkill);
              } else {
                let hasSkill = record.career[0].skills.filter(func(s) { s == reqSkill });
                if (hasSkill.size() == 0) {
                  unmet.add("Missing required skill: " # reqSkill);
                };
              };
            };

            for (doc in scholarship.requiredDocuments.values()) {
              let matchingDocs = record.documents.filter(func(d) { d.fileName == doc });
              if (matchingDocs.size() == 0) {
                missingDocs.add(doc);
              };
            };

            {
              isEligible = unmet.isEmpty() and missingDocs.isEmpty();
              unmetRequirements = unmet.toArray();
              missingDocuments = missingDocs.toArray();
            };
          };
        };
      };
    };
  };

  // -----------------------------------------------------------------------
  // Auto-fill Function
  // -----------------------------------------------------------------------

  /// Return a pre-populated application form from the user's Master User Record.
  /// Caller must be the owner of the record or an admin, because this exposes
  /// private personal, academic, and career data.
  public query ({ caller }) func autoFillApplication(scholarshipId : Nat, user : Principal) : async ?MasterUserRecord {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Access Denied: Only admins or the user themselves can auto-fill an application.");
    };

    switch (users.get(user)) {
      case (null) { Runtime.trap("User record not found") };
      case (?record) { ?record };
    };
  };

  // -----------------------------------------------------------------------
  // Profile Completion Score
  // -----------------------------------------------------------------------

  /// Calculate the profile completion score for a user.
  /// Caller must be the owner of the record or an admin, because the result
  /// reveals which private fields are missing.
  public query ({ caller }) func getProfileCompletion(user : Principal) : async ProfileCompletionResult {
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Access Denied: Only admins or the user themselves can view profile completion.");
    };

    switch (users.get(user)) {
      case (null) {
        {
          completionPercentage = 0.0;
          missingFields = ["Create your profile to start tracking completion"];
        };
      };
      case (?record) {
        var completedFields = 0;
        let totalFields = 8;
        let missingFields = List.empty<Text>();

        if (record.name != "") { completedFields += 1 } else {
          missingFields.add("Upload Name");
        };

        if (record.email != "") { completedFields += 1 } else {
          missingFields.add("Upload Email");
        };

        if (record.dob != "") { completedFields += 1 } else {
          missingFields.add("Add Date of Birth");
        };

        if (record.academics.size() > 0) {
          completedFields += 1;
        } else {
          missingFields.add("Add Academic Records");
        };

        if (record.career.size() > 0) {
          completedFields += 1;
        } else {
          missingFields.add("Add Work Experience");
        };

        if (record.documents.size() > 0) {
          completedFields += 1;
        } else {
          missingFields.add("Upload Documents");
        };

        var hasMarksheet = false;
        var hasIncomeCert = false;
        var hasCasteCert = false;

        for (doc in record.documents.values()) {
          if (doc.documentType == "marksheet") { hasMarksheet := true };
          if (doc.documentType == "incomeCertificate") { hasIncomeCert := true };
          if (doc.documentType == "casteCertificate") { hasCasteCert := true };
        };

        if (hasMarksheet) { completedFields += 1 } else {
          missingFields.add("Upload Marksheet");
        };

        if (hasIncomeCert) { completedFields += 1 } else {
          missingFields.add("Add Income Certificate");
        };

        {
          completionPercentage = completedFields.toFloat() / totalFields.toFloat() * 100;
          missingFields = missingFields.toArray();
        };
      };
    };
  };
};
