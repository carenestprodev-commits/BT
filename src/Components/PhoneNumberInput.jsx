import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./PhoneNumberInput.css";

const toInternational = (value = "") => {
  const phone = value.trim();
  if (!phone || phone.startsWith("+")) return phone || undefined;
  if (/^0[789][01]\d{8}$/.test(phone)) return `+234${phone.slice(1)}`;
  return undefined;
};

export default function PhoneNumberInput({ value, onChange, className = "" }) {
  return (
    <PhoneInput
      international
      countryCallingCodeEditable={false}
      value={toInternational(value)}
      onChange={(phone) => onChange(phone || "")}
      className={`care-phone-input ${className}`}
      numberInputProps={{ "aria-label": "Phone number" }}
    />
  );
}
