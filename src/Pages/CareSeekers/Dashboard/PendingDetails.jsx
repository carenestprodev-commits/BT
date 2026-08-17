import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft2,
  Calendar,
  Card,
  MessageText1,
  Verify,
} from "iconsax-react";
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
  formatCurrencyAmount,
  getUserCurrencyInfo,
} from "../../../utils/countryHelper";
import {
  clearPaymentState,
  clearActivityStarted,
  endActivity,
  fetchActivityPaymentPreview,
  initiateActivityPayment,
  startActivity,
} from "../../../Redux/StartActivity";
import ActivityCountdown from "../../../Components/ActivityCountdown";

const formatActivityDate = (value) => {
  if (!value) return "Date to be confirmed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatActivityTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const postedLabel = (value) => {
  if (!value) return "Posted recently";
  return /^posted\b/i.test(value) ? value : `Posted ${value}`;
};

function ActivitySchedule({ activities = [] }) {
  if (!activities.length) return null;

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#142f40]">
            Activity schedule
          </h3>
          <p className="mt-1 text-sm text-[#71808a]">
            {activities.length} {activities.length === 1 ? "session" : "sessions"}
          </p>
        </div>
        <Calendar size="22" color="#0d99c9" variant="Linear" />
      </div>

      <div className="mt-4 overflow-hidden rounded-[18px] bg-white ring-1 ring-[#dcecf1]">
        {activities.map((activity, index) => {
          const start = activity.scheduled_start_at || activity.scheduled_date;
          const actualStart = activity.actual_start_time;
          const actualEnd = activity.actual_end_time;
          return (
            <div
              key={activity.id || `${start}-${index}`}
              className="grid grid-cols-[26px_minmax(0,1fr)] gap-3 border-b border-[#edf2f4] px-3.5 py-3.5 last:border-b-0 sm:grid-cols-[30px_minmax(0,1fr)] sm:gap-4 sm:px-5 sm:py-4"
            >
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e6f6fb] text-xs font-semibold text-[#0d99c9]">
                  {index + 1}
                </span>
                {index < activities.length - 1 && (
                  <span className="mt-2 h-full min-h-5 w-px bg-[#cfe7ee]" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-medium text-[#18384b]">
                  {formatActivityDate(start)}
                </p>
                <p className="mt-1 text-sm text-[#5f7180]">
                  {formatActivityTime(start)} — {formatActivityTime(activity.scheduled_end_at)}
                  {activity.scheduled_hours != null && (
                    <span className="text-[#93a0a8]"> · {activity.scheduled_hours}h</span>
                  )}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#87949c]">
                  <span>
                    {actualStart && actualEnd
                      ? `Worked ${formatActivityTime(actualStart)} — ${formatActivityTime(actualEnd)}`
                      : "Not started"}
                  </span>
                  <span>Overtime {activity.overtime_hours || "0.00"}h</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}

function RequestContext({ source, posted, description, skills, sections }) {
  const detailRows = [
    ...sections.careRows,
    ...sections.scheduleRows,
    ...sections.locationRows,
    ...(source.message_to_provider
      ? [`Message to care provider: ${source.message_to_provider}`]
      : []),
  ].filter(Boolean);

  return (
    <section className="mt-8 rounded-[20px] bg-white p-4 ring-1 ring-[#e7eef1] sm:rounded-[24px] sm:p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0d99c9]">
          Your care request
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[#142f40]">What you need</h2>
        <div className="mt-4 space-y-3 text-[15px] leading-7 text-[#596b75]">
          {description.length ? (
            description.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          ) : (
            <p>No request summary was provided.</p>
          )}
        </div>
      </div>

      <div className="mt-7 grid gap-3 border-t border-[#edf2f4] pt-6 sm:grid-cols-3">
        <RequestFact label="Posted" value={postedLabel(posted)} />
        <RequestFact label="Location" value={source.location || "Not specified"} />
        <RequestFact
          label="Care type"
          value={source.service_category || "Care service"}
        />
      </div>

      {skills.length > 0 && (
        <div className="mt-7 border-t border-[#edf2f4] pt-6">
          <p className="text-sm font-semibold text-[#18384b]">Relevant skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-full bg-[#f1f7f9] px-3 py-1.5 text-sm text-[#536974]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {detailRows.length > 0 && (
        <details className="mt-7 border-t border-[#edf2f4] pt-5">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[#18384b]">
            View full request details
          </summary>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-[#687983]">
            {detailRows.map((row, index) => (
              <p key={`${row}-${index}`}>{row}</p>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

function RequestFact({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#9aa7ad]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#365363]">{value}</p>
    </div>
  );
}

function MatchedProviderPanel({
  matchedBooking,
  provider,
  scheduledEndAt,
  openingApplicationId,
  startingActivity,
  endingActivity,
  onMessage,
  onMakePayment,
  onStartActivity,
  onEndActivity,
}) {
  const isEnded = matchedBooking.has_ended_activity;
  const isActive = matchedBooking.is_activity_in_progress && !isEnded;
  const statusText = isActive
    ? "Activity is in progress."
    : isEnded
      ? "Activity ended. Ready for payment."
      : "Hired. Ready to begin activity.";

  return (
    <section className="overflow-hidden rounded-[24px] bg-[#f2fafc] p-4 ring-1 ring-[#ccecf4] sm:rounded-[28px] sm:p-5 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#d9f5e8] px-4 py-2 text-sm font-semibold text-[#078844]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#08b95c]" />
          Matched care provider
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3 sm:mt-7 sm:gap-4">
        <img
          src={resolveImage(provider.profile_image_url, provider.full_name, 96)}
          alt={provider.full_name || "Care provider"}
          className="h-16 w-16 shrink-0 rounded-[18px] object-cover ring-4 ring-white sm:h-20 sm:w-20 sm:rounded-[22px] md:h-24 md:w-24"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-xl font-semibold tracking-[-0.02em] text-[#122a3a] sm:text-2xl md:text-[28px]">
              {provider.full_name || "Care provider"}
            </h2>
            {provider.is_verified && (
              <Verify size="24" color="#0d99c9" variant="Bold" />
            )}
          </div>
          <p className="mt-1 text-sm text-[#61737d] sm:text-base">{statusText}</p>
        </div>
      </div>

      {!isEnded && scheduledEndAt && (
        <div className="mt-5">
          <ActivityCountdown endAt={scheduledEndAt} />
        </div>
      )}

      <ActivitySchedule activities={matchedBooking.scheduled_activities || []} />

      <div className={`mt-6 grid gap-2 sm:mt-8 sm:gap-3 ${isEnded ? "sm:grid-cols-2" : ""}`}>
        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border-2 border-[#0d99c9] bg-transparent px-4 text-sm font-semibold text-[#0d99c9] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:px-5 sm:text-base"
          disabled={openingApplicationId === matchedBooking.id}
          onClick={onMessage}
        >
          <MessageText1 size="22" color="currentColor" variant="Linear" />
          {openingApplicationId === matchedBooking.id ? "Opening..." : "Message"}
        </button>

        {isEnded ? (
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-[#06c755] px-4 text-sm font-semibold text-white transition hover:bg-[#05ae4b] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:px-5 sm:text-base"
            disabled={openingApplicationId === matchedBooking.id}
            onClick={onMakePayment}
          >
            <Card size="22" color="currentColor" variant="Linear" />
            Make payment
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-[#0d99c9] px-4 text-sm font-semibold text-white transition hover:bg-[#087fa8] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:px-5 sm:text-base"
            disabled={isActive ? endingActivity : startingActivity}
            onClick={isActive ? onEndActivity : onStartActivity}
          >
            {isActive
              ? endingActivity
                ? "Ending activity..."
                : "End activity"
              : startingActivity
                ? "Starting activity..."
                : "Start activity"}
          </button>
        )}
      </div>
    </section>
  );
}

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

  useEffect(() => {
    if (location?.state?.edit) setEditMode(true);
  }, [location?.state?.edit]);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [initiatingPayment, setInitiatingPayment] = useState(false);

  const {
    activityStarted,
    scheduledEndAt,
    startingActivity,
    endingActivity,
    loadingPaymentPreview,
    checkoutUrl,
    currencyCode,
    currencySymbol,
    localizedScheduledHours,
    localizedOvertimeHours,
    localizedExtraHours,
    localizedSubtotal,
    localizedServiceFee,
    localizedVerificationFee,
    localizedTotalAmount,
    countryUsed,
  } = useSelector((s) => s.startActivity || {});

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

  useEffect(() => {
    if (!checkoutUrl || !showPaymentModal) return;
    window.location.href = checkoutUrl;
    dispatch(clearPaymentState());
  }, [checkoutUrl, showPaymentModal, dispatch]);

  useEffect(() => {
    if (!activityStarted) return;
    const id = params.id || params.requestId || null;
    if (id) dispatch(fetchPendingRequestById(id));
    dispatch(clearActivityStarted());
  }, [activityStarted, dispatch, params.id, params.requestId]);

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

  const matchedBooking = source?.matched_booking || null;
  const isMatched = !!matchedBooking;

  const rawDescription = source?.description ?? source?.summary ?? "";
  const description = Array.isArray(rawDescription)
    ? rawDescription.filter(Boolean)
    : rawDescription
      ? [rawDescription]
      : [];
  const rawSkills = source?.skills_and_expertise ?? source?.skills ?? [];
  const skills = Array.isArray(rawSkills)
    ? rawSkills.filter(Boolean)
    : String(rawSkills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
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

  const openPaymentReview = async () => {
    if (!matchedBooking) return;
    setShowPaymentModal(true);
    setPaymentSuccess(false);
    setPaymentError(null);
    const result = await dispatch(
      fetchActivityPaymentPreview({ bookingId: matchedBooking.id }),
    );
    if (fetchActivityPaymentPreview.rejected.match(result)) {
      setPaymentError(
        result.payload || "Payment review could not be loaded. Please try again.",
      );
    }
  };

  const handlePayMatchedProvider = async () => {
    if (!matchedBooking) return;
    setInitiatingPayment(true);

    try {
      const result = await dispatch(
        initiateActivityPayment({
          bookingId: matchedBooking.id,
          paymentGateway: countryUsed?.toUpperCase() === "NG" ? "paystack" : "stripe",
        }),
      );

      if (initiateActivityPayment.rejected.match(result)) {
        setPaymentError(
          result.payload || "Payment initiation failed. Please try again.",
        );
      }
    } catch {
      setPaymentError("Payment initiation failed. Please try again.");
    }
    setInitiatingPayment(false);
  };

  const startMatchedActivity = async () => {
    if (!matchedBooking) return;
    const result = await dispatch(startActivity(String(matchedBooking.id)));
    if (startActivity.rejected.match(result)) {
      alert(result.payload || "The activity could not be started.");
    }
  };

  const endMatchedActivity = async () => {
    if (!matchedBooking) return;
    const code = window.prompt("Enter the 6-digit code from the care provider.");
    if (!/^\d{6}$/.test((code || "").trim())) {
      alert("Enter the 6-digit provider code.");
      return;
    }
    const result = await dispatch(
      endActivity({
        bookingId: matchedBooking.id,
        endCode: code.trim(),
      }),
    );
    if (endActivity.rejected.match(result)) {
      alert(result.payload || "The activity could not be ended.");
      return;
    }
    const id = params.id || params.requestId || null;
    if (id) dispatch(fetchPendingRequestById(id));
    await openPaymentReview();
  };

  const provider = matchedBooking?.provider || null;
  const userCurrency = getUserCurrencyInfo();
  const displayAmount = (value) =>
    value == null
      ? "—"
      : formatCurrencyAmount(
          Number(value),
          currencyCode || userCurrency.currencyCode,
          currencySymbol || userCurrency.currencySymbol,
        );

  return (
    <div className="flex min-h-screen bg-[#f9fcfd] font-sfpro">
      <Sidebar active="Requests" />

      <div className="flex-1 md:ml-64">
        <div className="sticky top-[57px] md:top-0 z-30 flex items-center gap-3 border-b border-[#edf2f4] bg-white px-5 py-4 md:px-8">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full bg-[#f3f6f7] text-[#17394c] transition hover:bg-[#e8f1f4]"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft2 size="22" color="currentColor" variant="Linear" />
          </button>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-[#122f42]">
            Job Detail
          </h1>
        </div>

        <div className="min-h-[calc(100vh-73px)] overflow-y-auto px-4 py-5 sm:px-5 sm:py-7 md:px-10 md:py-10">
          {!source && <p className="text-sm text-[#71808a]">Loading details&hellip;</p>}

          {source && isMatched && provider && (
            <div className="mx-auto max-w-[1120px]">
              <header className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4 md:mb-10">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e7e9ed] text-lg font-semibold text-[#5f6872] sm:h-16 sm:w-16 sm:text-xl">
                  CN
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-medium tracking-[-0.03em] text-[#15202a] sm:text-3xl md:text-[42px]">
                    {title || "Care request"}
                  </h2>
                  <p className="mt-1 text-base text-[#8d969c]">
                    {postedLabel(posted)}
                  </p>
                </div>
              </header>

              <MatchedProviderPanel
                matchedBooking={matchedBooking}
                provider={provider}
                scheduledEndAt={scheduledEndAt}
                openingApplicationId={openingApplicationId}
                startingActivity={startingActivity}
                endingActivity={endingActivity}
                onMessage={handleMessageMatchedProvider}
                onMakePayment={openPaymentReview}
                onStartActivity={startMatchedActivity}
                onEndActivity={endMatchedActivity}
              />

              <RequestContext
                source={source}
                posted={posted}
                description={description}
                skills={skills}
                sections={sections}
              />
            </div>
          )}

          {source && !isMatched && (
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
                    <ActivityCountdown endAt={scheduledEndAt} />
                    {!matchedBooking.has_ended_activity && (
                      <div className="mt-4 flex gap-3">
                        {matchedBooking.is_activity_in_progress ? (
                          <button
                            className="flex-1 rounded-md bg-[#0093d1] px-4 py-2 text-sm font-medium text-white hover:bg-[#007bb0] disabled:opacity-60"
                            disabled={endingActivity}
                            onClick={endMatchedActivity}
                          >
                            {endingActivity ? "Ending..." : "End activity"}
                          </button>
                        ) : (
                          <button
                            className="flex-1 rounded-md bg-[#0093d1] px-4 py-2 text-sm font-medium text-white hover:bg-[#007bb0] disabled:opacity-60"
                            disabled={startingActivity}
                            onClick={startMatchedActivity}
                          >
                            {startingActivity ? "Starting..." : "Start activity"}
                          </button>
                        )}
                      </div>
                    )}
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
                        onClick={openPaymentReview}
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
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80"
                            onClick={() =>
                              navigate(`/careseekers/dashboard/details/${application.providerUserId}`, {
                                state: { messageable: true },
                              })
                            }
                          >
                            <img
                              src={resolveImage(application.providerImageUrl, application.providerName)}
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
                          </button>
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
          {!isMatched && <div className="mt-6 max-w-3xl">
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
          </div>}

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
                dispatch(clearPaymentState());
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

            {loadingPaymentPreview ? (
              <p className="mb-5 text-center text-sm text-gray-500">
                Calculating the final payment...
              </p>
            ) : (
              <div className="mb-5 space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Activity hours</span>
                  <span>{localizedScheduledHours ?? 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime hours</span>
                  <span>{localizedOvertimeHours ?? 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Extra activity hours</span>
                  <span>{localizedExtraHours ?? 0}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Work subtotal</span>
                  <span>{displayAmount(localizedSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform fee</span>
                  <span>{displayAmount(localizedServiceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification balance</span>
                  <span>{displayAmount(localizedVerificationFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-800">
                  <span>Total</span>
                  <span>{displayAmount(localizedTotalAmount)}</span>
                </div>
              </div>
            )}

            <button
              className="w-full bg-[#0093d1] text-white py-3 rounded-md font-semibold hover:bg-[#007bb0] transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              onClick={handlePayMatchedProvider}
              disabled={initiatingPayment || loadingPaymentPreview}
            >
              {initiatingPayment ? "Processing..." : "Pay with Paystack"}
            </button>
            <button
              className="w-full border border-[#0093d1] text-[#0093d1] py-3 rounded-md font-semibold bg-white hover:bg-[#f7fafd] transition disabled:opacity-50 text-sm sm:text-base"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentError(null);
                setInitiatingPayment(false);
                dispatch(clearPaymentState());
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
