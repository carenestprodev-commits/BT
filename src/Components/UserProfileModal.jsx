import { BASE_URL } from "../Redux/config";

const imageUrl = (url) =>
  !url ? "" : url.startsWith("/") ? `${BASE_URL}${url}` : url;

export default function UserProfileModal({ user, onClose }) {
  if (!user) return null;
  const name = user.full_name || user.seekerName || user.name || "Care seeker";
  const image = user.profile_image_url || user.image_url || user.imageUrl;
  const location = [user.city, user.state, user.country].filter(Boolean).join(", ");

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} profile`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="float-right text-2xl text-gray-400 hover:text-gray-700"
          aria-label="Close profile"
        >
          ×
        </button>
        <div className="flex items-center gap-4">
          {image ? (
            <img src={imageUrl(image)} alt={name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-2xl font-semibold text-[#0093d1]">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-gray-900">{name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {user.user_type === "provider" ? "Care provider" : "Care seeker"}
            </p>
            {user.is_verified && <p className="mt-1 text-sm font-medium text-[#0093d1]">Verified profile</p>}
          </div>
        </div>
        {location && <p className="mt-5 text-sm text-gray-600">{location}</p>}
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {user.summary || user.about_me || "Profile information is available through this job or conversation."}
        </p>
      </div>
    </div>
  );
}
