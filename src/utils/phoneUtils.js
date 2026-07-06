const PHONE_REGEX =
  /\+\d{1,3}[-.\s]?\d{4,14}\b|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10,}\b/;
const EMAIL_REGEX = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

export const containsPhoneNumber = (text = "") => PHONE_REGEX.test(text) || EMAIL_REGEX.test(text);
