export const syncAuthProfileImage = ({
  setUser,
  baseUser,
  profileImageUrl,
}) => {
  const nextUser = {
    ...(baseUser || {}),
    profile_image_url:
      profileImageUrl || baseUser?.profile_image_url || null,
  };

  if (setUser) {
    setUser(nextUser);
  }

  try {
    localStorage.setItem("user", JSON.stringify(nextUser));
    if (nextUser.user_type === "seeker") {
      localStorage.setItem("seeker_user", JSON.stringify(nextUser));
    }
    if (nextUser.user_type === "provider") {
      localStorage.setItem("provider_user", JSON.stringify(nextUser));
    }
  } catch {
    // ignore
  }

  return nextUser;
};
