import { isValidPhoneNumber as isValidInternationalPhone } from "react-phone-number-input";

export const isValidPhoneNumber = (value = "") => {
  const phone = value.trim();
  if (/^0[789][01]\d{8}$/.test(phone)) return true;
  if (phone.startsWith("+234")) return /^\+234[789][01]\d{8}$/.test(phone);
  return phone.startsWith("+") && isValidInternationalPhone(phone);
};
