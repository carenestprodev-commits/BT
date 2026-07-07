import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import {
  fetchPendingRequestById,
  deletePendingRequest,
  patchPendingRequest,
} from "../../../Redux/SeekerRequest";
import { createConversation } from "../../../Redux/Messenger";
import {
  ChipPanel,
  DetailRows,
  requestDetailSections,
  resolveImage,
} from "../../../Components/CareRequestSections";
import {
  initiateSeekerCheckout,
  resetPaymentState,
} from "../../../Redux/SeekerPayment";

function PendingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();

  const locationDetails = location?.state?.details || null;

  const { currentRequest } = useSelector(
    (s) => s.seekerRequests || { currentRequest: null },
  );

  // Prefer the fetched detail payload; route state is often list-shaped only.
  const source = currentRequest || locationDetails || null;

  const [summary, setSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [openingApplicationId, setOpeningApplicationId] = useState(null);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  const { authorizationUrl, error: paymentReduxError } =
    useSelector((s) => s.seekerPayment || {});

  useEffect(() => {
    const id = params.id || params.requestId || null;
    if (id) {
      dispatch(fetchPendingRequestById(id));
    }
  }, [dispatch, params.id, params.requestId]);

  useEffect(() => {
    if (!source) return;
    setSummary(source?.summary || source?.description?.[0] || "");
    const skillsArr = source?.skills_and_expertise || source?.skills || [];
    setSkillsInput(
      Array.isArray(skillsArr) ? skillsArr.join(", ") : skillsArr || "",
    );
  }, [source]);

  // Redirect to Paystack when authorization URL is received
  useEffect(() => {
    if (authorizationUrl && showPaymentModal) {
      window.location.href = authorizationUrl;
      dispatch(resetPaymentState());
    }
  }, [authorizationUrl, showPaymentModal, dispatch]);

  // Check for payment callback (reference in URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    const trxref = params.get("trxref");
    if (reference || trxref) {
      setShowPaymentModal(false);
      setPaymentSuccess(true);
      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle payment redux errors
  useEffect(() => {
    if (paymentReduxError) {
      setPaymentError(typeof paymentReduxError === "string" ? paymentReduxError : "Payment failed. Please try again.");
      setInitiatingPayment(false);
    }
  }, [paymentReduxError]);

  const matchedBooking = source?.matched_booking || null;
  const isMatched = !!matchedBooking;

  const description =
    source?.description ?? (source?.summary ? [source.summary] : []);
  const skills = source?.skills_and_expertise ?? source?.skills ?? [];
  const title = source?.title ?? source?.summary ?? "";
  const posted = source?.posted_ago || source?.posted || "";
  const applications = source?.applications || [];
  const sections = requestDetailSections(source);

  const handleMessageApplicant = async (application) => {
    const bookingId = application.id || application.booking_id;
    if (!bookingId) return alert("Missing booking id for this applicant.");
    setOpeningApplicationId(bookingId);
    const res = await dispatch(createConversation({ booking_id: bookingId }));
    setOpeningApplicationId(null);
    if (res.error) {
      alert(res.payload || res.error.message || "Could not open conversation.");
      return;
    }
    const conversationId = res.payload?.id || res.payload?.conversation_id;
    navigate(
      conversationId
        ? `/careseekers/dashboard/message/${conversationId}`
        : "/careseekers/dashboard/message",
    );
  };

  const handleMessageMatchedProvider = async () => {
    if (!matchedBooking) return;
    const conversationId = matchedBooking.conversation_id;
    if (conversationId) {
      navigate(`/careseekers/dashboard/message/${conversationId}`);
      return;
    }
    // Create a new conversation
    const bookingId = matchedBooking.id;
    if (!bookingId) return alert("Missing booking id.");
    setOpeningApplicationId(bookingId);
    const res = await dispatch(createConversation({ booking_id: bookingId }));
    setOpeningApplicationId(null);
    if (res.error) {
      alert(res.payload || res.error.message || "Could not open conversation.");
      return;
    }
    const newConversationId = res.payload?.id || res.payload?.conversation_id;
    navigate(
      newConversationId
        ? `/careseekers/dashboard/message/${newConversationId}`
        : "/careseekers/dashboard/message",
    );
  };

  const handlePayMatchedProvider = async () => {
    if (!matchedBooking) return;
    setShowPaymentModal(true);
    setPaymentSuccess(false);
    setPaymentError(null);
    setInitiatingPayment(true);

    try {
      const result = await dispatch(
        initiateSeekerCheckout({
          bookingId: matchedBooking.id,
          amount: null, // server calculates
          bookingDetails: { payment_method: "paystack" },
        }),
      );

      if (initiateSeekerCheckout.rejected.match(result)) {
        setPaymentError(
          result.payload?.message || "Payment initiation failed. Please try again.",
        );
        setInitiatingPayment(false);
      }
      // On fulfilled, authorizationUrl effect handles redirect
    } catch {
      setPaymentError("Payment initiation failed. Please try again.");
      setInitiatingPayment(false);
    }
  };

  const provider = matchedBooking?.provider || null;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sfpro">
      <Sidebar active="Requests" />

      <div className="flex-1 md:ml-64">
        {/* Sticky sub-header */}
        <div className="sticky top-[57px] md:top-0 z-30 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            &larr;
          </button>
          <h2 className="text-lg font-normal text-gray-500">Details</h2>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-6 md:px-8 overflow-y-auto">
          {/* Loading / empty state */}
          {!source && <p className="text-sm text-gray-400">Loading details&hellip;</p>}

          {source && (
            <div className="max-w-4xl">
              <h1 className="text-lg font-bold text-gray-900 mb-2">{title}</h1>
              {posted ? (
                <p className="text-xs text-gray-400 mb-6">{posted}</p>
              ) : null}

              {/* Description paragraphs */}
              {description.length > 0 && (
                <div className="text-gray-600 leading-relaxed space-y-4 mb-8 text-sm">
                  {description.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              )}

              <ChipPanel
                label="Personality and interpersonal skills"
                values={sections.requirements.personality_interpersonal_skills}
              />
              <ChipPanel
                label="Communication and language"
                values={sections.requirements.communication_language}
              />
              <ChipPanel
                label="Special preferences"
                values={sections.requirements.special_preferences}
              />
              <ChipPanel
                label="Preferred option"
                values={
                  sections.requirements.preferred_options_list ||
                  sections.requirements.preferred_option
                }
              />
              <ChipPanel
                label="Additional care"
                values={sections.requirements.additional_care}
              />
              <DetailRows title="Care details" rows={sections.careRows} />
              <DetailRows title="Schedule and budget" rows={sections.scheduleRows} />
              <DetailRows title="Location" rows={sections.locationRows} />
              {source.message_to_provider && (
                <DetailRows
                  title="Message to care provider"
                  rows={[source.message_to_provider]}
                />
              )}

              {/* Matched provider section */}
              {matchedBooking && provider && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Matched Provider
                  </h3>
                  <div className="rounded-lg bg-white border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveImage(
                          provider.profile_image_url,
                          provider.full_name,
                        )}
                        alt={provider.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 truncate">
                            {provider.full_name || "Provider"}
                          </p>
                          {provider.is_verified && (
                            <span className="text-[#0093d1]" title="Verified">
                              &bull;
                            </span>
                          )}
                        </div>
                        {matchedBooking.is_activity_in_progress && !matchedBooking.has_ended_activity ? (
                          <span className="inline-block mt-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                            Session Running
                          </span>
                        ) : matchedBooking.has_ended_activity ? (
                          <span className="inline-block mt-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                            Awaiting Payment
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        className="flex-1 rounded-md bg-[#0093d1] px-4 py-2 text-sm font-medium text-white hover:bg-[#007bb0] transition-colors disabled:opacity-60"
                        disabled={openingApplicationId === matchedBooking.id}
                        onClick={handleMessageMatchedProvider}
                      >
                        {openingApplicationId === matchedBooking.id
                          ? "Opening..."
                          : "Message"}
                      </button>
                      <button
                        className="flex-1 rounded-md bg-white text-[#0093d1] px-4 py-2 text-sm font-medium border border-[#0093d1] hover:bg-gray-50 transition-colors disabled:opacity-60"
                        disabled={!matchedBooking.has_ended_activity || initiatingPayment}
                        onClick={handlePayMatchedProvider}
                      >
                        {initiatingPayment ? "Processing..." : "Pay"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-normal text-gray-900 mb-3">
                    Skills and expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 border border-gray-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applicants - exclude matched booking */}
              {applications.filter(
                (app) => app.id !== (matchedBooking?.id ?? -1),
              ).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Providers who applied
                  </h3>
                  <div className="space-y-3">
                    {applications
                      .filter((app) => app.id !== (matchedBooking?.id ?? -1))
                      .map((application) => (
                        <div
                          key={application.id || application.providerName}
                          className="flex items-center gap-3 rounded-lg bg-white border border-gray-100 p-3"
                        >
                          <img
                            src={resolveImage(
                              application.providerImageUrl,
                              application.providerName,
                            )}
                            alt={application.providerName}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800 truncate">
                                {application.providerName}
                              </p>
                              {application.isVerified && (
                                <span className="text-[#0093d1]" title="Verified">
                                  &bull;
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              {application.createdAt || "Applied"}
                            </p>
                          </div>
                          <button
                            className="rounded-md bg-[#0093d1] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                            disabled={openingApplicationId === application.id}
                            onClick={() => handleMessageApplicant(application)}
                          >
                            {openingApplicationId === application.id
                              ? "Opening..."
                              : "Message"}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit / Read-only controls */}
          <div className="mt-6 max-w-3xl">
            {!editMode ? (
              /* Buttons side by side */
              <div className="flex gap-3">
                {!isMatched && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex-1 bg-white text-[#0093d1] py-3 rounded-md font-medium text-sm border border-[#0093d1] hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                )}
                {!isMatched && (
                  <button
                    onClick={async () => {
                      const id = source?.id || params.id;
                      if (!id) return alert("Missing id");
                      if (
                        !confirm(
                          "Are you sure you want to close/delete this pending request?",
                        )
                      )
                        return;
                      const res = await dispatch(deletePendingRequest(id));
                      if (res.error) {
                        alert(
                          "Delete failed: " +
                            (res.payload?.detail ||
                              JSON.stringify(res.payload) ||
                              res.error.message),
                        );
                      } else {
                        navigate("/careseekers/dashboard/requests");
                      }
                    }}
                    className="flex-1 bg-[#0093d1] text-white py-3 rounded-md font-medium text-sm hover:bg-[#007bb0] transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  className="w-full mt-2 p-3 border border-gray-200 rounded-md text-sm dark:bg-white dark:text-black"
                />

                <label className="block text-sm font-medium text-gray-700 mt-2">
                  Skills and expertise (comma separated)
                </label>
                <input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full mt-2 p-2 border border-gray-200 rounded-md text-sm dark:bg-white dark:text-black"
                />

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const id = source?.id || params.id;
                      if (!id) return alert("Missing id");
                      const skillsArr = skillsInput
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const res = await dispatch(
                        patchPendingRequest({ id, summary, skills: skillsArr }),
                      );
                      if (res.error) {
                        alert(
                          "Update failed: " +
                            (res.payload?.detail ||
                              JSON.stringify(res.payload) ||
                              res.error.message),
                        );
                      } else {
                        dispatch(fetchPendingRequestById(id));
                        setEditMode(false);
                      }
                    }}
                    className="flex-1 bg-white text-[#0093d1] py-3 rounded-md font-medium text-sm border border-[#0093d1] hover:bg-gray-50 transition-colors"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setSummary(
                        source?.summary || source?.description?.[0] || "",
                      );
                      const skillsArr =
                        source?.skills_and_expertise || source?.skills || [];
                      setSkillsInput(
                        Array.isArray(skillsArr)
                          ? skillsArr.join(", ")
                          : skillsArr || "",
                      );
                      setEditMode(false);
                    }}
                    className="flex-1 bg-[#f3f4f6] text-gray-700 py-3 rounded-md font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment success banner */}
          {paymentSuccess && (
            <div className="mt-6 max-w-3xl bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <svg
                width="48"
                height="48"
                fill="#16a34a"
                viewBox="0 0 24 24"
                className="mx-auto mb-3"
              >
                <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.415-1.415 3.87 3.87 9.87-9.87z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-500 mb-4 text-sm">
                Your payment has been processed successfully.
              </p>
              <button
                className="bg-[#0093d1] text-white px-6 py-2.5 rounded-md font-medium text-sm hover:bg-[#007bb0] transition-colors"
                onClick={() => {
                  setPaymentSuccess(false);
                  navigate("/careseekers/dashboard/requests");
                }}
              >
                Back to Requests
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-6 sm:p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentError(null);
                setInitiatingPayment(false);
                dispatch(resetPaymentState());
              }}
            >
              &times;
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center mb-2">
              Proceed to Payment
            </h2>
            <p className="text-center text-gray-500 mb-6 text-sm sm:text-base">
              You are about to make a payment for this care service.
            </p>

            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-xs sm:text-sm">
                {paymentError}
              </div>
            )}

            <button
              className="w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              onClick={handlePayMatchedProvider}
              disabled={initiatingPayment}
            >
              {initiatingPayment ? "Processing..." : "Pay with Paystack"}
            </button>
            <button
              className="w-full border border-[#0093d1] text-[#0093d1] py-3 rounded-md font-semibold bg-white hover:bg-[#f7fafd] transition disabled:opacity-50 text-sm sm:text-base"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentError(null);
                setInitiatingPayment(false);
                dispatch(resetPaymentState());
              }}
              disabled={initiatingPayment}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingDetails;
