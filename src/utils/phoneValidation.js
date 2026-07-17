import { isValidPhoneNumber as isValidInternationalPhone } from "react-phone-number-input";

export const isValidPhoneNumber = (value = "") => {
  const phone = value.trim();
  if (/^0[789][01]\d{8}$/.test(phone)) return true;
  return phone.startsWith("+") && isValidInternationalPhone(phone);
};
