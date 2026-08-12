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
  FaTimes,
} from "react-icons/fa";
import DataExportModal from "../../Components/Admin/DataExportModal";
import SendEmailModal from "../../Components/Admin/SendEmailModal";
import BulkProfileChecker from "../../Components/Admin/BulkProfileChecker";
import MessageTemplatesModal from "../../Components/Admin/MessageTemplatesModal";
import UserTimelineModal from "../../Components/Admin/UserTimelineModal";
import ProfileCompletionChecklist from "../../Components/Admin/ProfileCompletionChecklist";
import AdminPagination from "../../Components/Admin/AdminPagination";
import { useClientPagination } from "../../hooks/useAdminCollection";
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
  deleteUserImage,
  suspendUser,
  activateUser,
  approveUser,
  markDocumentsReceived,
  updateUserScreening,
  bulkUpdateUserScreening,
  clearCurrentUser,
  updateUser,
  uploadUserImage,
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
  if (Array.isArray(value))
    return value.length ? value.join(", ") : EMPTY_VALUE;
  if (typeof value === "object") {
    return (
      Object.entries(value)
        .map(
          ([key, entryValue]) =>
            `${humanizeKey(key)}: ${formatText(entryValue)}`,
        )
        .join(" • ") || EMPTY_VALUE
    );
  }
  return String(value);
};

const formatDate = (value) =>
  value ? dayjs(value).format("DD MMM YYYY") : EMPTY_VALUE;
const formatDateTime = (value) =>
  value ? dayjs(value).format("DD MMM YYYY, h:mm A") : EMPTY_VALUE;
const userName = (user) =>
  user?.full_name ||
  user?.name ||
  [user?.onboarding_details?.first_name, user?.onboarding_details?.last_name]
    .filter(Boolean)
    .join(" ") ||
  EMPTY_VALUE;
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? String(value) : `₦${numeric.toLocaleString()}`;
};

const serviceCategoryLabel = (value) =>
  SERVICE_CATEGORY_LABELS[String(value || "").toLowerCase()] ||
  formatText(value);
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

const UserAvatar = ({
  name,
  imageUrl,
  className,
  textClassName = "text-sm",
}) => {
  const resolvedUrl = resolveImageUrl(imageUrl);
  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className || "bg-slate-200"}`}
    >
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

const GovernmentIdPreview = ({ verification }) => {
  const documents = [
    ["Government ID", verification?.government_id_url],
    ["Identity photo", verification?.identity_photo_url],
  ].filter(([, url]) => url);
  if (!documents.length) return null;

  return (
    <section className="border-b border-gray-100 pb-5">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Identity documents
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {documents.map(([label, url]) => {
          const resolvedUrl = resolveImageUrl(url);
          const isImage = /\.(?:png|jpe?g|webp|gif)(?:$|\?)/i.test(resolvedUrl);
          return (
            <div
              key={label}
              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                {label}
              </div>
              {isImage ? (
                <img
                  src={resolvedUrl}
                  alt={label}
                  className="h-52 w-full object-contain"
                />
              ) : (
                <iframe
                  title={label}
                  src={resolvedUrl}
                  className="h-52 w-full"
                />
              )}
              <a
                href={resolvedUrl}
                target="_blank"
                rel="noreferrer"
                className="block px-3 py-2 text-xs font-medium text-[#0b93c6] hover:underline"
              >
                Open full document
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const makeField = (label, value) => ({ label, value: formatText(value) });
const makeSection = (title, items) => ({ title, items });
const EDIT_CONTROL =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0b93c6] focus:ring-2 focus:ring-[#0b93c6]/15";

const EditField = ({
  label,
  value,
  onChange,
  type = "text",
  options,
  textarea = false,
  hint,
}) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    {textarea ? (
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className={EDIT_CONTROL}
      />
    ) : options ? (
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={EDIT_CONTROL}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className={EDIT_CONTROL}
      />
    )}
    {hint && (
      <span className="mt-1 block text-xs font-normal text-slate-500">
        {hint}
      </span>
    )}
  </label>
);

const SCREENING_STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  clear: "Clear",
  consider: "Consider",
  suspended: "Suspended",
  failed: "Failed",
};

const screeningLabel = (value) =>
  SCREENING_STATUS_LABELS[String(value || "").toLowerCase()] ||
  formatText(value);

const formatLocation = (value) => {
  if (!value || typeof value !== "object") return EMPTY_VALUE;
  return (
    [value.city, value.state, value.country].filter(Boolean).join(", ") ||
    EMPTY_VALUE
  );
};

const isVerifiedRow = (row) =>
  Boolean(
    row?.is_verified ||
      row?.verification_status === "verified" ||
      row?.verification_status === "approved",
  );

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
      makeField(
        "Type of care provider",
        profile.category_specific_details?.type_of_care_provider,
      ),
      makeField(
        "Preferred option",
        profile.category_specific_details?.preferred_option,
      ),
      makeField(
        "Special preferences",
        profile.category_specific_details?.special_preferences,
      ),
      makeField(
        "Communication language",
        profile.category_specific_details?.communication_language,
      ),
    );
  } else if (category === "elderlycare") {
    categoryItems.push(
      makeField(
        "Personality and interpersonal skills",
        profile.category_specific_details?.personality_and_interpersonal_skills,
      ),
      makeField(
        "Special preferences",
        profile.category_specific_details?.special_preferences,
      ),
      makeField(
        "Communication language",
        profile.category_specific_details?.communication_language,
      ),
      makeField(
        "Preferred option",
        profile.category_specific_details?.preferred_option,
      ),
    );
  } else if (category === "tutoring") {
    categoryItems.push(
      makeField(
        "Tutoring services",
        profile.category_specific_details?.tutoring_services,
      ),
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
      makeField(
        "Housekeeping preference",
        profile.category_specific_details?.housekeeping_preference,
      ),
      makeField(
        "Services offered",
        profile.category_specific_details?.services_offered,
      ),
    );
  }

  return [
    makeSection("Identity", [
      makeField("Full name", userName(user)),
      makeField("First name", profile.first_name),
      makeField("Last name", profile.last_name),
      makeField("Date of birth", formatDate(profile.date_of_birth)),
      makeField("Email", user?.email),
      makeField(
        "Phone number",
        user?.phone_number || user?.phone || profile.phone_number,
      ),
      makeField("User type", userTypeLabel(user?.user_type)),
      makeField("Account status", user?.is_active ? "Active" : "Suspended"),
      makeField(
        "Joined",
        formatDateTime(user?.date_joined || user?.onboardDate),
      ),
      makeField(
        "Last login",
        formatDateTime(user?.last_login || user?.lastLoginDate),
      ),
    ]),
    makeSection("Location", [
      makeField("Country", profile.country || user?.location_details?.country),
      makeField("State", profile.state || user?.location_details?.state),
      makeField("City", profile.city || user?.location_details?.city),
      makeField(
        "Zip code",
        profile.zip_code || user?.location_details?.zip_code,
      ),
      makeField(
        "Nationality",
        profile.nationality || user?.location_details?.nationality,
      ),
      makeField(
        "Profile photo",
        user?.profile_image_url ? "Uploaded" : EMPTY_VALUE,
      ),
    ]),
    makeSection("Provider Profile", [
      makeField(
        "Service category",
        profile.service_category_label ||
          serviceCategoryLabel(profile.service_category),
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
    makeSection(
      "Category Details",
      categoryItems.length
        ? categoryItems
        : [makeField("Details", EMPTY_VALUE)],
    ),
    makeSection("About", [
      makeField("Why they want to work", profile.work_reason),
      makeField("About me", profile.about_me),
      makeField("Consent timestamp", formatDateTime(profile.consent_timestamp)),
      makeField("Consent version", profile.consent_version),
    ]),
    makeSection("Verification & Billing", [
      makeField(
        "Verification status",
        verification.status_label || verification.status,
      ),
      makeField("Verification feedback", verification.feedback),
      makeField(
        "Government ID",
        verification.government_id_url ? "Uploaded" : EMPTY_VALUE,
      ),
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
      makeField(
        "Care type",
        elderlyInfo.care_type || elderlyInfo.elderly_care_type,
      ),
      makeField(
        "Relationship",
        elderlyInfo.relationship || elderlyInfo.relationship_with_elderly,
      ),
      makeField("Age", elderlyInfo.age || elderlyInfo.age_of_elderly),
      makeField("Gender", elderlyInfo.gender || elderlyInfo.gender_of_elderly),
      makeField(
        "Health condition",
        elderlyInfo.health_condition || elderlyInfo.health_condition_of_elderly,
      ),
    );
  } else if (category === "tutoring") {
    serviceItems.push(
      makeField(
        "Subjects",
        tutoringInfo.subjects || tutoringInfo.subjects_needed,
      ),
      makeField(
        "Student age",
        tutoringInfo.student_age || tutoringInfo.age_range_of_student,
      ),
      makeField("Current grade", tutoringInfo.current_grade),
      makeField("Learning goal", tutoringInfo.purpose_of_learning),
      makeField(
        "Learning environment",
        tutoringInfo.learning_environment_needed,
      ),
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
      makeField("Full name", userName(user)),
      makeField("Email", user?.email),
      makeField("Phone number", user?.phone_number || user?.phone),
      makeField("User type", userTypeLabel(user?.user_type)),
      makeField("Account status", user?.is_active ? "Active" : "Suspended"),
      makeField(
        "Joined",
        formatDateTime(user?.date_joined || user?.onboardDate),
      ),
      makeField(
        "Last login",
        formatDateTime(user?.last_login || user?.lastLoginDate),
      ),
    ]),
    makeSection("Location", [
      makeField(
        "Use current location",
        location.use_current_location ? "Yes" : "No",
      ),
      makeField("Preferred language", location.preferred_language),
      makeField("Country", location.country || user?.location_details?.country),
      makeField("State", location.state || user?.location_details?.state),
      makeField("City", location.city || user?.location_details?.city),
      makeField(
        "Zip code",
        location.zip_code || user?.location_details?.zip_code,
      ),
      makeField(
        "Nationality",
        location.nationality || user?.location_details?.nationality,
      ),
    ]),
    makeSection("Care Request", [
      makeField(
        "Service category",
        request.service_category_label ||
          serviceCategoryLabel(request.service_category),
      ),
      makeField("Request title", request.title),
      makeField("Summary", request.summary),
      makeField("Message to provider", request.message_to_provider),
    ]),
    makeSection(
      "Service Details",
      serviceItems.length ? serviceItems : [makeField("Details", EMPTY_VALUE)],
    ),
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
      makeField(
        "Verification status",
        verification.status_label || verification.status,
      ),
      makeField("Verification feedback", verification.feedback),
      makeField(
        "Government ID",
        verification.government_id_url ? "Uploaded" : EMPTY_VALUE,
      ),
      makeField("Subscription status", user?.subscription_status),
      makeField("Requests posted", user?.request_count),
    ]),
  ];
};

const buildAdminSections = (user) => [
  makeSection("Identity", [
    makeField("Full name", userName(user)),
    makeField("Email", user?.email),
    makeField("Phone number", user?.phone_number || user?.phone),
    makeField(
      "User type",
      userTypeLabel(user?.user_type || (user?.is_staff ? "admin" : "")),
    ),
    makeField("Account status", user?.is_active ? "Active" : "Suspended"),
    makeField("Joined", formatDateTime(user?.date_joined || user?.onboardDate)),
    makeField(
      "Last login",
      formatDateTime(user?.last_login || user?.lastLoginDate),
    ),
  ]),
];

function Users({ initialStat = "all" }) {
  const dispatch = useDispatch();
  const { stats, users } = useSelector(
    (s) => s.adminUsers || { stats: {}, users: [] },
  );
  const currentUserId = useSelector((s) => s.auth?.user?.id);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortBy, setSortBy] = useState({ key: "onboard", dir: "desc" });
  const [activeStat, setActiveStat] = useState(initialStat);
  const [accountStatusFilter, setAccountStatusFilter] = useState("All");
  const [editRow, setEditRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    setSelectedIds([]); // Clear selection when switching tabs
    dispatch(fetchAdminStats());
  }, [dispatch, activeStat]);

  useEffect(() => {
    setActiveStat(initialStat);
  }, [initialStat]);

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
      const profile = u.onboarding_details || {};
      const location = u.location_details || {};
      setEditRow({
        ...u,
        id: u.id,
        name: userName(u),
        userType: userTypeLabel(u.user_type),
        email: u.email,
        phone: u.phone_number || profile.phone_number || "",
        onboard: u.date_joined ? dayjs(u.date_joined).format("DD-MM-YYYY") : "",
        lastLogin: u.last_login ? dayjs(u.last_login).format("DD-MM-YYYY") : "",
        profileImageUrl: u.profile_image_url || "",
        is_online: Boolean(u.is_online),
        requestHistory: u.request_count ?? 0,
        requestsMade: u.request_count ?? 0,
        country: u.country || profile.country || location.country || "",
        city: profile.city || location.city || "",
        nationality: profile.nationality || location.nationality || "",
        accountStatus: u.is_active ? "Active" : "Suspended",
        is_suspend: !u.is_active,
        earnings: u.earnings || "-",
        is_verified:
          u.is_verified ??
          (u.verification?.status === "verified" ||
            u.verification?.status === "approved"),
        verification_status: u.verification?.status || "pending",
        documents_received: u.verification?.status === "documents_received",
        screening_status:
          u.screening?.status || u.screening_status || "pending",
        screening: u.screening || null,
        profile_image_url: u.profile_image_url || "",
        verification: u.verification || null,
        onboarding_details: u.onboarding_details || null,
      });
    }
  }, [currentUser, selectedUserId]);

  const detailUser =
    currentUser && currentUser.id === selectedUserId ? currentUser : editRow;
  const rows = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.map((u) => ({
      id: u.id,
      name: u.full_name || `User ${u.id}`,
      user_type: u.user_type || (u.is_staff ? "admin" : ""),
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
      is_online: Boolean(u.is_online),
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
      has_profile_picture:
        u.has_profile_picture ?? Boolean(u.profile_image_url),
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
    ? detailUser.user_type === "provider"
      ? buildProviderSections(detailUser)
      : detailUser.user_type === "seeker"
        ? buildSeekerSections(detailUser)
        : buildAdminSections(detailUser)
    : [];
  const profileDraft = editRow?.onboarding_details || {};
  const categoryDraft = profileDraft.category_specific_details || {};
  const setEditValue = (key, value) =>
    setEditRow((previous) => ({ ...previous, [key]: value }));
  const setProfileValue = (key, value) =>
    setEditRow((previous) => ({
      ...previous,
      onboarding_details: {
        ...(previous.onboarding_details || {}),
        [key]: value,
      },
    }));
  const setCategoryValue = (key, value) =>
    setEditRow((previous) => ({
      ...previous,
      onboarding_details: {
        ...(previous.onboarding_details || {}),
        category_specific_details: {
          ...(previous.onboarding_details?.category_specific_details || {}),
          [key]: value,
        },
      },
    }));
  const listValue = (value) =>
    Array.isArray(value) ? value.join(", ") : value || "";
  const listChange = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  // Close profile filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        profileFilterRef.current &&
        !profileFilterRef.current.contains(e.target)
      ) {
        setProfileFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleProfileFilter = (value) => {
    setProfileStatusFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const profileFilterOptions = [
    { value: "Complete", label: "Completed Profile" },
    { value: "Incomplete", label: "Incomplete Profile" },
    { value: "Verified", label: "Verified Users" },
    { value: "NotVerified", label: "Not Verified Users" },
    { value: "DocumentsReceived", label: "Documents Received" },
    { value: "NoPhoto", label: "No Profile Picture" },
  ];

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
        String(r.location || "")
          .toLowerCase()
          .includes(locationFilter.toLowerCase()),
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
          if (f === "Verified") return isVerifiedRow(r);
          if (f === "NotVerified") return !isVerifiedRow(r);
          if (f === "DocumentsReceived") {
            return (
              r.documents_received ||
              r.verification_status === "documents_received"
            );
          }
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
  }, [
    rows,
    query,
    locationFilter,
    accountStatusFilter,
    sortBy,
    profileStatusFilters,
  ]);

  const dashboardStats = useMemo(() => {
    const providersFromRows = rows.filter(
      (row) => row.user_type === "provider",
    ).length;
    const seekersFromRows = rows.filter(
      (row) => row.user_type === "seeker",
    ).length;

    return {
      totalUsers: Number(stats?.total_users ?? rows.length ?? 0),
      providers: Number(stats?.total_providers ?? providersFromRows ?? 0),
      seekers: Number(stats?.total_seekers ?? seekersFromRows ?? 0),
      newSignups: Number(stats?.new_sign_ups ?? 0),
    };
  }, [rows, stats]);

  const profileStats = useMemo(() => {
    const source = rows;
    const verified = source.filter((row) => isVerifiedRow(row)).length;
    const incomplete = source.filter((row) => !row.is_profile_complete).length;
    const awaitingVerification = source.filter(
      (row) =>
        (row.verification_status === "documents_received" ||
          row.documents_received) &&
        !isVerifiedRow(row),
    ).length;

    return {
      verified,
      incomplete,
      awaitingVerification,
    };
  }, [rows]);

  const statsConfig = [
    {
      key: "all",
      label: "All users",
      value: dashboardStats.totalUsers,
      icon: CubeIcon,
    },
    {
      key: "providers",
      label: "Care Providers",
      value: dashboardStats.providers,
      icon: CubeIconGreen,
    },
    {
      key: "seekers",
      label: "Care Seekers",
      value: dashboardStats.seekers,
      icon: CubeIconPink,
    },
    {
      key: "signups",
      label: "New signups",
      value: dashboardStats.newSignups,
      icon: CubeIconOrange,
    },
  ];

  const profileStatsConfig = [
    {
      key: "verified",
      label: "Verified",
      value: profileStats.verified,
      icon: CubeIconGreen,
      color: "green",
      filterValue: "Verified",
    },
    {
      key: "incomplete",
      label: "Incomplete Profiles",
      value: profileStats.incomplete,
      icon: CubeIconBlue,
      color: "red",
      filterValue: "Incomplete",
    },
    {
      key: "awaitingVerification",
      label: "Awaiting Verification",
      value: profileStats.awaitingVerification,
      icon: CubeIconOrange,
      color: "yellow",
      filterValue: "DocumentsReceived",
    },
  ];

  const visibleCount = filtered.length;

  const {
    page: currentPage,
    setPage: setCurrentPage,
    pageSize,
    totalPages,
    visibleRows: paginated,
  } = useClientPagination(filtered, {
    pageSize: 20,
    resetKey: JSON.stringify([
      activeStat,
      query,
      locationFilter,
      accountStatusFilter,
      sortBy,
      profileStatusFilters,
    ]),
  });

  useEffect(() => {
    setSelectedIds([]);
  }, [
    activeStat,
    query,
    locationFilter,
    accountStatusFilter,
    sortBy.key,
    sortBy.dir,
    profileStatusFilters,
  ]);

  const paginatedIds = useMemo(
    () => paginated.map((row) => row.id),
    [paginated],
  );
  const allPageSelected =
    paginatedIds.length > 0 &&
    paginatedIds.every((id) => selectedIds.includes(id));

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
    setIsEditing(false);
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
    if (isVerifiedRow(row)) {
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
      <span
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${tone}`}
      >
        Screening: {screeningLabel(status)}
      </span>
    );
  };

  return (
    <>
      <div className="min-h-full w-full bg-[#f3f7fa] px-3 py-4 text-slate-900 font-sfpro sm:px-5 lg:px-7">
        <div className="mx-auto w-full max-w-[1480px]">
          {/* Alert */}
          {alert && (
            <div
              className={`mb-4 rounded-md border px-4 py-3 ${
                alert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
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

          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {statsConfig.map((s) => {
              const isActive = activeStat === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveStat(s.key)}
                  className={`min-h-[116px] rounded-xl border p-3.5 text-left transition sm:p-4 ${
                    isActive
                      ? "border-[#102f42] bg-[#102f42] text-white shadow-[0_12px_24px_-16px_rgba(16,47,66,0.65)]"
                      : "border-slate-200/90 bg-white text-slate-900 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.5)] hover:border-[#8acfe7]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col items-start">
                      <div
                        className={`mb-4 flex h-8 w-8 items-center justify-center rounded-full ${
                          isActive ? "bg-white/10" : "bg-slate-100"
                        }`}
                      >
                        {(() => {
                          const Icon = s.icon || CubeIcon;
                          return (
                            <Icon
                              className={`h-4 w-4 ${isActive ? "text-white" : "text-[#0b93c6]"}`}
                            />
                          );
                        })()}
                      </div>
                      <div
                        className={`text-xs font-medium sm:text-sm ${isActive ? "text-white" : "text-slate-700"}`}
                      >
                        {s.label}
                      </div>
                      {isActive && (
                        <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.16em] text-white/60">
                          Selected
                        </div>
                      )}
                    </div>
                    <div
                      className={`text-[25px] font-semibold tracking-tight ${
                        isActive ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {s.value.toLocaleString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 focus-within:border-[#0b93c6] focus-within:ring-2 focus-within:ring-[#0b93c6]/10">
                  <FaSearch className="mr-2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search users"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="relative sm:w-36" ref={profileFilterRef}>
                <button
                  type="button"
                  onClick={() => setProfileFilterOpen((open) => !open)}
                  className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#8acfe7] hover:bg-[#f8fcfe]"
                >
                  Filter
                  <FaChevronDown className="text-slate-400" />
                </button>

                {profileFilterOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-[min(320px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)]">
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-slate-500">
                        Location
                        <select
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0b93c6] focus:ring-2 focus:ring-[#0b93c6]/10"
                        >
                          <option value="All">All locations</option>
                          {locationOptions.map((location) => (
                            <option key={location} value={location}>
                              {location}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-xs font-medium text-slate-500">
                        Account status
                        <select
                          value={accountStatusFilter}
                          onChange={(e) =>
                            setAccountStatusFilter(e.target.value)
                          }
                          className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0b93c6] focus:ring-2 focus:ring-[#0b93c6]/10"
                        >
                          <option value="All">All accounts</option>
                          <option value="Active">Active accounts</option>
                          <option value="Suspended">Suspended accounts</option>
                        </select>
                      </label>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Profile status
                        </p>
                        <div className="mt-1.5 space-y-1">
                          {profileFilterOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={profileStatusFilters.includes(
                                  option.value,
                                )}
                                onChange={() =>
                                  toggleProfileFilter(option.value)
                                }
                                className="h-4 w-4 rounded border-slate-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-[#0b93c6] hover:text-[#087fa9]"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b93c6] px-4 py-2.5 text-sm font-medium text-white shadow-[0_5px_12px_-8px_rgba(11,147,198,0.8)] transition hover:bg-[#087fa9]"
              >
                <FaFileExport />
                Export
              </button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center divide-y divide-slate-200 border-y border-slate-200 bg-white px-3 sm:divide-x sm:divide-y-0 sm:px-4">
            {profileStatsConfig.map((s) => {
              const active = profileStatusFilters.includes(s.filterValue);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleProfileFilter(s.filterValue)}
                  className={`flex flex-1 items-center justify-between gap-4 py-3 text-left transition sm:min-w-[190px] sm:px-4 ${
                    s.color === "red"
                      ? active
                        ? "bg-red-50"
                        : "hover:bg-red-50"
                      : s.color === "yellow"
                        ? active
                          ? "bg-yellow-50"
                          : "hover:bg-yellow-50"
                        : active
                          ? "bg-emerald-50"
                          : "hover:bg-emerald-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                        {s.label}
                      </div>
                      <div className="mt-0.5 text-xl font-semibold text-slate-900">
                        {s.value.toLocaleString()}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {active ? "Click to clear" : "Click to filter"}
                      </div>
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        s.color === "red"
                          ? "bg-red-100"
                          : s.color === "yellow"
                            ? "bg-yellow-100"
                            : "bg-green-100"
                      }`}
                    >
                      {(() => {
                        const Icon = s.icon || CubeIcon;
                        return <Icon className="h-5 w-5 text-slate-700" />;
                      })()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mb-5 text-[11px] text-slate-400">
            Click a status card to filter instantly.
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>{selectedIds.length.toLocaleString()} selected</span>
            <span>{visibleCount.toLocaleString()} visible after filters</span>
          </div>

          {/* Documents Received Modal */}
          {showDocumentsModal && selectedUserForDocs && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Mark Documents Received
                  </h3>
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
                            error?.error ||
                            "Failed to mark documents as received",
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
                  Update screening status for {selectedIds.length} selected
                  users.
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
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-[#0E2F43]/30 transition-opacity"
                onClick={() => {
                  dispatch(clearCurrentUser());
                  setSelectedUserId(null);
                  setEditRow(null);
                }}
              />
              <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300">
                <button
                  type="button"
                  className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-slate-300 hover:text-[#0E2F43]"
                  onClick={() => {
                    dispatch(clearCurrentUser());
                    setSelectedUserId(null);
                    setEditRow(null);
                  }}
                  aria-label="Close user details"
                >
                  <FaTimes className="h-4 w-4" />
                </button>

                <div className="relative border-b border-slate-200 bg-[#f8fafc] px-6 py-7 text-[#0E2F43] sm:px-8">
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#0b93c6]" />
                  <div className="flex items-start gap-4 pr-10">
                    <div className="relative shrink-0">
                      <UserAvatar
                        name={editRow.name}
                        imageUrl={
                          editRow.profileImageUrl || editRow.profile_image_url
                        }
                        className="h-20 w-20 rounded-2xl bg-[#e5f5fa] shadow-[0_8px_20px_-12px_rgba(14,47,67,0.65)] ring-4 ring-white"
                        textClassName="text-2xl text-[#0E2F43]"
                      />
                      {(editRow.profileImageUrl ||
                        editRow.profile_image_url) && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Are you sure you want to delete this user's profile image?",
                              )
                            )
                              return;
                            try {
                              await dispatch(
                                deleteUserImage(editRow.id),
                              ).unwrap();
                              setEditRow((prev) => ({
                                ...prev,
                                profileImageUrl: "",
                                profile_image_url: "",
                              }));
                              if (alertTimerRef.current) {
                                clearTimeout(alertTimerRef.current);
                                alertTimerRef.current = null;
                              }
                              setAlert({
                                type: "success",
                                text: "Profile image deleted successfully",
                              });
                              alertTimerRef.current = setTimeout(
                                () => setAlert(null),
                                3000,
                              );
                            } catch (err) {
                              console.error(err);
                              if (alertTimerRef.current) {
                                clearTimeout(alertTimerRef.current);
                                alertTimerRef.current = null;
                              }
                              setAlert({
                                type: "error",
                                text: "Failed to delete profile image",
                              });
                              alertTimerRef.current = setTimeout(
                                () => setAlert(null),
                                3000,
                              );
                            }
                          }}
                          className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white shadow-md transition hover:bg-rose-600"
                          title="Delete profile image"
                          aria-label="Delete profile image"
                        >
                          <FaTrashAlt className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {userTypeLabel(editRow.user_type)}
                      </p>
                      <h3 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[#0E2F43]">
                        {editRow.name}
                      </h3>
                      <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-slate-600">
                        <FaEnvelope className="h-3.5 w-3.5 shrink-0 text-[#0b93c6]" />
                        <span className="truncate">{editRow.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 pt-4">
                    {getVerificationBadge(editRow)}
                    {getScreeningBadge(editRow)}
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span
                        className={`h-2 w-2 rounded-full ${editRow.accountStatus === "Active" ? "bg-emerald-500" : "bg-rose-500"}`}
                      />
                      {editRow.accountStatus}
                    </span>
                    <span className="text-xs text-slate-500">
                      Joined{" "}
                      <span className="font-medium text-slate-700">
                        {editRow.onboard}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0E2F43] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174b68] active:translate-y-px"
                  >
                    <FaEdit className="h-3.5 w-3.5" />
                    Edit profile
                  </button>

                  {currentUserLoading && (
                    <p className="mt-4 text-sm text-slate-500">
                      Refreshing full profile details...
                    </p>
                  )}
                  {currentUserError && (
                    <p className="mt-4 text-sm text-red-600">
                      Unable to load the full profile details.
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto bg-white px-6 py-6 sm:px-8">
                  {isEditing ? (
                    <form
                      id="admin-user-edit"
                      className="space-y-6"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        try {
                          const providerData =
                            editRow.user_type === "provider"
                              ? {
                                  ...profileDraft,
                                  phone_number: editRow.phone,
                                  country: editRow.country,
                                  city: editRow.city || profileDraft.city,
                                  nationality:
                                    editRow.nationality ||
                                    profileDraft.nationality,
                                  monthly_rate: profileDraft.monthly_rate,
                                }
                              : undefined;
                          const savedName =
                            providerData &&
                            (profileDraft.first_name || profileDraft.last_name)
                              ? [
                                  profileDraft.first_name,
                                  profileDraft.last_name,
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                              : editRow.name;
                          const saved = await dispatch(
                            updateUser({
                              id: editRow.id,
                              changes: {
                                full_name: savedName,
                                email: editRow.email,
                                phone_number: editRow.phone,
                                username: editRow.username || editRow.email,
                                country: editRow.country,
                                user_type: editRow.user_type,
                                is_active: !editRow.is_suspend,
                                is_staff: Boolean(editRow.is_staff),
                                is_superuser: Boolean(editRow.is_superuser),
                                ...(providerData
                                  ? { profile_data: providerData }
                                  : { onboarding_details: profileDraft }),
                              },
                            }),
                          ).unwrap();
                          setEditRow((previous) => ({
                            ...previous,
                            ...saved,
                            name: saved.full_name || previous.name,
                            phone: saved.phone_number || previous.phone,
                            onboarding_details:
                              saved.onboarding_details ||
                              previous.onboarding_details,
                          }));
                          setIsEditing(false);
                          setAlert({
                            type: "success",
                            text: "User details saved.",
                          });
                        } catch (saveError) {
                          setAlert({
                            type: "error",
                            text:
                              saveError?.email?.[0] ||
                              saveError?.profile_data?.hourly_rate ||
                              saveError?.error ||
                              "Failed to save user details.",
                          });
                        }
                      }}
                    >
                      <section>
                        <div className="mb-3 flex items-end justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">
                              Account details
                            </h4>
                            <p className="mt-1 text-xs text-slate-500">
                              Basic identity and access settings.
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <EditField
                            label="Full name"
                            value={editRow.name}
                            onChange={(value) => setEditValue("name", value)}
                          />
                          <EditField
                            label="Email address"
                            type="email"
                            value={editRow.email}
                            onChange={(value) => setEditValue("email", value)}
                          />
                          <EditField
                            label="Phone number"
                            value={editRow.phone}
                            onChange={(value) => setEditValue("phone", value)}
                          />
                          <EditField
                            label="Username"
                            value={editRow.username || ""}
                            onChange={(value) =>
                              setEditValue("username", value)
                            }
                          />
                          <EditField
                            label="Country"
                            value={editRow.country}
                            onChange={(value) => {
                              setEditValue("country", value);
                              setProfileValue("country", value);
                            }}
                          />
                          <EditField
                            label="City"
                            value={editRow.city}
                            onChange={(value) => {
                              setEditValue("city", value);
                              setProfileValue("city", value);
                            }}
                          />
                          <EditField
                            label="User type"
                            value={editRow.user_type || "seeker"}
                            onChange={(value) =>
                              setEditValue("user_type", value)
                            }
                            options={[
                              ["seeker", "Care seeker"],
                              ["provider", "Care provider"],
                            ]}
                          />
                          <EditField
                            label="Account status"
                            value={editRow.is_suspend ? "suspended" : "active"}
                            onChange={(value) =>
                              setEditValue("is_suspend", value === "suspended")
                            }
                            options={[
                              ["active", "Active"],
                              ["suspended", "Suspended"],
                            ]}
                          />
                        </div>
                        <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(editRow.is_staff)}
                            onChange={(event) =>
                              setEditValue("is_staff", event.target.checked)
                            }
                            className="mt-0.5 accent-[#0b93c6]"
                          />
                          <span>
                            <span className="font-medium">Staff status</span>
                            <span className="block text-xs text-slate-500">
                              Allows this user to log into the admin site.
                            </span>
                          </span>
                        </label>
                        <label className="mt-3 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(editRow.is_superuser)}
                            onChange={(event) =>
                              setEditValue("is_superuser", event.target.checked)
                            }
                            className="mt-0.5 accent-[#0b93c6]"
                          />
                          <span>
                            <span className="font-medium">
                              Superuser status
                            </span>
                            <span className="block text-xs text-slate-500">
                              Grants all admin permissions.
                            </span>
                          </span>
                        </label>
                      </section>
                      <section className="border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-semibold text-slate-900">
                          Profile image
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Upload a replacement image for this account.
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            try {
                              const saved = await dispatch(
                                uploadUserImage({ id: editRow.id, file }),
                              ).unwrap();
                              setEditRow((previous) => ({
                                ...previous,
                                profileImageUrl:
                                  saved.profile_image_url ||
                                  previous.profileImageUrl,
                              }));
                            } catch (uploadError) {
                              setAlert({
                                type: "error",
                                text:
                                  uploadError?.error ||
                                  "Failed to upload image.",
                              });
                            }
                          }}
                          className={`${EDIT_CONTROL} file:mr-3 file:rounded-md file:border-0 file:bg-[#0b93c6] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white`}
                        />
                      </section>
                      {editRow.user_type === "provider" ? (
                        <>
                          <section className="border-t border-slate-100 pt-6">
                            <h4 className="text-sm font-semibold text-slate-900">
                              Provider profile
                            </h4>
                            <p className="mt-1 text-xs text-slate-500">
                              The same professional details providers manage in
                              Settings.
                            </p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <EditField
                                label="First name"
                                value={profileDraft.first_name}
                                onChange={(value) =>
                                  setProfileValue("first_name", value)
                                }
                              />
                              <EditField
                                label="Last name"
                                value={profileDraft.last_name}
                                onChange={(value) =>
                                  setProfileValue("last_name", value)
                                }
                              />
                              <EditField
                                label="Service category"
                                value={profileDraft.service_category || ""}
                                onChange={(value) =>
                                  setProfileValue("service_category", value)
                                }
                                options={[
                                  ["", "Select category"],
                                  ["childcare", "Childcare"],
                                  ["elderlycare", "Elderly care"],
                                  ["tutoring", "Tutoring"],
                                  ["housekeeping", "Housekeeping"],
                                ]}
                              />
                              <EditField
                                label="Experience level"
                                value={profileDraft.experience_level}
                                onChange={(value) =>
                                  setProfileValue("experience_level", value)
                                }
                              />
                              <EditField
                                label="Years of experience"
                                type="number"
                                value={profileDraft.years_of_experience}
                                onChange={(value) =>
                                  setProfileValue("years_of_experience", value)
                                }
                              />
                              <EditField
                                label="Native language"
                                value={profileDraft.native_language}
                                onChange={(value) =>
                                  setProfileValue("native_language", value)
                                }
                              />
                              <EditField
                                label="Healthcare professional"
                                value={profileDraft.healthcare_professional}
                                onChange={(value) =>
                                  setProfileValue(
                                    "healthcare_professional",
                                    value,
                                  )
                                }
                              />
                              <EditField
                                label="State"
                                value={profileDraft.state}
                                onChange={(value) =>
                                  setProfileValue("state", value)
                                }
                              />
                              <EditField
                                label="Postcode"
                                value={profileDraft.zip_code}
                                onChange={(value) =>
                                  setProfileValue("zip_code", value)
                                }
                              />
                              <EditField
                                label="Nationality"
                                value={editRow.nationality}
                                onChange={(value) => {
                                  setEditValue("nationality", value);
                                  setProfileValue("nationality", value);
                                }}
                              />
                            </div>
                            <div className="mt-4 grid gap-4">
                              <EditField
                                label="Profile title"
                                value={profileDraft.profile_title}
                                onChange={(value) =>
                                  setProfileValue("profile_title", value)
                                }
                              />
                              <EditField
                                label="About me"
                                value={profileDraft.about_me}
                                onChange={(value) =>
                                  setProfileValue("about_me", value)
                                }
                                textarea
                              />
                              <EditField
                                label="Why they want to work"
                                value={profileDraft.work_reason}
                                onChange={(value) =>
                                  setProfileValue("work_reason", value)
                                }
                                textarea
                              />
                            </div>
                          </section>
                          <section className="border-t border-slate-100 pt-6">
                            <h4 className="text-sm font-semibold text-slate-900">
                              Rates and availability
                            </h4>
                            <p className="mt-1 text-xs text-slate-500">
                              Keep both values visible. The selected billing
                              cycle is used when applying for work.
                            </p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <EditField
                                label="Hourly rate"
                                type="number"
                                value={profileDraft.hourly_rate}
                                onChange={(value) =>
                                  setProfileValue("hourly_rate", value)
                                }
                                hint="Stored as the provider’s base rate."
                              />
                              <EditField
                                label="Monthly rate"
                                type="number"
                                value={
                                  profileDraft.monthly_rate ??
                                  (Number(profileDraft.hourly_rate)
                                    ? Number(profileDraft.hourly_rate) * 160
                                    : "")
                                }
                                onChange={(value) =>
                                  setProfileValue("monthly_rate", value)
                                }
                                hint="Calculated by the app at 160 hours/month."
                              />
                            </div>
                            <div className="mt-4 flex rounded-lg bg-slate-100 p-1">
                              {[
                                ["hourly", "Hourly"],
                                ["monthly", "Monthly"],
                              ].map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() =>
                                    setProfileValue("billing_cycle", value)
                                  }
                                  className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${profileDraft.billing_cycle === value ? "bg-white text-[#0b93c6] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                              <EditField
                                label="Languages"
                                value={listValue(profileDraft.languages)}
                                onChange={(value) =>
                                  setProfileValue(
                                    "languages",
                                    listChange(value),
                                  )
                                }
                              />
                              <EditField
                                label="Additional services"
                                value={listValue(
                                  profileDraft.additional_services,
                                )}
                                onChange={(value) =>
                                  setProfileValue(
                                    "additional_services",
                                    listChange(value),
                                  )
                                }
                              />
                              <EditField
                                label="Skills"
                                value={listValue(profileDraft.skills)}
                                onChange={(value) =>
                                  setProfileValue("skills", listChange(value))
                                }
                              />
                            </div>
                          </section>
                          <section className="border-t border-slate-100 pt-6">
                            <h4 className="text-sm font-semibold text-slate-900">
                              Category details
                            </h4>
                            <p className="mt-1 text-xs text-slate-500">
                              Edit the category-specific answers saved during
                              onboarding.
                            </p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              {Object.entries(categoryDraft)
                                .filter(([key]) => key !== "billing_cycle")
                                .map(([key, value]) => (
                                  <EditField
                                    key={key}
                                    label={humanizeKey(key)}
                                    value={listValue(value)}
                                    onChange={(nextValue) =>
                                      setCategoryValue(
                                        key,
                                        Array.isArray(value)
                                          ? listChange(nextValue)
                                          : nextValue,
                                      )
                                    }
                                  />
                                ))}
                            </div>
                          </section>
                        </>
                      ) : (
                        <section className="border-t border-slate-100 pt-6">
                          <h4 className="text-sm font-semibold text-slate-900">
                            Latest care request
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
                            Edit the latest request posted by this care seeker.
                          </p>
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <EditField
                              label="Service category"
                              value={profileDraft.service_category || ""}
                              onChange={(value) =>
                                setProfileValue("service_category", value)
                              }
                              options={[
                                ["", "Select category"],
                                ["childcare", "Childcare"],
                                ["elderlycare", "Elderly care"],
                                ["tutoring", "Tutoring"],
                                ["housekeeping", "Housekeeping"],
                              ]}
                            />
                            <EditField
                              label="Job type"
                              value={profileDraft.job_type || "one_off"}
                              onChange={(value) =>
                                setProfileValue("job_type", value)
                              }
                              options={[
                                ["one_off", "One-off"],
                                ["recurring", "Recurring"],
                              ]}
                            />
                            <EditField
                              label="Request title"
                              value={profileDraft.title}
                              onChange={(value) =>
                                setProfileValue("title", value)
                              }
                            />
                            <EditField
                              label="Billing cycle"
                              value={profileDraft.billing_cycle || "hourly"}
                              onChange={(value) =>
                                setProfileValue("billing_cycle", value)
                              }
                              options={[
                                ["hourly", "Hourly"],
                                ["monthly", "Monthly"],
                              ]}
                            />
                            <EditField
                              label="Start date"
                              type="date"
                              value={profileDraft.start_date}
                              onChange={(value) =>
                                setProfileValue("start_date", value)
                              }
                            />
                            <EditField
                              label="End date"
                              type="date"
                              value={profileDraft.end_date}
                              onChange={(value) =>
                                setProfileValue("end_date", value)
                              }
                            />
                            <EditField
                              label="Start time"
                              type="time"
                              value={profileDraft.start_time}
                              onChange={(value) =>
                                setProfileValue("start_time", value)
                              }
                            />
                            <EditField
                              label="End time"
                              type="time"
                              value={profileDraft.end_time}
                              onChange={(value) =>
                                setProfileValue("end_time", value)
                              }
                            />
                            <EditField
                              label="Minimum budget"
                              type="number"
                              value={profileDraft.price_min}
                              onChange={(value) =>
                                setProfileValue("price_min", value)
                              }
                            />
                            <EditField
                              label="Maximum budget"
                              type="number"
                              value={profileDraft.price_max}
                              onChange={(value) =>
                                setProfileValue("price_max", value)
                              }
                            />
                          </div>
                          <div className="mt-4 grid gap-4">
                            <EditField
                              label="Summary"
                              value={profileDraft.summary}
                              onChange={(value) =>
                                setProfileValue("summary", value)
                              }
                              textarea
                            />
                            <EditField
                              label="Message to provider"
                              value={profileDraft.message_to_provider}
                              onChange={(value) =>
                                setProfileValue("message_to_provider", value)
                              }
                              textarea
                            />
                            <EditField
                              label="Skills and expertise"
                              value={listValue(
                                profileDraft.skills_and_expertise,
                              )}
                              onChange={(value) =>
                                setProfileValue(
                                  "skills_and_expertise",
                                  listChange(value),
                                )
                              }
                            />
                          </div>
                        </section>
                      )}
                    </form>
                  ) : (
                    <div className="grid gap-4">
                      <GovernmentIdPreview
                        verification={detailUser?.verification}
                      />
                      {detailSections.map((section) => (
                        <section
                          key={section.title}
                          className="border-b border-gray-100 pb-5 last:border-b-0"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                              {section.title}
                            </h4>
                          </div>
                          <div className="space-y-3 text-sm">
                            {section.items.map((item) => (
                              <div
                                key={item.label}
                                className="flex items-start justify-between gap-4 border-b border-gray-50 pb-2"
                              >
                                <p className="text-xs text-[#A6A6A7]">
                                  {item.label}
                                </p>
                                <p className="max-w-[62%] whitespace-pre-wrap break-words text-right text-sm font-semibold text-[#0E2F43]">
                                  {item.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 border-t border-[#EAECF0] bg-white px-6 py-4 sm:px-8">
                  {isEditing ? (
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        form="admin-user-edit"
                        className="rounded-lg bg-[#0b93c6] px-5 py-2.5 text-sm font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForDocs(editRow);
                          setShowDocumentsModal(true);
                        }}
                        className="w-full rounded-md border border-slate-300 py-2 text-slate-700 sm:w-auto sm:px-4"
                      >
                        Mark documents
                      </button>
                      {editRow.documents_received && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForPayment(editRow);
                            setShowManualPaymentModal(true);
                          }}
                          className="w-full rounded-md bg-blue-600 py-2 text-white sm:w-auto sm:px-4"
                        >
                          Approve user
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSingleEmailUser(editRow);
                          setShowEmailModal(true);
                        }}
                        className="w-full rounded-md border border-slate-300 py-2 text-slate-700 sm:w-auto sm:px-4"
                      >
                        Send email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForTemplate(editRow);
                          setShowTemplatesModal(true);
                        }}
                        className="w-full rounded-md border border-slate-300 py-2 text-slate-700 sm:w-auto sm:px-4"
                      >
                        Quick message
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForTimeline(editRow.id);
                          setShowTimelineModal(true);
                        }}
                        className="w-full rounded-md border border-slate-300 py-2 text-slate-700 sm:w-auto sm:px-4"
                      >
                        View timeline
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteRow(editRow)}
                        className="w-full rounded-md border border-red-200 py-2 text-red-600 sm:w-auto sm:px-4"
                      >
                        Delete
                      </button>
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
                              const message =
                                payload?.data?.status || "User reactivated";
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
                              const message =
                                payload?.data?.status || "User suspended";
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
                                          status:
                                            result?.data?.status ||
                                            screeningStatus,
                                          status_label:
                                            result?.data?.status_label ||
                                            screeningLabel(screeningStatus),
                                        },
                                        screening_status:
                                          result?.data?.status ||
                                          screeningStatus,
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
                  )}
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
                      verificationLoading ||
                      !manualPaymentData.payment_received_date
                    }
                  >
                    {verificationLoading
                      ? "Approving..."
                      : "Approve & Mark Paid"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile cards */}
          <div className="hidden">
            {paginated.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                No results
              </div>
            ) : (
              paginated.map((r) => (
                <article
                  key={r.id}
                  onClick={() => openUserDetail(r)}
                  className="cursor-pointer rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_18px_-18px_rgba(15,23,42,0.5)] transition hover:border-[#8acfe7]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelectRow(r.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                      />
                      <UserAvatar
                        name={r.name}
                        imageUrl={r.profileImageUrl}
                        className="h-11 w-11 rounded-full bg-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.userType}
                        </div>
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
                      <div className="mt-1 break-words text-slate-900">
                        {r.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Phone
                      </div>
                      <div className="mt-1 text-slate-900">
                        {r.phone || EMPTY_VALUE}
                      </div>
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
                      <div className="mt-1 text-slate-900">
                        {r.lastUpdated || EMPTY_VALUE}
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white text-black shadow-[0_10px_24px_-20px_rgba(15,23,42,0.45)]">
            <table className="w-full text-[13px]">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[0.13em] text-slate-500">
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
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Email address</th>
                  <th className="p-3 text-left">Phone Number</th>
                  <th className="p-3 text-left">Verification Status</th>
                  <th
                    className="p-3 text-left cursor-pointer"
                    onClick={() => toggleSort("onboard")}
                  >
                    onboarding Date
                  </th>
                  <th className="hidden p-3"> </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openUserDetail(r)}
                    className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-[#f6fbfd]"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelectRow(r.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-[#0b93c6] focus:ring-[#0b93c6]"
                      />
                    </td>
                    <td className="flex items-center gap-3 px-4 py-3">
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
                    <td className="px-4 py-3 text-slate-600">{r.userType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 ${r.is_online ? "text-emerald-600" : "text-slate-400"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${r.is_online ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        {r.is_online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.email}</td>
                    <td className="px-4 py-3 text-slate-600">{r.phone}</td>
                    <td className="px-4 py-3">{getVerificationBadge(r)}</td>
                    <td className="px-4 py-3 text-slate-600">{r.onboard}</td>
                    <td className="hidden px-4 py-3">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === r.id ? null : r.id)
                          }
                          className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          •••
                        </button>
                        {openMenuId === r.id && (
                          <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white text-sm shadow-[0_12px_24px_-12px_rgba(15,23,42,0.3)]">
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
            <div className="mt-3">
              <AdminPagination
                page={currentPage}
                count={filtered.length}
                pageSize={pageSize}
                totalPages={totalPages}
                onPage={setCurrentPage}
              />
              {selectedIds.length > 0 && (
                <p className="px-1 pt-2 text-xs text-slate-500">
                  {selectedIds.length} selected
                </p>
              )}
            </div>
          )}
        </div>
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
        selectedUsers={
          singleEmailUser
            ? [singleEmailUser]
            : rows.filter((r) => selectedIds.includes(r.id))
        }
        onEmailSent={(msg) => {
          setAlert({ type: "success", text: `✅ ${msg}` });
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
          setAlert({ type: "success", text: `✅ ${msg}` });
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
