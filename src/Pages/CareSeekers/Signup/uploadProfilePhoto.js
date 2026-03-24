import { BASE_URL } from "../../../Redux/config";

export const ALLOWED_PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png"];

export const isValidProfilePhoto = (file) =>
  !!file && ALLOWED_PROFILE_PHOTO_TYPES.includes(file.type);

export const uploadProfilePhoto = async (file) => {
  const access =
    localStorage.getItem("access") || localStorage.getItem("accessToken");

  if (!access) {
    throw new Error("Not authorized");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE_URL}/api/auth/profile/upload_image/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${access}`,
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.detail || "Photo upload failed");
  }

  return data;
};
