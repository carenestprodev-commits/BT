import { FaBriefcase, FaCheckCircle, FaStar } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";

import { statusLabel } from "./applicationUtils";

const imageFor = (application) =>
  application?.providerImageUrl || application?.provider_image_url || "/avatar_user.png";

function ApplicationCard({ application, request, onViewDetails, onReject, onMessage, onRemove }) {
  const name = application?.providerName || application?.provider_name || "Care provider";
  const status = statusLabel(application?.status);
  const providerLocation = [
    application?.providerCity || application?.provider_city,
    application?.providerState || application?.provider_state,
    application?.providerCountry || application?.provider_country,
  ].filter(Boolean).join(", ");
  const location = request?.location || providerLocation || "Location not specified";
  const rate = application?.agreedRate || application?.agreed_rate;
  const years = Number(application?.providerYearsExperience ?? application?.provider_years_of_experience ?? 0);
  const rating = Number(application?.providerAverageRating ?? application?.provider_average_rating ?? 0);
  const summary = application?.providerProfileTitle || application?.provider_profile_title || application?.providerAbout || application?.provider_about || request?.summary || "Care provider application for your care request.";

  return (
    <article className="rounded-[14px] border border-[#e8edf0] bg-white p-4 shadow-[0_1px_2px_rgba(15,47,67,0.02)]">
      <div className="flex items-start gap-3">
        <img
          src={imageFor(application)}
          alt={name}
          className="h-14 w-14 shrink-0 rounded-[12px] object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1">
            <h3 className="truncate text-[18px] font-semibold tracking-normal text-[#0e2f43]">
              {name}
            </h3>
            {application?.isVerified && (
              <FaCheckCircle className="mt-1 shrink-0 text-[16px] text-[#0d99c9]" />
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-[14px] tracking-normal text-[#8b8f94]">
            <MdLocationOn className="shrink-0 text-[18px]" /> {location}
          </p>
        </div>
        <span className="shrink-0 text-[18px] font-bold tracking-normal text-[#0d99c9]">
          {rate ? `₦${rate}/hr` : "Rate on request"}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-[15px] leading-[1.35] tracking-normal text-[#8b8f94]">
        {summary}
      </p>

      <div className="mt-4 flex items-center gap-5 border-b border-[#edf0f2] pb-3 text-[#0e2f43]">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eefaff] text-[#0d99c9]">
            <FaBriefcase />
          </span>
          <span className="truncate text-[15px] font-semibold tracking-normal">
            {years > 0 ? `${years} years experience` : "Application received"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eefaff] text-[#0d99c9]">
            <FaStar />
          </span>
          <span className="text-[#0e2f43]">{rating > 0 ? rating.toFixed(1) : "—"}</span>
          <span className="flex text-[16px] leading-none text-[#f39a00]" aria-label={`${rating || 0} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < Math.round(rating) ? "" : "text-[#d9dde0]"}>★</span>)}
          </span>
        </div>
      </div>

      {status === "Rejected" ? (
        <button type="button" disabled className="mt-4 min-h-11 w-full rounded-[10px] border border-[#ffb6be] bg-[#fff0f1] px-3 text-[16px] tracking-normal text-[#ff3347]">
          Rejected
        </button>
      ) : status === "Accepted" ? (
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={onMessage || onViewDetails} className="min-h-11 flex-1 rounded-[10px] bg-[#0d99c9] px-3 text-[16px] tracking-normal text-white transition hover:bg-[#087fa8]">
            Message
          </button>
          <button type="button" onClick={onRemove} disabled={!onRemove} className="min-h-11 flex-1 rounded-[10px] bg-[#e7e7e7] px-3 text-[16px] tracking-normal text-[#0e2f43] transition hover:bg-[#dcdcdc] disabled:cursor-not-allowed disabled:opacity-60">
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onReject}
            className="min-h-11 flex-1 rounded-[10px] border border-[#ff3347] px-3 text-[16px] tracking-normal text-[#ff3347] transition hover:bg-[#fff3f4]"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={onViewDetails}
            className="min-h-11 flex-1 rounded-[10px] bg-[#0d99c9] px-3 text-[16px] tracking-normal text-white transition hover:bg-[#087fa8]"
          >
            View details
          </button>
        </div>
      )}
    </article>
  );
}

export default ApplicationCard;
