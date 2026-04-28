/* eslint-disable no-unused-vars */
import { useMemo, useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaDownload,
  FaTrashAlt,
  FaEdit,
  FaChevronDown,
  FaFileAlt,
  FaCheck,
  FaFileExport,
  FaEnvelope,
  FaClock,
  FaComments,
} from "react-icons/fa";
import DataExportModal from "../../Components/Admin/DataExportModal";
import SendEmailModal from "../../Components/Admin/SendEmailModal";
import BulkProfileChecker from "../../Components/Admin/BulkProfileChecker";
import MessageTemplatesModal from "../../Components/Admin/MessageTemplatesModal";
import UserTimelineModal from "../../Components/Admin/UserTimelineModal";
import ProfileCompletionChecklist from "../../Components/Admin/ProfileCompletionChecklist";
import CubeIcon from "../../../public/3dcube.svg?react";
import CubeIconGreen from "../../../public/3dcubeGreen.svg?react";
import CubeIconPink from "../../../public/3dcubePink.svg?react";
import CubeIconOrange from "../../../public/3dcubeOrange.svg?react";
import CubeIconBlue from "../../../public/3dcube.svg?react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminStats,
  fetchAllUsers,
  fetchProviders,
  fetchSeekers,
  fetchNewSignups,
  fetchUserById,
  deleteUser,
  suspendUser,
  activateUser,
  approveUser,
  markDocumentsReceived,
  updateUserScreening,
  bulkUpdateUserScreening,
  clearCurrentUser,
} from "../../Redux/AdminUsers";
import { updateUserVerification } from "../../Redux/Login";
import { BASE_URL } from "../../Redux/config";

const EMPTY_VALUE = "—";
const SERVICE_CATEGORY_LABELS = {
  childcare: "Childcare",
  elderlycare: "Elderly Care",
  tutoring: "Tutoring",
  housekeeping: "Housekeeping",
};

const USER_TYPE_LABELS = {
  provider: "Care Provider",
  seeker: "Care Seeker",
  admin: "Admin",
};

const humanizeKey = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (ch) => ch.toUpperCase()) || EMPTY_VALUE;

const formatText = (value) => {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  if (Array.isArray(value)) return value.length ? value.join(", ") : EMPTY_VALUE;
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, entryValue]) => `${humanizeKey(key)}: ${formatText(entryValue)}`)
      .join(" • ") || EMPTY_VALUE;
  }
  return String(value);
};

const formatDate = (value) => (value ? dayjs(value).format("DD MMM YYYY") : EMPTY_VALUE);
const formatDateTime = (value) =>
  value ? dayjs(value).format("DD MMM YYYY, h:mm A") : EMPTY_VALUE;
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? String(value) : `₦${numeric.toLocaleString()}`;
};

const serviceCategoryLabel = (value) =>
  SERVICE_CATEGORY_LABELS[String(value || "").toLowerCase()] || formatText(value);
const userTypeLabel = (value) =>
  USER_TYPE_LABELS[String(value || "").toLowerCase()] || formatText(value);

const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.startsWith("/") ? `${BASE_URL}${url}` : `${BASE_URL}/${url}`;
};

const getInitials = (name) =>
  String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase() || "U";

const UserAvatar = ({ name, imageUrl, className, textClassName = "text-sm" }) => {
  const resolvedUrl = resolveImageUrl(imageUrl);
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className || "bg-slate-200"}`}>
      {resolvedUrl ? (
        <img
          src={resolvedUrl}
          alt={name ? `${name} profile photo` : "profile photo"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={`font-semibold text-slate-700 ${textClassName}`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};

const makeField = (label, value) => ({ label, value: formatText(value) });
const makeSection = (title, items) => ({ title, items });

const SCREENING_STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  clear: "Clear",
  consider: "Consider",
  suspended: "Suspended",
  failed: "Failed",
};

const screeningLabel = (value) =>
  SCREENING_STATUS_LABELS[String(value || "").toLowerCase()] || formatText(value);

const formatLocation = (value) => {
  if (!value || typeof value !== "object") return EMPTY_VALUE;
  return [value.city, value.state, value.country].filter(Boolean).join(", ") || EMPTY_VALUE;
};

const formatChildrenSummary = (children) => {
  if (!Array.isArray(children) || children.length === 0) return EMPTY_VALUE;
  return children
    .map((child, index) => {
      const age = child?.age || child?.birthDate || EMPTY_VALUE;
      const gender = child?.gender || "";
      return `Child ${index + 1}: ${age}${gender ? ` • ${gender}` : ""}`;
    })
    .join(" | ");
};

const buildProviderSections = (user) => {
  const profile = user?.onboarding_details || {};
  const verification = user?.verification || {};
  const screening = user?.screening || { status: user?.screening_status };
  const category = String(profile.service_category || "").toLowerCase();
  const categoryItems = [];

  if (category === "childcare") {
    categoryItems.push(
      makeField("Type of care provider", profile.category_specific_details?.type_of_care_provider),
      makeField("Preferred option", profile.category_specific_details?.preferred_option),
      makeField("Special preferences", profile.category_specific_details?.special_preferences),
      makeField("Communication language", profile.category_specific_details?.communication_language),
    );
  } else if (category === "elderlycare") {
    categoryItems.push(
      makeField(
        "Personality and interpersonal skills",
        profile.category_specific_details?.personality_and_interpersonal_skills,
      ),
      makeField("Special preferences", profile.category_specific_details?.special_preferences),
      makeField("Communication language", profile.category_specific_details?.communication_language),
      makeField("Preferred option", profile.category_specific_details?.preferred_option),
    );
  } else if (category === "tutoring") {
    categoryItems.push(
      makeField("Tutoring services", profile.category_specific_details?.tutoring_services),
      makeField(
        "Experience level taught",
        profile.category_specific_details?.experience_level_taught,
      ),
      makeField(
        "Subjects experienced in",
        profile.category_specific_details?.subjects_experienced_in,
      ),
    );
  } else if (category === "housekeeping") {
    categoryItems.push(
      makeField("Housekeeping preference", profile.category_specific_details?.housekeeping_preference),
      makeField("Services offered", profile.category_specific_details?.services_offered),
    );
  }

  return [
    makeSection("Identity", [
      makeField("Full name", user?.full_name),
      makeField("First name", profile.first_name),
      makeField("Last name", profile.last_name),
      makeField("Date of birth", formatDate(profile.date_of_birth)),
      makeField("Email", user?.email),
      makeField("Phone number", user?.phone_number || profile.phone_number),
      makeField("User type", userTypeLabel(user?.user_type)),
      makeField("Account status", user?.is_active ? "Active" : "Suspended"),
      makeField("Joined", formatDateTime(user?.date_joined)),
      makeField("Last login", formatDateTime(user?.last_login)),
    ]),
    makeSection("Location", [
      makeField("Country", profile.country || user?.location_details?.country),
      makeField("State", profile.state || user?.location_details?.state),
      makeField("City", profile.city || user?.location_details?.city),
      makeField("Zip code", profile.zip_code || user?.location_details?.zip_code),
      makeField("Nationality", profile.nationality || user?.location_details?.nationality),
      makeField("Profile photo", user?.profile_image_url ? "Uploaded" : EMPTY_VALUE),
    ]),
    makeSection("Provider Profile", [
      makeField(
        "Service category",
        profile.service_category_label || serviceCategoryLabel(profile.service_category),
      ),
      makeField("Profile title", profile.profile_title),
      makeField("Native language", profile.native_language),
      makeField("Experience level", profile.experience_level),
      makeField("Years of experience", profile.years_of_experience),
      makeField("Hourly rate", formatCurrency(profile.hourly_rate)),
      makeField("Languages spoken", profile.languages),
      makeField("Additional services", profile.additional_services),
      makeField("Skills", profile.skills),
    ]),
    makeSection("Category Details", categoryItems.length ? categoryItems : [makeField("Details", EMPTY_VALUE)]),
    makeSection("About", [
      makeField("Why they want to work", profile.work_reason),
      makeField("About me", profile.about_me),
      makeField("Consent timestamp", formatDateTime(profile.consent_timestamp)),
      makeField("Consent version", profile.consent_version),
    ]),
    makeSection("Verification & Billing", [
      makeField("Verification status", verification.status_label || verification.status),
      makeField("Verification feedback", verification.feedback),
      makeField("Government ID", verification.government_id_url ? "Uploaded" : EMPTY_VALUE),
      makeField("Subscription status", user?.subscription_status),
      makeField("Request count", user?.request_count),
      makeField("Earnings", formatCurrency(user?.earnings)),
    ]),
    makeSection("Screening", [
      makeField("Screening status", screening.status_label || screening.status),
      makeField("Screening summary", screening.result_summary),
      makeField("Candidate ID", screening.checkr_candidate_id),
      makeField("Report ID", screening.checkr_report_id),
      makeField("Last error", screening.last_error),
      makeField("Updated at", formatDateTime(screening.updated_at)),
    ]),
  ];
};

const buildSeekerSections = (user) => {
  const request = user?.onboarding_details || {};
  const verification = user?.verification || {};
  const location = request.location_information || {};
  const childInfo = request.child_information || {};
  const elderlyInfo = request.elderly_information || {};
  const tutoringInfo = request.tutoring_information || {};
  const housekeepingInfo = request.housekeeping_information || {};
  const category = String(request.service_category || "").toLowerCase();
  const serviceItems = [];

  if (category === "childcare") {
    serviceItems.push(
      makeField("Who needs care", childInfo.who_needs_care),
      makeField("Childcare type", childInfo.childcare_type),
      makeField("Number of children", childInfo.number_of_children),
      makeField("Children", formatChildrenSummary(childInfo.children)),
    );
  } else if (category === "elderlycare") {
    serviceItems.push(
      makeField("Care type", elderlyInfo.care_type || elderlyInfo.elderly_care_type),
      makeField("Relationship", elderlyInfo.relationship || elderlyInfo.relationship_with_elderly),
      makeField("Age", elderlyInfo.age || elderlyInfo.age_of_elderly),
      makeField("Gender", elderlyInfo.gender || elderlyInfo.gender_of_elderly),
      makeField(
        "Health condition",
        elderlyInfo.health_condition || elderlyInfo.health_condition_of_elderly,
      ),
    );
  } else if (category === "tutoring") {
    serviceItems.push(
      makeField("Subjects", tutoringInfo.subjects || tutoringInfo.subjects_needed),
      makeField("Student age", tutoringInfo.student_age || tutoringInfo.age_range_of_student),
      makeField("Current grade", tutoringInfo.current_grade),
      makeField("Learning goal", tutoringInfo.purpose_of_learning),
      makeField("Learning environment", tutoringInfo.learning_environment_needed),
    );
  } else if (category === "housekeeping") {
    serviceItems.push(
      makeField("Kind of housekeeping", housekeepingInfo.kind_of_housekeeping),
      makeField("Size of your house", housekeepingInfo.size_of_your_house),
      makeField("Bedrooms", housekeepingInfo.number_of_bedrooms),
      makeField("Bathrooms", housekeepingInfo.number_of_bathrooms),
      makeField("Toilets", housekeepingInfo.number_of_toilets),
      makeField("Pets present", housekeepingInfo.pets_present),
      makeField("Pet details", housekeepingInfo.specify_pet_present),
      makeField("Additional care", housekeepingInfo.additional_care),
    );
  }

  return [
    makeSection("Identity", [
      makeField("Full name", user?.full_name),
      makeField("Email", user?.email),
      makeField("Phone number", user?.phone_number),
      makeField("User type", userTypeLabel(user?.user_type)),
      makeField("Account status", user?.is_active ? "Active" : "Suspended"),
      makeField("Joined", formatDateTime(user?.date_joined)),
      makeField("Last login", formatDateTime(user?.last_login)),
    ]),
    makeSection("Location", [
      makeField("Use current location", location.use_current_location ? "Yes" : "No"),
      makeField("Preferred language", location.preferred_language),
      makeField("Country", location.country || user?.location_details?.country),
      makeField("State", location.state || user?.location_details?.state),
      makeField("City", location.city || user?.location_details?.city),
      makeField("Zip code", location.zip_code || user?.location_details?.zip_code),
      makeField("Nationality", location.nationality || user?.location_details?.nationality),
    ]),
    makeSection("Care Request", [
      makeField("Service category", request.service_category_label || serviceCategoryLabel(request.service_category)),
      makeField("Request title", request.title),
      makeField("Summary", request.summary),
      makeField("Message to provider", request.message_to_provider),
    ]),
    makeSection("Service Details", serviceItems.length ? serviceItems : [makeField("Details", EMPTY_VALUE)]),
    makeSection("Schedule & Budget", [
      makeField("Job type", request.job_type),
      makeField("Start date", formatDate(request.start_date)),
      makeField("End date", formatDate(request.end_date)),
      makeField("Start time", request.start_time),
      makeField("End time", request.end_time),
      makeField("Repeat pattern", request.recurrence_pattern),
      makeField("Budget minimum", formatCurrency(request.price_min)),
      makeField("Budget maximum", formatCurrency(request.price_max)),
      makeField("Skills and expertise", request.skills_and_expertise),
    ]),
    makeSection("Verification & Subscription", [
      makeField("Verification status", verification.status_label || verification.status),
      makeField("Verification feedback", verification.feedback),
      makeField("Government ID", verification.government_id_url ? "Uploaded" : EMPTY_VALUE),
      makeField("Subscription status", user?.subscription_status),
      makeField("Requests posted", user?.request_count),
    ]),
  ];
};

const buildAdminSections = (user) => [
    makeSection("Identity", [
      makeField("Full name", user?.full_name),
      makeField("Email", user?.email),
      makeField("Phone number", user?.phone_number),
      makeField("User type", userTypeLabel(user?.user_type || (user?.is_staff ? "admin" : ""))),
      makeField("Account status", user?.is_active ? "Active" : "Suspended"),
      makeField("Joined", formatDateTime(user?.date_joined)),
      makeField("Last login", formatDateTime(user?.last_login)),
    ]),
];

function Users() {
  const dispatch = useDispatch();
  const { stats, users } = useSelector(
    (s) => s.adminUsers || { stats: {}, users: [] },
  );
  const currentUserId = useSelector((s) => s.auth?.user?.id);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "onboard", dir: "desc" });
  const [currentPage, setCurrentPage] = useState(1);

  const [activeStat, setActiveStat] = useState("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState("All");
  const [editRow, setEditRow] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // New states for physical documents workflow
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedUserForDocs, setSelectedUserForDocs] = useState(null);
  const [documentsData, setDocumentsData] = useState({
    received_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [selectedUserForPayment, setSelectedUserForPayment] = useState(null);
  const [manualPaymentData, setManualPaymentData] = useState({
    payment_method: "bank_transfer",
    payment_received_date: "",
    payment_reference: "",
    notes: "",
  });
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [screeningStatus, setScreeningStatus] = useState("clear");
  const [alert, setAlert] = useState(null);
  const alertTimerRef = useRef(null);

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [singleEmailUser, setSingleEmailUser] = useState(null);
  const [profileStatusFilters, setProfileStatusFilters] = useState([]);
  const [profileFilterOpen, setProfileFilterOpen] = useState(false);
  const profileFilterRef = useRef(null);
  const {
    verificationLoading,
    verificationError,
    documentsLoading,
    documentsError,
    screeningLoading,
    screeningError,
  } = useSelector((s) => s.adminUsers || {});

  // New feature states
  const [showBulkChecker, setShowBulkChecker] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedUserForTemplate, setSelectedUserForTemplate] = useState(null);
  const [selectedUserForTimeline, setSelectedUserForTimeline] = useState(null);
  const [enhancedStats, setEnhancedStats] = useState(null);

  useEffect(() => {
    setSelectedIds([]); // Clear selection when switching tabs
    dispatch(fetchAdminStats());
    fetchEnhancedStats(); // Fetch enhanced stats with profile completion metrics
  }, [dispatch, activeStat]);

  const fetchEnhancedStats = async () => {
    try {
      const access = localStorage.getItem("accessToken") || localStorage.getItem("access");
      const headers = access ? { Authorization: `Bearer ${access}` } : {};
      const res = await fetch(`${BASE_URL}/api/admin/stats/enhanced/`, { headers });
      const data = await res.json();
      if (res.ok) {
        setEnhancedStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch enhanced stats:", err);
    }
  };

  // Fetch appropriate user list when activeStat changes
  useEffect(() => {
    switch (activeStat) {
      case "providers":
        dispatch(fetchProviders());
        break;
      case "seekers":
        dispatch(fetchSeekers());
        break;
      case "signups":
        dispatch(fetchNewSignups());
        break;
      case "all":
      default:
        dispatch(fetchAllUsers());
        break;
    }
  }, [activeStat, dispatch]);

  const { currentUser, currentUserLoading, currentUserError } = useSelector(
    (s) => s.adminUsers || { currentUser: null },
  );

  useEffect(() => {
    if (currentUser && currentUser.id === selectedUserId) {
      const u = currentUser;
      setEditRow({
        ...u,
        id: u.id,
        name: u.full_name || `User ${u.id}`,
        userType: userTypeLabel(u.user_type),
        email: u.email,
        phone: u.phone_number || "",
        onboard: u.date_joined ? dayjs(u.date_joined).format("DD-MM-YYYY") : "",
        lastLogin: u.last_login ? dayjs(u.last_login).format("DD-MM-YYYY") : "",
        profileImageUrl: u.profile_image_url || "",
        requestHistory: u.request_count ?? 0,
        requestsMade: u.request_count ?? 0,
        country: u.location_details?.country || "",
        city: u.location_details?.city || "",
        nationality: u.location_details?.nationality || "",
        accountStatus: u.is_active ? "Active" : "Suspended",
        is_suspend: !u.is_active,
        earnings: u.earnings || "-",
        is_verified:
          u.is_verified ??
          (u.verification?.status === "verified" ||
            u.verification?.status === "approved"),
        verification_status: u.verification?.status || "pending",
        documents_received: u.verification?.status === "documents_received",
        screening_status: u.screening?.status || u.screening_status || "pending",
        screening: u.screening || null,
        profile_image_url: u.profile_image_url || "",
        verification: u.verification || null,
        onboarding_details: u.onboarding_details || null,
      });
    }
  }, [currentUser, selectedUserId]);

  const detailUser =
    currentUser && currentUser.id === selectedUserId
      ? currentUser
      : editRow;
  const rows = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.map((u) => ({
      id: u.id,
      name: u.full_name || `User ${u.id}`,
      userType: userTypeLabel(u.user_type || (u.is_staff ? "admin" : "")),
      email: u.email,
      phone: u.phone_number || "",
      onboard: u.date_joined ? dayjs(u.date_joined).format("DD-MM-YYYY") : "",
      onboardDate: u.date_joined || "",
      lastLogin: u.last_login ? dayjs(u.last_login).format("DD-MM-YYYY") : "",
      lastLoginDate: u.last_login || "",
      lastUpdated: u.updated_at
        ? dayjs(u.updated_at).format("DD-MM-YYYY")
        : dayjs(u.date_joined).format("DD-MM-YYYY") || "",
      lastUpdatedDate: u.updated_at || u.date_joined || "",
      profileImageUrl: u.profile_image_url || "",
      requestHistory: 0,
      requestsMade: 0,
      country: "",
      city: "",
      nationality: "",
      location: formatLocation(u.location_details),
      accountStatus: u.is_active ? "Active" : "Suspended",
      subscriptionStatus: u.is_active ? "Active" : "Suspended",
      earnings: "-",
      is_verified: u.is_verified ?? u.verification_status === "verified",
      verification_status: u.verification_status || "pending",
      documents_received: u.documents_received ?? false,
      screening_status: u.screening_status || "pending",
      is_profile_complete: u.is_profile_complete ?? false,
      has_profile_picture: u.has_profile_picture ?? false,
    }));
  }, [users]);

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((row) => row.location)
            .filter((value) => value && value !== EMPTY_VALUE),
        ),
      ).sort(),
    [rows],
  );

  const hasActiveFilters =
    Boolean(query.trim()) ||
    locationFilter !== "All" ||
    accountStatusFilter !== "All" ||
    profileStatusFilters.length > 0;

  const detailSections = detailUser
    ? (detailUser.user_type === "provider"
      ? buildProviderSections(detailUser)
      : detailUser.user_type === "seeker"
        ? buildSeekerSections(detailUser)
        : buildAdminSections(detailUser))
    : [];

  const statsCounts = useMemo(
    () => ({
      users: stats?.total_users ?? 0,
      providers: stats?.total_providers ?? 0,
      seekers: stats?.total_seekers ?? 0,
      signups: stats?.new_sign_ups ?? 0,
      incomplete: enhancedStats?.incomplete_profiles ?? 0,
      pendingDocs: enhancedStats?.profiles_pending_docs ?? 0,
      awaitingVerification: enhancedStats?.profiles_awaiting_verification ?? 0,
    }),
    [stats, enhancedStats],
  );

  const statsConfig = [
    { key: "all", label: "Users", value: statsCounts.users, icon: CubeIcon },
    {
      key: "providers",
      label: "Care Providers",
      value: statsCounts.providers,
      icon: CubeIconGreen,
    },
    {
      key: "seekers",
      label: "Care Seekers",
      value: statsCounts.seekers,
      icon: CubeIconPink,
    },
    {
      key: "signups",
      label: "New Sign Ups",
      value: statsCounts.signups,
      icon: CubeIconOrange,
    },
  ];

  // Feature 3: Profile Completion Stats Cards
  const profileStatsConfig = [
    {
      key: "incomplete",
      label: "Incomplete Profiles",
      value: statsCounts.incomplete,
      icon: CubeIconBlue,
      color: "red"
    },
    {
      key: "pendingDocs",
      label: "Pending Documents",
      value: statsCounts.pendingDocs,
      icon: CubeIconOrange,
      color: "yellow"
    },
    {
      key: "awaitingVerification",
      label: "Awaiting Verification",
      value: statsCounts.awaitingVerification,
      icon: CubeIconGreen,
      color: "blue"
    },
  ];

  const visibleProfileStats = useMemo(
    () => ({
      incomplete: filtered.filter((row) => !row.is_profile_complete).length,
      pendingDocs: filtered.filter((row) => !row.documents_received).length,
      awaitingVerification: filtered.filter((row) => !row.is_verified).length,
    }),
    [filtered],
  );

  // Close profile filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileFilterRef.current && !profileFilterRef.current.contains(e.target)) {
        setProfileFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleProfileFilter = (value) => {
    setProfileStatusFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const profileFilterOptions = [
    { value: "Complete", label: "Completed Profile" },
    { value: "Incomplete", label: "Incomplete Profile" },
    { value: "NoPhoto", label: "No Profile Picture" },
  ];

  const activeFilters = useMemo(() => {
    const items = [];
    if (query.trim()) {
      items.push({
        key: "query",
        label: `Search: ${query.trim()}`,
        clear: () => setQuery(""),
      });
    }
    if (locationFilter !== "All") {
      items.push({
        key: "location",
        label: `Location: ${locationFilter}`,
        clear: () => setLocationFilter("All"),
      });
    }
    if (accountStatusFilter !== "All") {
      items.push({
        key: "account",
        label: `Account: ${accountStatusFilter}`,
        clear: () => setAccountStatusFilter("All"),
      });
    }
    profileStatusFilters.forEach((value) => {
      items.push({
        key: `profile-${value}`,
        label: profileFilterOptions.find((opt) => opt.value === value)?.label || value,
        clear: () =>
          setProfileStatusFilters((prev) => prev.filter((item) => item !== value)),
      });
    });
    return items;
  }, [query, locationFilter, accountStatusFilter, profileStatusFilters]);

  const clearAllFilters = () => {
    setQuery("");
    setLocationFilter("All");
    setAccountStatusFilter("All");
    setProfileStatusFilters([]);
    setProfileFilterOpen(false);
    setCurrentPage(1);
  };

  const filtered = useMemo(() => {
    let data = [...rows];

    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
      );
    }
    if (locationFilter !== "All") {
      data = data.filter((r) =>
        String(r.location || "").toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }
    if (accountStatusFilter !== "All") {
      data = data.filter((r) => r.accountStatus === accountStatusFilter);
    }
    if (profileStatusFilters.length > 0) {
      data = data.filter((r) => {
        return profileStatusFilters.some((f) => {
          if (f === "Complete") return r.is_profile_complete;
          if (f === "Incomplete") return !r.is_profile_complete;
          if (f === "NoPhoto") return !r.has_profile_picture;
          return true;
        });
      });
    }

    data.sort((a, b) => {
      const k = sortBy.key;
      let av = a[k];
      let bv = b[k];
      if (k === "onboard" || k === "lastLogin" || k === "lastUpdated") {
        const dateField =
          k === "onboard"
            ? "onboardDate"
            : k === "lastLogin"
              ? "lastLoginDate"
              : "lastUpdatedDate";
        av = a[dateField] ? dayjs(a[dateField]).valueOf() : 0;
        bv = b[dateField] ? dayjs(b[dateField]).valueOf() : 0;
      }
      if (av < bv) return sortBy.dir === "asc" ? -1 : 1;
      if (av > bv) return sortBy.dir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [rows, query, locationFilter, accountStatusFilter, sortBy, profileStatusFilters]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStat, query, locationFilter, accountStatusFilter, sortBy.key, sortBy.dir, profileStatusFilters]);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeStat, query, locationFilter, accountStatusFilter, sortBy.key, sortBy.dir, profileStatusFilters]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedIds = useMemo(() => paginated.map((row) => row.id), [paginated]);
  const allPageSelected =
    paginatedIds.length > 0 && paginatedIds.every((id) => selectedIds.includes(id));

  function toggleSort(key) {
    setSortBy((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  const openUserDetail = (row) => {
    dispatch(clearCurrentUser());
    setSelectedUserId(row.id);
    setEditRow({
      ...row,
      is_suspend: row.accountStatus !== "Active",
    });
    setOpenMenuId(null);
    dispatch(fetchUserById(row.id));
  };

  // Selection helpers
  const toggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedIds])));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Removed redundant downloadCSV function - handled by DataExportModal

  // Helper function to get verification status badge
  const getVerificationBadge = (row) => {
    if (row.verification_status === "verified" || row.is_verified) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
          <FaCheck className="w-3 h-3" /> Verified
        </span>
      );
    }
    if (row.documents_received) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          <FaFileAlt className="w-3 h-3" /> Docs Received
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
        Pending
      </span>
    );
  };

  const getScreeningBadge = (row) => {
    const status = row.screening?.status || row.screening_status;
    if (!status) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
          No screening
        </span>
      );
    }
    const tone =
      status === "clear"
        ? "bg-green-100 text-green-700"
        : status === "consider" || status === "in_progress"
          ? "bg-amber-100 text-amber-700"
          : "bg-rose-100 text-rose-700";
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${tone}`}>
        Screening: {screeningLabel(status)}
      </span>
    );
  };

  return (
    <>
      <div className="p-4 sm:p-6 text-black bg-white font-sfpro">
        {/* Alert */}
        {alert && (
          <div
            className={`mb-4 px-4 py-3 rounded-md ${alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
              }`}
            role="alert"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{alert.text}</div>
              <button
                onClick={() => {
                  setAlert(null);
                  if (alertTimerRef.current) {
                    clearTimeout(alertTimerRef.current);
                    alertTimerRef.current = null;
                  }
                }}
                className="text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Filter scope
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {hasActiveFilters
                  ? `Stats and rows are showing ${filtered.length.toLocaleString()} matching users.`
                  : `Stats and rows are showing all ${rows.length.toLocaleString()} users in this tab.`}
              </p>
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className={`w-full rounded-xl border px-4 py-2 text-sm font-medium lg:w-auto ${
                hasActiveFilters
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              Clear all filters
            </button>
          </div>
          {activeFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={filter.clear}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span>{filter.label}</span>
                  <span className="text-slate-400">×</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-4">
          {statsConfig.map((s) => {
            const isActive = activeStat === s.key;
            const value = isActive && hasActiveFilters ? filtered.length : s.value;
            return (
              <div
                key={s.key}
                onClick={() => setActiveStat(s.key)}
                className={`p-4 rounded-lg cursor-pointer flex flex-col justify-between ${isActive ? "bg-[#0e2f43] text-white" : "bg-white text-black"
                  } border`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <div
                      className={`w-8 h-8 flex items-center justify-center mb-2 rounded-full ${isActive ? "bg-white/10" : "bg-slate-100"
                        }`}
                    >
                      {(() => {
                        const Icon = s.icon || CubeIcon;
                        return (
                          <Icon
                            className={`w-5 h-5 ${isActive ? "text-white" : "text-black"
                              }`}
                          />
                        );
                      })()}
                    </div>
                    <div className="text-sm font-medium">{s.label}</div>
                    {isActive && hasActiveFilters && (
                      <div className="mt-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white">
                        Filtered
                      </div>
                    )}
                  </div>
                  <div
                    className={`ml-auto text-2xl font-semibold ${isActive ? "text-white" : "text-black"
                      }`}
                  >
                    {value.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature 3: Profile Completion Stats */}
        {enhancedStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {profileStatsConfig.map((s) => (
              <div
                key={s.key}
                className={`p-4 rounded-lg border ${s.color === 'red' ? 'bg-red-50 border-red-200' :
                  s.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <div className="text-sm font-medium text-gray-700">{s.label}</div>
                    <div className="text-2xl font-semibold text-gray-900 mt-1">
                      {(hasActiveFilters ? visibleProfileStats[s.key] : s.value).toLocaleString()}
                    </div>
                  </div>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${s.color === 'red' ? 'bg-red-100' :
                    s.color === 'yellow' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                    {(() => {
                      const Icon = s.icon || CubeIcon;
                      return <Icon className="w-5 h-5 text-gray-700" />;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feature 1: Bulk Profile Checker Button */}
        <div className="mb-4 flex gap-3">
          <button
            onClick={() => setShowBulkChecker(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#0b93c6] to-[#0a82b0] text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
          >
            <FaSearch />
            Bulk Profile Checker
          </button>
          <button
            onClick={() => setShowScreeningModal(true)}
            className="px-4 py-2.5 bg-[#0e2f43] text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            disabled={selectedIds.length === 0}
          >
            <FaCheck />
            Bulk Screening
          </button>
          <div className="text-xs text-gray-500 flex items-center">
            <span>✨ Check multiple provider profiles at once</span>
          </div>
        </div>

        {/* Documents Received Modal */}
        {showDocumentsModal && selectedUserForDocs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Mark Documents Received</h3>
                <button
                  className="text-gray-500"
                  onClick={() => setShowDocumentsModal(false)}
                >
                  &times;
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Mark physical documents as received for{" "}
                <strong>{selectedUserForDocs.name}</strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Documents Received
                  </label>
                  <input
                    type="date"
                    value={documentsData.received_date}
                    onChange={(e) =>
                      setDocumentsData({
                        ...documentsData,
                        received_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Received NIN, Driver's License, Proof of Address"
                    value={documentsData.notes}
                    onChange={(e) =>
                      setDocumentsData({
                        ...documentsData,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white text-sm"
                  />
                </div>
              </div>

              {documentsError && (
                <div className="text-red-600 text-sm mt-4">
                  {typeof documentsError === "string"
                    ? documentsError
                    : documentsError?.error || "Action failed"}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                  onClick={() => {
                    setShowDocumentsModal(false);
                    setSelectedUserForDocs(null);
                    setDocumentsData({
                      received_date: new Date().toISOString().split("T")[0],
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#0b93c6] text-white rounded-md disabled:opacity-50"
                  onClick={async () => {
                    try {
                      await dispatch(
                        markDocumentsReceived({
                          userId: selectedUserForDocs.id,
                          documentDetails: documentsData,
                        }),
                      ).unwrap();

                      setShowDocumentsModal(false);
                      setSelectedUserForDocs(null);
                      setDocumentsData({
                        received_date: new Date().toISOString().split("T")[0],
                        notes: "",
                      });

                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({
                        type: "success",
                        text: "✅ Documents marked as received! Admin can now approve this user.",
                      });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        5000,
                      );
                    } catch (error) {
                      console.error("Mark documents failed:", error);
                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({
                        type: "error",
                        text:
                          error?.error || "Failed to mark documents as received",
                      });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        5000,
                      );
                    }
                  }}
                  disabled={documentsLoading}
                >
                  {documentsLoading ? "Marking..." : "Mark Received"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Screening Modal */}
        {showScreeningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Bulk Screening Status</h3>
                <button
                  className="text-gray-500"
                  onClick={() => setShowScreeningModal(false)}
                >
                  &times;
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Update screening status for {selectedIds.length} selected users.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Screening Status
                </label>
                <select
                  value={screeningStatus}
                  onChange={(e) => setScreeningStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="clear">Clear</option>
                  <option value="consider">Consider</option>
                  <option value="suspended">Suspended</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {screeningError && (
                <div className="text-red-600 text-sm mt-4">
                  {typeof screeningError === "string"
                    ? screeningError
                    : screeningError?.error || "Action failed"}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                  onClick={() => setShowScreeningModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#0b93c6] text-white rounded-md disabled:opacity-50"
                  onClick={async () => {
                    try {
                      await dispatch(
                        bulkUpdateUserScreening({
                          userIds: selectedIds,
                          status: screeningStatus,
                        }),
                      ).unwrap();

                      setShowScreeningModal(false);
                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({
                        type: "success",
                        text: `✅ Screening updated for ${selectedIds.length} users.`,
                      });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        4000,
                      );
                    } catch (error) {
                      console.error("Bulk screening failed:", error);
                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({
                        type: "error",
                        text: error?.error || "Failed to update screening",
                      });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        4000,
                      );
                    }
                  }}
                  disabled={screeningLoading}
                >
                  {screeningLoading ? "Updating..." : "Apply Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit / Details Modal */}
        {editRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div
              className="absolute inset-0"
              onClick={() => {
                dispatch(clearCurrentUser());
                setSelectedUserId(null);
                setEditRow(null);
              }}
            />
            <div className="relative z-50 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <button
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                onClick={() => {
                  dispatch(clearCurrentUser());
                  setSelectedUserId(null);
                  setEditRow(null);
                }}
              >
                ✕
              </button>

              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white sm:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      name={editRow.name}
                      imageUrl={editRow.profileImageUrl || editRow.profile_image_url}
                      className="h-16 w-16 rounded-2xl bg-white/10 ring-1 ring-white/10"
                      textClassName="text-2xl text-slate-100"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        {userTypeLabel(editRow.user_type)}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold">
                        {editRow.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-300">
                        {editRow.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {getVerificationBadge(editRow)}
                    {getScreeningBadge(editRow)}
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                      {editRow.accountStatus}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                      Joined {editRow.onboard}
                    </span>
                  </div>
                </div>

                {currentUserLoading && (
                  <p className="mt-4 text-sm text-slate-300">
                    Refreshing full profile details...
                  </p>
                )}
                {currentUserError && (
                  <p className="mt-4 text-sm text-red-200">
                    Unable to load the full profile details.
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-6 sm:px-8">
                <div className="grid gap-4">
                  {detailSections.map((section) => (
                    <section
                      key={section.title}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          {section.title}
                        </h4>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {section.items.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                          >
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-900">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button className="w-full rounded-md bg-[#0b93c6] py-2 text-white sm:w-auto sm:px-5">
                    Message
                  </button>
                  <button
                    className="w-full rounded-md border border-[#0b93c6] py-2 text-[#0b93c6] sm:w-auto sm:px-5"
                    onClick={async () => {
                      if (!editRow?.id) return;
                      try {
                        if (editRow.is_suspend) {
                          const payload = await dispatch(
                            activateUser(editRow.id),
                          ).unwrap();
                          const message = payload?.data?.status || "User reactivated";
                          setSelectedUserId(null);
                          setEditRow(null);
                          if (alertTimerRef.current) {
                            clearTimeout(alertTimerRef.current);
                            alertTimerRef.current = null;
                          }
                          setAlert({ type: "success", text: message });
                          alertTimerRef.current = setTimeout(
                            () => setAlert(null),
                            3000,
                          );
                        } else {
                          const payload = await dispatch(
                            suspendUser(editRow.id),
                          ).unwrap();
                          const message = payload?.data?.status || "User suspended";
                          setSelectedUserId(null);
                          setEditRow(null);
                          if (alertTimerRef.current) {
                            clearTimeout(alertTimerRef.current);
                            alertTimerRef.current = null;
                          }
                          setAlert({ type: "success", text: message });
                          alertTimerRef.current = setTimeout(
                            () => setAlert(null),
                            3000,
                          );
                        }
                      } catch (e) {
                        console.error("Action failed", e);
                        if (alertTimerRef.current) {
                          clearTimeout(alertTimerRef.current);
                          alertTimerRef.current = null;
                        }
                        setAlert({
                          type: "error",
                          text: "Failed to update user status",
                        });
                        alertTimerRef.current = setTimeout(
                          () => setAlert(null),
                          3000,
                        );
                      }
                    }}
                  >
                    {editRow.is_suspend ? "Reactivate" : "Suspend"}
                  </button>
                  {editRow.user_type === "provider" && (
                    <>
                      <select
                        value={screeningStatus}
                        onChange={(e) => setScreeningStatus(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 sm:w-auto"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="clear">Clear</option>
                        <option value="consider">Consider</option>
                        <option value="suspended">Suspended</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button
                        className="w-full rounded-md bg-[#0e2f43] py-2 text-white sm:w-auto sm:px-5"
                        disabled={screeningLoading}
                        onClick={async () => {
                          if (!editRow?.id) return;
                          try {
                            const result = await dispatch(
                              updateUserScreening({
                                id: editRow.id,
                                status: screeningStatus,
                              }),
                            ).unwrap();
                            setEditRow((prev) =>
                              prev
                                ? {
                                  ...prev,
                                  screening: {
                                    ...(prev.screening || {}),
                                    status: result?.data?.status || screeningStatus,
                                    status_label:
                                      result?.data?.status_label || screeningLabel(screeningStatus),
                                  },
                                  screening_status: result?.data?.status || screeningStatus,
                                }
                                : prev,
                            );
                            if (alertTimerRef.current) {
                              clearTimeout(alertTimerRef.current);
                              alertTimerRef.current = null;
                            }
                            setAlert({
                              type: "success",
                              text: "✅ Screening status updated.",
                            });
                            alertTimerRef.current = setTimeout(
                              () => setAlert(null),
                              3000,
                            );
                          } catch (e) {
                            console.error("Screening update failed", e);
                            if (alertTimerRef.current) {
                              clearTimeout(alertTimerRef.current);
                              alertTimerRef.current = null;
                            }
                            setAlert({
                              type: "error",
                              text: "Failed to update screening status",
                            });
                            alertTimerRef.current = setTimeout(
                              () => setAlert(null),
                              3000,
                            );
                          }
                        }}
                      >
                        {screeningLoading ? "Saving..." : "Save Screening"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setDeleteRow(null)}
            />
            <div className="relative bg-white w-[320px] rounded-lg shadow-lg p-5 z-50 text-center">
              <button
                className="absolute right-3 top-3 text-slate-400 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
                onClick={() => setDeleteRow(null)}
              >
                ✕
              </button>
              <h4 className="text-lg font-medium mb-2">Remove User</h4>
              <p className="text-sm text-slate-600 mb-4">
                Are you sure you want to remove this user?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                  onClick={async () => {
                    try {
                      await dispatch(deleteUser(deleteRow.id)).unwrap();
                    } catch (e) {
                      console.error("Delete failed", e);
                    } finally {
                      setDeleteRow(null);
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                  onClick={() => setDeleteRow(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Payment Modal */}
        {showManualPaymentModal && selectedUserForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Mark Manual Payment - {selectedUserForPayment.name}
                </h3>
                <button
                  className="text-gray-500"
                  onClick={() => setShowManualPaymentModal(false)}
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={manualPaymentData.payment_method}
                    onChange={(e) =>
                      setManualPaymentData({
                        ...manualPaymentData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={manualPaymentData.payment_received_date}
                    onChange={(e) =>
                      setManualPaymentData({
                        ...manualPaymentData,
                        payment_received_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Reference / Receipt Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., TXN123456 or Receipt #789"
                    value={manualPaymentData.payment_reference}
                    onChange={(e) =>
                      setManualPaymentData({
                        ...manualPaymentData,
                        payment_reference: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    placeholder="Add any notes about this manual payment verification..."
                    value={manualPaymentData.notes}
                    onChange={(e) =>
                      setManualPaymentData({
                        ...manualPaymentData,
                        notes: e.target.value,
                      })
                    }
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black bg-white"
                  />
                </div>
              </div>

              {verificationError && (
                <div className="text-red-600 mt-4">
                  {typeof verificationError === "string"
                    ? verificationError
                    : verificationError?.detail ||
                    verificationError?.error ||
                    verificationError?.message ||
                    "Action failed"}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md"
                  onClick={() => {
                    setShowManualPaymentModal(false);
                    setSelectedUserForPayment(null);
                    setManualPaymentData({
                      payment_method: "bank_transfer",
                      payment_received_date: "",
                      payment_reference: "",
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-[#0b93c6] text-white rounded-md disabled:opacity-50"
                  onClick={async () => {
                    // Check if documents have been marked as received
                    if (!selectedUserForPayment.documents_received) {
                      setAlert({
                        type: "error",
                        text: "Documents must be marked as received before approval. Click 'Mark Documents' first.",
                      });
                      return;
                    }

                    try {
                      const result = await dispatch(
                        approveUser({
                          id: selectedUserForPayment.id,
                          manualPayment: {
                            payment_verified_manually: true,
                            manual_payment_method:
                              manualPaymentData.payment_method,
                            manual_payment_date:
                              manualPaymentData.payment_received_date,
                            manual_payment_reference:
                              manualPaymentData.payment_reference,
                            manual_payment_notes: manualPaymentData.notes,
                          },
                        }),
                      ).unwrap();

                      console.log("Approval result:", result);

                      if (currentUserId === selectedUserForPayment.id) {
                        if (result.updatedUser) {
                          dispatch(
                            updateUserVerification(
                              result.updatedUser.is_verified || true,
                            ),
                          );
                        } else {
                          dispatch(updateUserVerification(true));
                        }
                      }

                      setShowManualPaymentModal(false);
                      setSelectedUserForPayment(null);
                      setManualPaymentData({
                        payment_method: "bank_transfer",
                        payment_received_date: "",
                        payment_reference: "",
                        notes: "",
                      });

                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }
                      setAlert({
                        type: "success",
                        text: `✅ User verified successfully! Their verification badge should appear immediately.`,
                      });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        7000,
                      );
                    } catch (error) {
                      console.error("Approval failed:", error);
                      if (alertTimerRef.current) {
                        clearTimeout(alertTimerRef.current);
                        alertTimerRef.current = null;
                      }

                      let errorMessage = "Unknown error";
                      if (error?.message) {
                        errorMessage = error.message;
                      } else if (typeof error === "string") {
                        errorMessage = error;
                      } else if (error?.detail) {
                        errorMessage = error.detail;
                      } else if (error?.error) {
                        errorMessage = error.error;
                      }

                      setAlert({
                        type: "error",
                        text: `Failed to verify user: ${errorMessage}`,
                      });
                      alertTimerRef.current = setTimeout(
                        () => setAlert(null),
                        5000,
                      );
                    }
                  }}
                  disabled={
                    verificationLoading || !manualPaymentData.payment_received_date
                  }
                >
                  {verificationLoading ? "Approving..." : "Approve & Mark Paid"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
          <div className="flex-1 w-full">
            <div className="flex items-center bg-white rounded-md px-3 py-2 shadow-sm text-black">
              <FaSearch className="text-slate-400 mr-2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search for users"
                className="outline-none w-full text-sm bg-white text-black"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="appearance-none px-4 py-2 border rounded-md text-sm bg-white text-black pr-8"
              >
                <option value="All">All locations</option>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={accountStatusFilter}
                onChange={(e) => setAccountStatusFilter(e.target.value)}
                className="appearance-none px-4 py-2 border rounded-md text-sm bg-white text-black pr-8"
              >
                <option value="All">Account status</option>
                <option value="Active">Active accounts</option>
                <option value="Suspended">Suspended accounts</option>
              </select>
              <FaChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative" ref={profileFilterRef}>
              <button
                type="button"
                onClick={() => setProfileFilterOpen((o) => !o)}
                className="appearance-none px-4 py-2 border rounded-md text-sm bg-white text-black pr-8 min-w-[160px] flex items-center justify-between gap-2"
              >
                <span>
                  {profileStatusFilters.length === 0
                    ? "Profile Status"
                    : profileStatusFilters.length === 1
                      ? profileFilterOptions.find((o) => o.value === profileStatusFilters[0])?.label
                      : `${profileStatusFilters.length} filters`}
                </span>
                <FaChevronDown className="text-slate-400 shrink-0" />
              </button>

              {profileFilterOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1">
                  {profileFilterOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={profileStatusFilters.includes(opt.value)}
                        onChange={() => toggleProfileFilter(opt.value)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                      />
                      {opt.label}
                    </label>
                  ))}
                  {profileStatusFilters.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setProfileStatusFilters([])}
                      className="w-full text-left px-3 py-2 text-xs text-[#0b93c6] hover:bg-slate-50 border-t border-slate-100 mt-1"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 border border-[#0b93c6] text-[#0b93c6] rounded-md flex items-center justify-center gap-2 text-sm font-medium hover:bg-blue-50 transition-all"
            >
              <FaEnvelope />
              Send Email
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-[#0b93c6] text-white rounded-md flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:bg-[#0a82b0] active:scale-[0.98] transition-all"
            >
              <FaFileExport />
              Export Data
            </button>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 md:hidden">
          {paginated.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
              No results
            </div>
          ) : (
            paginated.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                    />
                    <UserAvatar
                      name={r.name}
                      imageUrl={r.profileImageUrl}
                      className="h-12 w-12 rounded-2xl bg-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {r.name}
                      </div>
                      <div className="text-xs text-slate-500">{r.userType}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {r.location || EMPTY_VALUE}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getVerificationBadge(r)}
                    {getScreeningBadge(r)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Email
                    </div>
                    <div className="mt-1 break-words text-slate-900">{r.email}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Phone
                    </div>
                    <div className="mt-1 text-slate-900">{r.phone || EMPTY_VALUE}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Joined
                    </div>
                    <div className="mt-1 text-slate-900">{r.onboard}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Updated
                    </div>
                    <div className="mt-1 text-slate-900">{r.lastUpdated || EMPTY_VALUE}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openUserDetail(r)}
                    className="flex-1 rounded-xl border border-[#0b93c6] py-2.5 text-sm font-medium text-[#0b93c6]"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) => (current === r.id ? null : r.id))
                    }
                    className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white"
                  >
                    Actions
                  </button>
                </div>

                {openMenuId === r.id && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        openUserDetail(r);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-slate-900 hover:bg-white"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForDocs(r);
                        setShowDocumentsModal(true);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-slate-900 hover:bg-white"
                    >
                      Mark documents
                    </button>
                    {r.documents_received && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForPayment(r);
                          setShowManualPaymentModal(true);
                          setOpenMenuId(null);
                        }}
                        className="block w-full px-4 py-3 text-left font-medium text-blue-600 hover:bg-white"
                      >
                        Approve user
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSingleEmailUser(r);
                        setShowEmailModal(true);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-slate-900 hover:bg-white"
                    >
                      Send email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForTemplate(r);
                        setShowTemplatesModal(true);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-slate-900 hover:bg-white"
                    >
                      Quick message
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserForTimeline(r.id);
                        setShowTimelineModal(true);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-slate-900 hover:bg-white"
                    >
                      View timeline
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteRow(r);
                        setOpenMenuId(null);
                      }}
                      className="block w-full px-4 py-3 text-left text-red-600 hover:bg-white"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* Table */}
        <div className="hidden overflow-x-auto rounded-md bg-white text-black shadow-sm md:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                  />
                </th>
                <th
                  className="p-3 text-left cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  Name
                </th>
                <th className="p-3 text-left">User Type</th>
                <th className="p-3 text-left">Email address</th>
                <th className="p-3 text-left">Phone Number</th>
                <th className="p-3 text-left">Verification Status</th>
                <th
                  className="p-3 text-left cursor-pointer"
                  onClick={() => toggleSort("onboard")}
                >
                  onboarding Date
                </th>
                <th className="p-3"> </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr
                  key={r.id}
                  className="border-b last:border-b-0 hover:bg-slate-50"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                    />
                  </td>
                  <td className="p-3 flex items-center gap-3">
                    <UserAvatar
                      name={r.name}
                      imageUrl={r.profileImageUrl}
                      className="h-8 w-8 rounded-full bg-slate-200"
                      textClassName="text-xs"
                    />
                    <div>
                      <div className="font-medium">{r.name}</div>
                    </div>
                  </td>
                  <td className="p-3">{r.userType}</td>
                  <td className="p-3 text-slate-600">{r.email}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">{getVerificationBadge(r)}</td>
                  <td className="p-3">{r.onboard}</td>
                  <td className="p-3">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === r.id ? null : r.id)
                        }
                        className="rounded px-2 py-1 text-black hover:bg-gray-100"
                      >
                        •••
                      </button>
                      {openMenuId === r.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded border border-gray-200 bg-white text-sm shadow">
                          <ul>
                            <li
                              onClick={() => {
                                openUserDetail(r);
                                setOpenMenuId(null);
                              }}
                              className="cursor-pointer px-4 py-2 text-black hover:bg-gray-50"
                            >
                              View
                            </li>
                            <li
                              onClick={() => {
                                setSelectedUserForDocs(r);
                                setShowDocumentsModal(true);
                                setOpenMenuId(null);
                              }}
                              className="cursor-pointer px-4 py-2 text-black hover:bg-gray-50"
                            >
                              Mark Documents
                            </li>
                            {r.documents_received && (
                              <li
                                onClick={() => {
                                  setSelectedUserForPayment(r);
                                  setShowManualPaymentModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="cursor-pointer px-4 py-2 font-medium text-blue-600 hover:bg-gray-50"
                              >
                                Approve User
                              </li>
                            )}
                            <li
                              onClick={() => {
                                setSingleEmailUser(r);
                                setShowEmailModal(true);
                                setOpenMenuId(null);
                              }}
                              className="cursor-pointer px-4 py-2 text-black hover:bg-gray-50"
                            >
                              Send Email
                            </li>
                            <li
                              onClick={() => {
                                setSelectedUserForTemplate(r);
                                setShowTemplatesModal(true);
                                setOpenMenuId(null);
                              }}
                              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-black hover:bg-gray-50"
                            >
                              <FaComments className="text-sm" />
                              Quick Message
                            </li>
                            <li
                              onClick={() => {
                                setSelectedUserForTimeline(r.id);
                                setShowTimelineModal(true);
                                setOpenMenuId(null);
                              }}
                              className="flex cursor-pointer items-center gap-2 px-4 py-2 text-black hover:bg-gray-50"
                            >
                              <FaClock className="text-sm" />
                              View Timeline
                            </li>
                            <li
                              onClick={() => {
                                setDeleteRow(r);
                                setOpenMenuId(null);
                              }}
                              className="cursor-pointer px-4 py-2 text-black hover:bg-gray-50"
                            >
                              Delete
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-400">
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row">
            <div>
              Showing {(currentPage - 1) * pageSize + 1}
              {" "}
              to {Math.min(currentPage * pageSize, filtered.length)}
              {" "}
              of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="min-w-[84px] text-center text-slate-500">
                Page {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-slate-200 px-3 py-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={filtered}
        selectedIds={selectedIds}
        activeStat={activeStat}
      />
      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setSingleEmailUser(null);
        }}
        selectedUsers={singleEmailUser ? [singleEmailUser] : rows.filter(r => selectedIds.includes(r.id))}
        onEmailSent={(msg) => {
          setAlert({ type: 'success', text: `✅ ${msg}` });
          setTimeout(() => setAlert(null), 5000);
        }}
      />
      <BulkProfileChecker
        isOpen={showBulkChecker}
        onClose={() => setShowBulkChecker(false)}
      />
      <MessageTemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => {
          setShowTemplatesModal(false);
          setSelectedUserForTemplate(null);
        }}
        selectedUser={selectedUserForTemplate}
        onMessageSent={(msg) => {
          setAlert({ type: 'success', text: `✅ ${msg}` });
          setTimeout(() => setAlert(null), 5000);
        }}
      />
      <UserTimelineModal
        isOpen={showTimelineModal}
        onClose={() => {
          setShowTimelineModal(false);
          setSelectedUserForTimeline(null);
        }}
        userId={selectedUserForTimeline}
      />
    </>
  );
}

export default Users;
