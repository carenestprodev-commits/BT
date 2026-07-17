export const isValidPhoneNumber = (value = "") =>
  /^(?:0?[789][01]\d{8}|\+234[789][01]\d{8}|\+(?!234)[1-9]\d{7,14})$/.test(
    value.trim(),
  );
