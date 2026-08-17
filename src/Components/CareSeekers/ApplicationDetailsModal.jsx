import { useEffect } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

import { clearProviderDetails, fetchProviderDetails } from "../../Redux/ProvidersDetails";
import { rejectApplication } from "./applicationApi";

const providerImage = (entry, details) =>
  details?.user?.profile_image_url || details?.profile_image_url || entry?.application?.providerImageUrl || "/avatar_user.png";

function ApplicationDetailsModal({ entry, onClose, onReject, onAccept }) {
  const dispatch = useDispatch();
  const { details, loading } = useSelector((state) => state.providersDetails || {});

  useEffect(() => {
    const providerId = entry?.application?.providerUserId;
    if (providerId) dispatch(fetchProviderDetails(providerId));
    return () => dispatch(clearProviderDetails());
  }, [dispatch, entry]);

  if (!entry) return null;

  const application = entry.application;
  const request = entry.request;
  const name = details?.user?.full_name || application.providerName || "Care provider";
  const location = [details?.city, details?.state, details?.country].filter(Boolean).join(", ") || request.location || "Location unavailable";
  const rate = details?.localized_hourly_rate || details?.hourly_rate || application.agreedRate;
  const years = details?.years_of_experience;
  const rating = details?.average_rating;
  const about = details?.summary || details?.about_me || request.summary || "Dedicated care provider ready to support your care request.";
  const verified = application.isVerified || details?.is_verified;

  const reject = async () => {
    if (application?.id) {
      await rejectApplication(application.id);
    }
    onReject?.();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-[24px] bg-white px-5 pb-6 pt-5 sm:px-7">
        <div className="mt-5 flex items-center gap-3">
          <button type="button" onClick={onClose} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f4f7f8] text-2xl text-[#0e2f43]" aria-label="Close details">
            ←
          </button>
          <h2 className="text-[22px] font-bold tracking-normal text-[#0e2f43]">Application details</h2>
        </div>

        <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-[#e8edf0] p-3">
          <img src={providerImage(entry, details)} alt={name} className="h-20 w-20 rounded-[14px] object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="truncate text-[18px] font-semibold tracking-normal text-[#0e2f43]">{name}</h3>
              {verified && <FaCheckCircle className="shrink-0 text-[#0d99c9]" />}
            </div>
            <p className="mt-1 flex items-center gap-1 text-[#8b8f94]"><MdLocationOn /> {location}</p>
            <p className="mt-1 flex items-center gap-1 text-[#0e2f43]"><FaStar className="text-[#f4773c]" /> {rating ? Number(rating).toFixed(1) : "—"}</p>
          </div>
          <span className="self-start rounded-md bg-[#e4f8e7] px-2 py-1 text-xs font-semibold text-[#00a51e]">Available</span>
        </div>

        {loading ? <p className="py-8 text-center text-sm text-[#8b8f94]">Loading provider details…</p> : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e8edf0] pt-5">
              <Detail label="Experience" value={years ? `${years} years experience` : "Not listed"} icon="▣" />
              <Detail label="Rate" value={rate ? `₦${rate}/hr` : "Not listed"} icon="$" />
              <Detail label="Address" value={location} icon="⌖" wide />
            </div>
            <div className="mt-5 rounded-xl border border-[#e8edf0] bg-[#fafafa] p-3">
              <p className="text-sm text-[#8b8f94]">About</p>
              <p className="mt-2 text-[16px] leading-[1.45] tracking-normal text-[#0e2f43]">{about}</p>
            </div>
            <h3 className="mt-6 text-[16px] font-semibold tracking-normal text-[#0e2f43]">Testimonials &amp; Ratings</h3>
            {(details?.testimonials || []).slice(0, 2).map((testimonial) => (
              <div key={testimonial.id || testimonial.comment} className="mt-3 bg-[#fafafa] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#0e2f43]">{testimonial.reviewer?.full_name || "Recent review"}</span>
                  <span className="text-[#f4773c]">★★★★★</span>
                </div>
                <p className="mt-2 text-sm leading-[1.4] text-[#8b8f94]">{testimonial.comment}</p>
              </div>
            ))}
          </>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reject} className="min-h-12 flex-1 rounded-[10px] border-2 border-[#ff3347] text-[17px] font-semibold tracking-normal text-[#ff3347]">Reject</button>
          <button type="button" onClick={onAccept} className="min-h-12 flex-1 rounded-[10px] bg-[#0d99c9] text-[17px] font-semibold tracking-normal text-white">Accept</button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, icon, wide = false }) {
  return (
    <div className={wide ? "col-span-2 flex items-start gap-3" : "flex items-start gap-3"}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#eaf7fc] text-[20px] text-[#0d99c9]">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm text-[#8b8f94]">{label}</p>
        <p className="mt-1 truncate text-[15px] font-semibold tracking-normal text-[#0e2f43]">{value}</p>
      </div>
    </div>
  );
}

export default ApplicationDetailsModal;
