export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFileSize(file) {
  if (!file) return null;
  if (file.size > MAX_FILE_SIZE) {
    return "File must be 10MB or smaller.";
  }
  return null;
}
