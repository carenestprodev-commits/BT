export const getCurrentUserIdFromProfile = (profile) => {
  const directId = profile?.id ?? profile?.user_id ?? null;
  if (directId !== null && directId !== undefined) {
    return directId;
  }

  try {
    const keys = ["user", "seeker_user", "provider_user"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const id = parsed?.id ?? parsed?.user_id ?? null;
      if (id !== null && id !== undefined) {
        return id;
      }
    }
    return null;
  } catch {
    return null;
  }
};
