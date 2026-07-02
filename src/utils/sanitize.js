/**
 * Strips HTML tags and trims whitespace from a string.
 * Prevents XSS when values are rendered in the DOM.
 */
export const sanitizeInput = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/<[^>]*>/g, "")       // strip HTML tags
    .replace(/[<>"'`]/g, "")       // strip dangerous characters
    .trim();
};

/**
 * Masks all but the last 4 digits of an account/card number.
 * e.g. "1234567890" => "******7890"
 */
export const maskAccountNumber = (value) => {
  if (!value) return "";
  const str = String(value);
  if (str.length <= 4) return str;
  return "*".repeat(str.length - 4) + str.slice(-4);
};

/**
 * Validates file size (max 5 MB) and allowed types.
 * Returns an error string or empty string if valid.
 */
export const validateFile = (file) => {
  if (!file) return "Document upload is required";
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
  if (file.size > MAX_SIZE) return "File size must be under 5 MB";
  if (!ALLOWED_TYPES.includes(file.type))
    return "Only PDF, JPG and PNG files are allowed";
  return "";
};

/**
 * Sanitizes every string value in a form-data object.
 */
export const sanitizeFormData = (formData) => {
  const sanitized = {};
  Object.entries(formData).forEach(([key, value]) => {
    sanitized[key] = typeof value === "string" ? sanitizeInput(value) : value;
  });
  return sanitized;
};
