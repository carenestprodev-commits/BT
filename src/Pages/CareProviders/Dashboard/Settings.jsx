/* eslint-disable no-undef */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import PaymentModal from "./PaymentModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProviderProfile } from "../../../Redux/ProviderSettings";

function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useSelector(
    (s) => s.providerSettings || { profile: null, loading: false, error: null }
  );

  const [activeTab, setActiveTab] = useState("personal");

  const emptyForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    nationality: "",
    nationalId: "",
    language: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    about: "",
    title: "",
    yearsOfExperience: "",
    nativeLanguage: "",
    housekeeping: "",
    hourlyRate: "",
    otherServices: "",
    otherLanguages: "",
    autoSend: false,
    uploadedPhoto: null, // URL only
    uploadedId: null, // URL only
  };

  const [formData, setFormData] = useState(emptyForm);
  const [originalFormData, setOriginalFormData] = useState(emptyForm);

  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [uploadProgress, setUploadProgress] = useState({
    uploadedPhoto: 0,
    uploadedId: 0,
  });

  const [preview, setPreview] = useState({
    uploadedPhoto: null,
    uploadedId: null,
  });

  const CLOUDINARY_CLOUD_NAME = "your_cloud_name";
  const CLOUDINARY_UPLOAD_PRESET = "carenest_unsigned";

  const MAX_FILE_SIZE = 15 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];
  const ALLOWED_ID_TYPES = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "application/pdf",
  ];

  /* -------------------- HELPERS -------------------- */

  const detectChanges = (newData) =>
    Object.keys(newData).some((key) => newData[key] !== originalFormData[key]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updated = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };

    setFormData(updated);
    setHasChanges(detectChanges(updated));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: "verify", label: "Verify Identity" },
    { id: "personal", label: "Personal Information" },
    { id: "password", label: "Password" },
    { id: "other", label: "Other details" },
  ];

  /* -------------------- FILE UPLOAD -------------------- */

  const handleFileUpload = async (file, field) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File must be less than 15MB");
      return;
    }

    const allowed =
      field === "uploadedPhoto" ? ALLOWED_IMAGE_TYPES : ALLOWED_ID_TYPES;

    if (!allowed.includes(file.type)) {
      alert("Invalid file type");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }

    try {
      const url = await uploadToCloudinary(file, field);

      const updated = { ...formData, [field]: url };
      setFormData(updated);
      setHasChanges(detectChanges(updated));
    } catch {
      alert("Upload failed");
      setUploadProgress((p) => ({ ...p, [field]: 0 }));
    }
  };

  const uploadToCloudinary = (file, field) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((p) => ({
            ...p,
            [field]: Math.round((e.loaded / e.total) * 100),
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText).secure_url);
        } else reject();
      };

      xhr.onerror = reject;

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`
      );
      xhr.send(data);
    });
  };

  /* -------------------- SAVE -------------------- */

  const validateForm = () => {
    if (activeTab === "password") {
      if (formData.newPassword.length < 8) {
        setMessage({ type: "error", text: "Password must be 8+ characters" });
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: "error", text: "Passwords don't match" });
        return false;
      }
    }
    return true;
  };

  const saveSettings = async () => {
    if (activeTab === "verify") {
      if (!formData.uploadedPhoto || !formData.uploadedId) {
        setMessage({
          type: "error",
          text: "Upload profile photo and government ID",
        });
        return;
      }
      setShowPaymentModal(true);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Save failed");

      setOriginalFormData(formData);
      setHasChanges(false);
      setMessage({ type: "success", text: "Settings saved!" });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- PAYMENT -------------------- */

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      await fetch("/api/user/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadedPhoto: formData.uploadedPhoto,
          uploadedId: formData.uploadedId,
        }),
      });

      setOriginalFormData(formData);
      setHasChanges(false);
      setShowPaymentModal(false);
      setMessage({ type: "success", text: "Verification submitted!" });
    } catch {
      setMessage({ type: "error", text: "Payment failed" });
    } finally {
      setPaymentLoading(false);
    }
  };

  // Close payment modal
  const closePaymentModal = () => {
    if (!paymentLoading) {
      setShowPaymentModal(false);
    }
  };

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    dispatch(fetchProviderProfile());
  }, []);

  useEffect(() => {
    if (!profile) return;

    const populated = {
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      country: profile.country ?? "",
      state: profile.state ?? "",
      city: profile.city ?? "",
      zipCode: profile.zip_code ?? "",
      nationality: profile.nationality ?? "",
      nationalId: profile.national_id ?? "",
      language: profile.language ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      about: profile.about ?? "",
      title: profile.title ?? "",
      yearsOfExperience: profile.years_of_experience ?? "",
      nativeLanguage: profile.native_language ?? "",
      housekeeping: profile.housekeeping ?? "",
      hourlyRate: profile.hourly_rate ?? "",
      otherServices: profile.other_services ?? "",
      otherLanguages: profile.other_languages ?? "",
      autoSend: profile.auto_send ?? false,
      uploadedPhoto: profile.profile_photo ?? null,
      uploadedId: profile.government_id ?? null,
    };

    setFormData(populated);
    setOriginalFormData(populated);
    setHasChanges(false);
  }, [profile]);

  useEffect(() => {
    if (location?.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Setting" />

      <div className="flex-1 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 md:ml-64 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          {/* Header with Back Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold flex-shrink-0"
                onClick={() => navigate(-1)}
              >
                ←
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                Settings
              </h1>
            </div>
            <div className="relative hidden md:block w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-56 lg:w-80 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-100 text-gray-700 text-sm"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Tabs - Scrollable on mobile */}
          <div className="mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0">
            <div className="flex gap-4 sm:gap-6 min-w-max md:min-w-0 md:flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 font-medium transition-colors whitespace-nowrap text-xs sm:text-sm md:text-base ${
                    activeTab === tab.id
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Verify Identity Tab */}
            {activeTab === "verify" && (
              <div className="p-3 sm:p-6 md:p-8 overflow-hidden">
                <div className="mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Update photo of yourself
                  </p>

                  <div className="flex flex-col gap-4 sm:gap-6 items-stretch sm:items-start">
                    {/* Profile Photo Preview */}
                    <div className="flex-shrink-0 self-center sm:self-start">
                      {formData.uploadedPhoto ? (
                        <img
                          src={formData.uploadedPhoto}
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-100"
                          alt="Profile Preview"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Upload Area */}
                    <div className="flex-1 w-full">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, "uploadedPhoto")}
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-all
            ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
                      >
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          className="hidden"
                          id="profilePhoto"
                          onChange={(e) =>
                            handleFileUpload(e.target.files[0], "uploadedPhoto")
                          }
                        />

                        <label
                          htmlFor="profilePhoto"
                          className="cursor-pointer block"
                        >
                          <div className="flex justify-center mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                            </div>
                          </div>

                          <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base">
                            <span className="text-blue-500">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            SVG, PNG, JPG or GIF (max. 800x400px)
                          </p>
                        </label>

                        {/* Progress Bar */}
                        {uploadProgress.uploadedPhoto > 0 &&
                          uploadProgress.uploadedPhoto < 100 && (
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${uploadProgress.uploadedPhoto}%`,
                                }}
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Government ID Upload */}
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Upload government ID
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Update government ID document.
                  </p>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "uploadedId")}
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-all
        ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50"
        }`}
                  >
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg,.pdf"
                      className="hidden"
                      id="governmentId"
                      onChange={(e) =>
                        handleFileUpload(e.target.files[0], "uploadedId")
                      }
                    />

                    <label
                      htmlFor="governmentId"
                      className="cursor-pointer block"
                    >
                      {formData.uploadedId ? (
                        <div className="flex flex-col sm:flex-row items-center gap-3 p-3 sm:p-4 bg-white rounded-lg border border-blue-200 w-full sm:max-w-md mx-auto">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                              NIN, Passport, Driver's License
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                            </div>
                          </div>

                          <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base">
                            <span className="text-blue-500">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            SVG, PNG, JPG or GIF (max. 800x400px)
                          </p>
                        </>
                      )}
                    </label>

                    {/* Progress Bar */}
                    {uploadProgress.uploadedId > 0 &&
                      uploadProgress.uploadedId < 100 && (
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress.uploadedId}%` }}
                          />
                          <p className="text-xs sm:text-sm text-gray-600 mt-2">
                            {uploadProgress.uploadedId}%
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
                  <button
                    onClick={resetForm}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg border border-gray-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-500 text-white font-medium hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? "Submitting..." : "Get Verified"}
                  </button>
                </div>
              </div>
            )}

            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="p-3 sm:p-6 md:p-8">
                {message.text && (
                  <div
                    className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                      message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-500 mb-6">
                  Update your photo and personal details.
                </p>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 pl-9 sm:pl-10 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select country</option>
                        <option>South Africa</option>
                        <option>Nigeria</option>
                        <option>Kenya</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select state</option>
                        <option>Pretoria</option>
                        <option>Cape Town</option>
                        <option>Johannesburg</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <select
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select nationality</option>
                        <option>South Africa</option>
                        <option>Nigeria</option>
                        <option>Kenya</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Preferred language
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select language</option>
                        <option>English</option>
                        <option>Yoruba</option>
                        <option>Afrikaans</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        National identity number
                      </label>
                      <input
                        type="text"
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {hasChanges && (
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <button
                      onClick={resetForm}
                      className="px-4 sm:px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="px-4 sm:px-6 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="p-3 sm:p-6 md:p-8">
                {message.text && (
                  <div
                    className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                      message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-500 mb-6">
                  Update your password
                </p>

                <div className="space-y-4 sm:space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                        {showPassword.current ? (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                        {showPassword.new ? (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Your new password must be more than 8 characters.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                      >
                        {showPassword.confirm ? (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {hasChanges && (
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <button
                      onClick={resetForm}
                      className="px-4 sm:px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="px-4 sm:px-6 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}

                {/* Logout Button - Added below password fields */}
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                  <h4 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
                    Account Actions
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    Log out of your account
                  </p>
                  <button
                    onClick={() => {
                      // Clear local storage to remove tokens and onboarding state
                      try {
                        localStorage.clear();
                      } catch (e) {
                        console.warn("Failed to clear localStorage", e);
                      }
                      // Redirect to login and reload to ensure protected routes don't use stale state
                      navigate("/careproviders/login/", { replace: true });
                      // Force reload to reset any in-memory auth state
                      window.location.reload();
                    }}
                    className="px-4 sm:px-6 py-2 bg-red-500 text-white font-medium hover:bg-red-600 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}

            {/* Other Details Tab */}
            {activeTab === "other" && (
              <div className="p-3 sm:p-6 md:p-8">
                {message.text && (
                  <div
                    className={`mb-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                      message.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-500 mb-6">
                  Update your details and preferences
                </p>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Tell us about yourself
                    </label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Kindly highlight your skills and experience, the childcare services you offer and other relevant information."
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm resize-none"
                    />
                    <label className="flex items-start sm:items-center mt-3 text-xs sm:text-sm text-gray-600 gap-2">
                      <input
                        type="checkbox"
                        name="autoSend"
                        checked={formData.autoSend}
                        onChange={handleInputChange}
                        className="mt-1 sm:mt-0 rounded flex-shrink-0"
                      />
                      <span>
                        I would like to automatically send the above application
                        to potential careseekers
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Give your application a title that sums you up as a child care provider"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Years of experience
                      </label>
                      <select
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select experience</option>
                        <option>0-1</option>
                        <option>1-3</option>
                        <option>3-5</option>
                        <option>5+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Native language
                      </label>
                      <select
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select language</option>
                        <option>Yoruba</option>
                        <option>English</option>
                        <option>Afrikaans</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Choose your house keeping preference
                      </label>
                      <select
                        name="housekeeping"
                        value={formData.housekeeping}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select preference</option>
                        <option>Interested in-live jobs</option>
                        <option>Part-time only</option>
                        <option>Full-time only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Other services you offer
                      </label>
                      <select
                        name="otherServices"
                        value={formData.otherServices}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select services</option>
                        <option>Tutoring</option>
                        <option>Cooking</option>
                        <option>Cleaning</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Hourly rates
                      </label>
                      <select
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select rate</option>
                        <option>₦3,000 - ₦5,000</option>
                        <option>₦5,000 - ₦7,000</option>
                        <option>₦7,000+</option>
                      </select>
                      <p className="text-xs sm:text-sm text-green-600 mt-2">
                        Average hourly rate is ₦5,500
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Other languages
                      </label>
                      <select
                        name="otherLanguages"
                        value={formData.otherLanguages}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm"
                      >
                        <option value="">Select language</option>
                        <option>None</option>
                        <option>French</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>

                {hasChanges && (
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <button
                      onClick={resetForm}
                      className="px-4 sm:px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSettings}
                      disabled={loading}
                      className="px-4 sm:px-6 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {loading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={closePaymentModal}
        onPayment={handlePayment}
        loading={paymentLoading}
      />
    </div>
  );
}

export default Settings;
