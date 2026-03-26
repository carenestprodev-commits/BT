export const getCurrentUserIdFromProfile = (profile) => {
  const directId =
    profile?.profile?.user_id ??
    profile?.profile?.id ??
    profile?.user_id ??
    profile?.id ??
    profile?.user?.user_id ??
    profile?.user?.id ??
    null;
  if (directId !== null && directId !== undefined) return directId;

  try {
    const keys = ["user", "seeker_user", "provider_user"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const id =
        parsed?.profile?.user_id ??
        parsed?.profile?.id ??
        parsed?.user_id ??
        parsed?.id ??
        parsed?.user?.user_id ??
        parsed?.user?.id ??
        null;
      if (id !== null && id !== undefined) return id;
    }
    return null;
  } catch {
    return null;
  }
};
