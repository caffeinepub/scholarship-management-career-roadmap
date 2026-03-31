import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, CheckCircle2, Save, Sparkles, User } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category, DisabilityStatus, Gender } from "../backend";
import { useGetMyProfile, useRegisterStudent } from "../hooks/useQueries";
import { loadProfileLocally } from "../utils/profileStore";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

const DISTRICTS_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Tirupati",
    "Kakinada",
    "Rajahmundry",
    "Kadapa",
    "Anantapur",
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Naharlagun",
    "Pasighat",
    "Tawang",
    "Ziro",
    "Bomdila",
    "Along",
    "Tezu",
    "Khonsa",
    "Roing",
  ],
  Assam: [
    "Guwahati",
    "Dispur",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Tezpur",
    "Nagaon",
    "Tinsukia",
    "Bongaigaon",
    "Karimganj",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Purnia",
    "Darbhanga",
    "Ara",
    "Begusarai",
    "Katihar",
    "Munger",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bhilai",
    "Bilaspur",
    "Korba",
    "Rajnandgaon",
    "Durg",
    "Ambikapur",
    "Jagdalpur",
    "Raigarh",
    "Dhamtari",
  ],
  Goa: ["North Goa", "South Goa"],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
    "Junagadh",
    "Anand",
    "Navsari",
  ],
  Haryana: [
    "Faridabad",
    "Gurugram",
    "Hisar",
    "Rohtak",
    "Panipat",
    "Ambala",
    "Karnal",
    "Sonipat",
    "Yamunanagar",
    "Rewari",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Mandi",
    "Solan",
    "Dharamshala",
    "Baddi",
    "Kullu",
    "Hamirpur",
    "Una",
    "Bilaspur",
    "Chamba",
  ],
  Jharkhand: [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Hazaribagh",
    "Deoghar",
    "Giridih",
    "Phusro",
    "Ramgarh",
    "Medininagar",
  ],
  Karnataka: [
    "Bengaluru",
    "Mysuru",
    "Hubballi",
    "Mangaluru",
    "Belagavi",
    "Davanagere",
    "Ballari",
    "Vijayapura",
    "Shivamogga",
    "Tumakuru",
  ],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Palakkad",
    "Alappuzha",
    "Kannur",
    "Malappuram",
    "Kottayam",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam",
    "Rewa",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Amravati",
    "Kolhapur",
    "Nanded",
  ],
  Manipur: [
    "Imphal",
    "Thoubal",
    "Bishnupur",
    "Churachandpur",
    "Chandel",
    "Ukhrul",
    "Senapati",
    "Tamenglong",
    "Jiribam",
    "Kakching",
  ],
  Meghalaya: [
    "Shillong",
    "Tura",
    "Jowai",
    "Nongstoin",
    "Williamnagar",
    "Baghmara",
    "Resubelpara",
    "Ampati",
    "Mairang",
    "Nongpoh",
  ],
  Mizoram: [
    "Aizawl",
    "Lunglei",
    "Champhai",
    "Serchhip",
    "Kolasib",
    "Lawngtlai",
    "Mamit",
    "Saiha",
    "Hnahthial",
    "Khawzawl",
  ],
  Nagaland: [
    "Kohima",
    "Dimapur",
    "Mokokchung",
    "Tuensang",
    "Wokha",
    "Zunheboto",
    "Mon",
    "Phek",
    "Kiphire",
    "Longleng",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Berhampur",
    "Sambalpur",
    "Puri",
    "Balasore",
    "Bhadrak",
    "Baripada",
    "Jharsuguda",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali",
    "Pathankot",
    "Hoshiarpur",
    "Gurdaspur",
    "Firozpur",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Udaipur",
    "Bhilwara",
    "Alwar",
    "Bharatpur",
    "Sikar",
  ],
  Sikkim: ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Soreng", "Pakyong"],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Vellore",
    "Erode",
    "Thoothukudi",
    "Dindigul",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Ramagundam",
    "Khammam",
    "Mahbubnagar",
    "Nalgonda",
    "Adilabad",
    "Suryapet",
  ],
  Tripura: [
    "Agartala",
    "Udaipur",
    "Dharmanagar",
    "Kailasahar",
    "Belonia",
    "Sabroom",
    "Ambassa",
    "Khowai",
    "Teliamura",
    "Sonamura",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Ghaziabad",
    "Agra",
    "Varanasi",
    "Meerut",
    "Prayagraj",
    "Bareilly",
    "Aligarh",
    "Moradabad",
  ],
  Uttarakhand: [
    "Dehradun",
    "Haridwar",
    "Roorkee",
    "Haldwani",
    "Rudrapur",
    "Kashipur",
    "Rishikesh",
    "Kotdwar",
    "Ramnagar",
    "Pithoragarh",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Bardhaman",
    "Malda",
    "Baharampur",
    "Habra",
    "Kharagpur",
  ],
  Delhi: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Anantnag",
    "Baramulla",
    "Udhampur",
    "Sopore",
    "Leh",
    "Kargil",
    "Pulwama",
    "Rajouri",
  ],
  Ladakh: ["Leh", "Kargil"],
  Chandigarh: ["Chandigarh"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

const COLLEGES_LIST = [
  // IITs
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT Hyderabad",
  "IIT Indore",
  "IIT Jodhpur",
  "IIT Mandi",
  "IIT Patna",
  "IIT Ropar",
  "IIT Bhubaneswar",
  "IIT Gandhinagar",
  "IIT Tirupati",
  "IIT Dhanbad (ISM)",
  "IIT Jammu",
  "IIT Varanasi (BHU)",
  // NITs
  "NIT Trichy",
  "NIT Warangal",
  "NIT Surathkal",
  "NIT Calicut",
  "NIT Rourkela",
  "NIT Allahabad",
  "NIT Kurukshetra",
  "NIT Jaipur",
  "NIT Nagpur",
  "NIT Silchar",
  "NIT Hamirpur",
  "NIT Jalandhar",
  "NIT Bhopal",
  "NIT Agartala",
  "NIT Durgapur",
  "NIT Patna",
  "NIT Srinagar",
  "NIT Goa",
  "NIT Manipur",
  "NIT Meghalaya",
  "NIT Mizoram",
  "NIT Puducherry",
  "NIT Sikkim",
  "NIT Uttarakhand",
  // Central Universities
  "Delhi University",
  "JNU Delhi",
  "BHU Varanasi",
  "AMU Aligarh",
  "University of Hyderabad",
  "Jadavpur University",
  "Calcutta University",
  "Mumbai University",
  "Pune University",
  "Osmania University",
  "Mysore University",
  "Anna University Chennai",
  // IIMs
  "IIM Ahmedabad",
  "IIM Bangalore",
  "IIM Calcutta",
  "IIM Lucknow",
  "IIM Kozhikode",
  "IIM Indore",
  "IIM Shillong",
  "IIM Rohtak",
  "IIM Raipur",
  "IIM Ranchi",
  "IIM Tiruchirappalli",
  "IIM Udaipur",
  "IIM Visakhapatnam",
  "IIM Amritsar",
  "IIM Bodhgaya",
  "IIM Jammu",
  "IIM Nagpur",
  "IIM Sambalpur",
  "IIM Sirmaur",
  // Medical
  "AIIMS Delhi",
  "AIIMS Bhopal",
  "AIIMS Bhubaneswar",
  "AIIMS Jodhpur",
  "AIIMS Patna",
  "AIIMS Raipur",
  "AIIMS Rishikesh",
  "JIPMER Puducherry",
  "Maulana Azad Medical College",
  "Grant Medical College Mumbai",
  "Kasturba Medical College",
  // State & Deemed Universities
  "VIT Vellore",
  "SRM University Chennai",
  "Manipal Institute of Technology",
  "PSG College of Technology",
  "Coimbatore Institute of Technology",
  "RV College of Engineering Bangalore",
  "PES University Bangalore",
  "MS Ramaiah Institute of Technology",
  "JSS Academy of Technical Education",
  "KLE Technological University",
  "DSCE Bangalore",
  "BITS Pilani",
  "BITS Goa",
  "BITS Hyderabad",
  "Thapar University",
  "KIIT University",
  "SASTRA University",
  "LPU Jalandhar",
  "Amity University Noida",
  "Chandigarh University",
  // Other
  "Other",
];

const EDUCATION_LEVELS = [
  "5th Standard",
  "8th Standard",
  "10th Standard (Matriculation)",
  "12th Standard (Intermediate)",
  "B.Tech (Engineering)",
  "MBBS (Medical)",
  "B.Sc",
  "B.A.",
  "M.Tech",
  "MD",
  "M.Sc",
] as const;

function mapEducationToCourseLevel(edu: string): string {
  if (edu === "5th Standard" || edu === "8th Standard") return "secondary";
  if (
    edu === "10th Standard (Matriculation)" ||
    edu === "12th Standard (Intermediate)"
  )
    return "higher_secondary";
  if (
    edu === "B.Tech (Engineering)" ||
    edu === "MBBS (Medical)" ||
    edu === "B.Sc" ||
    edu === "B.A."
  )
    return "undergraduate";
  if (edu === "M.Tech" || edu === "MD" || edu === "M.Sc") return "postgraduate";
  return "undergraduate";
}

interface FormState {
  fullName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  category: string;
  disabilityStatus: string;
  annualFamilyIncome: string;
  state: string;
  district: string;
  courseName: string;
  courseLevel: string;
  instituteName: string;
  currentYear: string;
  boardName?: string;
  universityName?: string;
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  mobileNumber: "",
  gender: "",
  category: "",
  disabilityStatus: "",
  annualFamilyIncome: "",
  state: "",
  district: "",
  courseName: "",
  courseLevel: "",
  instituteName: "",
  currentYear: "1",
  boardName: "",
  universityName: "",
};

export default function Profile() {
  const navigate = useNavigate();
  const { profile } = useGetMyProfile();
  const registerStudent = useRegisterStudent();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [formPopulated, setFormPopulated] = useState(false);
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  // Track the selected college from dropdown separately from custom text
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [customInstitute, setCustomInstitute] = useState<string>("");

  const showBoardName =
    educationLevel === "10th Standard (Matriculation)" ||
    educationLevel === "12th Standard (Intermediate)";

  const showUniversityName =
    educationLevel === "B.Tech (Engineering)" ||
    educationLevel === "MBBS (Medical)";

  // Districts for the currently selected state
  const availableDistricts = form.state
    ? (DISTRICTS_BY_STATE[form.state] ?? [])
    : [];

  // Auto-populate form from existing profile (backend or localStorage)
  useEffect(() => {
    if (profile && !formPopulated) {
      setForm({
        fullName: profile.fullName ?? "",
        email: profile.email ?? "",
        mobileNumber: profile.mobileNumber ?? "",
        gender: profile.gender ?? "",
        category: profile.category ?? "",
        disabilityStatus: profile.disabilityStatus ?? "",
        annualFamilyIncome: profile.annualFamilyIncome ?? "",
        state: profile.state ?? "",
        district: profile.district ?? "",
        courseName: profile.courseName ?? "",
        courseLevel: profile.courseLevel ?? "",
        instituteName: profile.instituteName ?? "",
        currentYear: profile.currentYear?.toString() ?? "1",
        boardName: "",
        universityName: "",
      });
      // Pre-fill college select if known
      const savedInstitute = profile.instituteName ?? "";
      if (COLLEGES_LIST.includes(savedInstitute)) {
        setSelectedCollege(savedInstitute);
      } else if (savedInstitute) {
        setSelectedCollege("Other");
        setCustomInstitute(savedInstitute);
      }
      setFormPopulated(true);
      return;
    }

    // Fallback: try localStorage directly if profile not populated yet
    if (!formPopulated) {
      const local = loadProfileLocally();
      if (local) {
        setForm({
          fullName: local.fullName || "",
          email: local.email || "",
          mobileNumber: local.mobileNumber || "",
          gender: local.gender || "",
          category: local.category || "",
          disabilityStatus: local.disabilityStatus || "",
          annualFamilyIncome: local.annualFamilyIncome || "",
          state: local.state || "",
          district: local.district || "",
          courseName: local.courseName || "",
          courseLevel: local.courseLevel || "",
          instituteName: local.instituteName || "",
          currentYear: String(local.currentYear || 1),
          boardName: "",
          universityName: "",
        });
        const savedInstitute = local.instituteName || "";
        if (COLLEGES_LIST.includes(savedInstitute)) {
          setSelectedCollege(savedInstitute);
        } else if (savedInstitute) {
          setSelectedCollege("Other");
          setCustomInstitute(savedInstitute);
        }
        setFormPopulated(true);
      }
    }
  }, [profile, formPopulated]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationLevelChange = (value: string) => {
    setEducationLevel(value);
    setForm((prev) => ({
      ...prev,
      courseLevel: mapEducationToCourseLevel(value),
      boardName: "",
      universityName: "",
    }));
  };

  const handleStateChange = (value: string) => {
    setField("state", value);
    // Reset district when state changes
    setField("district", "");
  };

  const handleCollegeSelect = (value: string) => {
    setSelectedCollege(value);
    if (value && value !== "Other") {
      setField("instituteName", value);
    } else if (value === "Other") {
      // Keep whatever is in customInstitute
      setField("instituteName", customInstitute);
    }
  };

  const handleCustomInstituteChange = (value: string) => {
    setCustomInstitute(value);
    // Custom text input always wins when typed
    setField("instituteName", value);
    if (value) {
      setSelectedCollege("Other");
    }
  };

  // Validate a single required field and show a friendly error
  const validateRequired = (value: string, label: string): boolean => {
    if (!value.trim()) {
      toast.error(`${label} is required`, {
        description: "Please fill in this field to continue.",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // —— Validation ——
    if (!validateRequired(form.fullName, "Full name")) return;
    if (!validateRequired(form.email, "Email")) return;
    if (!validateRequired(form.mobileNumber, "Mobile number")) return;
    if (!form.gender) {
      toast.error("Gender is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }
    if (!form.disabilityStatus) {
      toast.error("Disability status is required");
      return;
    }
    if (!validateRequired(form.annualFamilyIncome, "Annual family income"))
      return;
    if (!form.state) {
      toast.error("State is required");
      return;
    }
    if (!validateRequired(form.district, "District")) return;
    if (!validateRequired(form.courseName, "Course name")) return;
    if (!form.courseLevel) {
      toast.error("Education level is required");
      return;
    }
    if (!validateRequired(form.instituteName, "Institute name")) return;

    try {
      // Save to localStorage (no backend dependency)
      await registerStudent.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        mobileNumber: form.mobileNumber,
        gender: form.gender as Gender,
        category: form.category as Category,
        disabilityStatus: form.disabilityStatus as DisabilityStatus,
        annualFamilyIncome: form.annualFamilyIncome,
        state: form.state,
        district: form.district,
        courseName: form.courseName,
        courseLevel: form.courseLevel,
        instituteName: form.instituteName,
        currentYear: BigInt(Number.parseInt(form.currentYear) || 1),
      });

      // Show success banner
      setShowSuccessBanner(true);

      toast.success("Profile Registered Successfully", {
        description: "Your profile has been saved. Redirecting to dashboard...",
        duration: 3000,
      });

      // Redirect to dashboard after a brief moment
      setTimeout(() => {
        void navigate({ to: "/" });
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      toast.error("Registration Failed", {
        description: msg,
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Student Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile
              ? "Update your profile information"
              : "Complete your profile to get started"}
          </p>
        </div>
        {profile && (
          <div className="ml-auto flex items-center gap-1.5 text-sm text-success">
            <CheckCircle className="w-4 h-4" />
            <span>Registered</span>
          </div>
        )}
      </div>

      {/* Success banner (shown after registration) */}
      {showSuccessBanner && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Profile Registered Successfully!
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Your data has been saved locally. Redirecting to dashboard…
            </p>
          </div>
        </div>
      )}

      {/* Profile data loaded banner with Auto-Fill button */}
      {profile && !showSuccessBanner && (
        <div className="mb-6 space-y-3">
          {/* Green "data loaded" banner */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-800 font-medium flex-1">
              Profile data loaded — your information is pre-filled below.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-100 shrink-0"
              onClick={() => {
                toast.success(
                  "Form is already filled from your saved profile!",
                  {
                    description:
                      "All your profile data has been pre-loaded into the form.",
                  },
                );
              }}
            >
              <Sparkles className="w-3 h-3" />
              &#10024; Auto-Fill from Profile
            </Button>
          </div>
          {/* Profile ID */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Profile ID:</span>
            <span className="text-xs font-mono font-semibold text-primary">
              {profile.profileId.toString()}
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        {/* Personal Info */}
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Enter your full name"
                data-ocid="profile.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Enter your email"
                data-ocid="profile.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                value={form.mobileNumber}
                onChange={(e) => setField("mobileNumber", e.target.value)}
                placeholder="10-digit mobile number"
                data-ocid="profile.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender *</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setField("gender", v)}
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.male}>Male</SelectItem>
                  <SelectItem value={Gender.female}>Female</SelectItem>
                  <SelectItem value={Gender.other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setField("category", v)}
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Category.general}>General</SelectItem>
                  <SelectItem value={Category.obc}>OBC</SelectItem>
                  <SelectItem value={Category.sc}>SC</SelectItem>
                  <SelectItem value={Category.st}>ST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Disability Status *</Label>
              <Select
                value={form.disabilityStatus}
                onValueChange={(v) => setField("disabilityStatus", v)}
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select disability status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DisabilityStatus.none}>None</SelectItem>
                  <SelectItem value={DisabilityStatus.hearingImpaired}>
                    Hearing Impaired
                  </SelectItem>
                  <SelectItem value={DisabilityStatus.sightImpaired}>
                    Sight Impaired
                  </SelectItem>
                  <SelectItem value={DisabilityStatus.physicalImpaired}>
                    Physical Impaired
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="annualFamilyIncome">Annual Family Income *</Label>
              <Input
                id="annualFamilyIncome"
                value={form.annualFamilyIncome}
                onChange={(e) => setField("annualFamilyIncome", e.target.value)}
                placeholder="e.g. 3,00,000"
                data-ocid="profile.input"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* State — scrollable dropdown with blank option */}
            <div className="space-y-1.5">
              <Label>State *</Label>
              <Select
                value={form.state}
                onValueChange={(v) =>
                  handleStateChange(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="__none__">— Select state —</SelectItem>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District — scrollable dropdown based on selected state */}
            <div className="space-y-1.5">
              <Label>District *</Label>
              {availableDistricts.length > 0 ? (
                <Select
                  value={form.district}
                  onValueChange={(v) =>
                    setField("district", v === "__none__" ? "" : v)
                  }
                  disabled={!form.state}
                >
                  <SelectTrigger data-ocid="profile.select">
                    <SelectValue
                      placeholder={
                        form.state ? "Select district" : "Select state first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    <SelectItem value="__none__">
                      — Select district —
                    </SelectItem>
                    {availableDistricts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => setField("district", e.target.value)}
                  placeholder={
                    form.state ? "Enter your district" : "Select state first"
                  }
                  disabled={!form.state}
                  data-ocid="profile.input"
                />
              )}
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
            Academic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                value={form.courseName}
                onChange={(e) => setField("courseName", e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
                data-ocid="profile.input"
              />
            </div>

            {/* Education Level Dropdown */}
            <div className="space-y-1.5">
              <Label>Education Level *</Label>
              <Select
                value={educationLevel}
                onValueChange={handleEducationLevelChange}
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Board Name */}
            {showBoardName && (
              <div className="space-y-1.5">
                <Label htmlFor="boardName">Board Name</Label>
                <Input
                  id="boardName"
                  value={form.boardName ?? ""}
                  onChange={(e) => setField("boardName", e.target.value)}
                  placeholder="e.g. CBSE, ICSE, State Board"
                  data-ocid="profile.input"
                />
              </div>
            )}

            {/* Conditional: University / College */}
            {showUniversityName && (
              <div className="space-y-1.5">
                <Label htmlFor="universityName">
                  University / College Name
                </Label>
                <Input
                  id="universityName"
                  value={form.universityName ?? ""}
                  onChange={(e) => setField("universityName", e.target.value)}
                  placeholder="e.g. IIT Delhi, AIIMS"
                  data-ocid="profile.input"
                />
              </div>
            )}

            {/* Institute Name — scrollable Select + custom text input */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="instituteName">Institute Name *</Label>
              <Select
                value={selectedCollege}
                onValueChange={(v) =>
                  handleCollegeSelect(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger data-ocid="profile.select">
                  <SelectValue placeholder="Select your institute" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="__none__">— Select institute —</SelectItem>
                  {COLLEGES_LIST.map((college) => (
                    <SelectItem key={college} value={college}>
                      {college}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="instituteName"
                value={customInstitute}
                onChange={(e) => handleCustomInstituteChange(e.target.value)}
                placeholder="Or type your institute name"
                className="mt-2"
                data-ocid="profile.input"
              />
              {form.instituteName && (
                <p className="text-xs text-muted-foreground">
                  Selected:{" "}
                  <span className="font-medium text-foreground">
                    {form.instituteName}
                  </span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currentYear">Current Year *</Label>
              <Input
                id="currentYear"
                type="number"
                min="1"
                max="6"
                value={form.currentYear}
                onChange={(e) => setField("currentYear", e.target.value)}
                placeholder="e.g. 2"
                data-ocid="profile.input"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={registerStudent.isPending}
            className="gap-2 min-w-[160px]"
            data-ocid="profile.submit_button"
          >
            {registerStudent.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {profile ? "Update Profile" : "Register Profile"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
