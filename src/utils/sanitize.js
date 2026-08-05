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
 * Masks a card number while preserving the last 4 digits.
 * Example: 4111111111111111 -> **** **** **** 1111
 */
export const maskCardNumber = (value) => {
  if (!value) return "";
  const str = String(value).replace(/\D/g, "");
  if (!str) return "";
  if (str.length <= 4) return str;
  const last4 = str.slice(-4);
  return `**** **** **** ${last4}`;
};

const normalizeTxnDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    const yyyyMmDd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyyMmDd) return `${yyyyMmDd[1]}-${yyyyMmDd[2]}-${yyyyMmDd[3]}`;

    const ddMmYyyy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddMmYyyy) return `${ddMmYyyy[3]}-${ddMmYyyy[2]}-${ddMmYyyy[1]}`;

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return String(value).trim();
};

/**
 * Validates a database card reference string using RRN, txn date, and amount.
 * The reference should be stored in a deterministic format such as:
 * rrn-<rrn>|<yyyy-mm-dd>|<amount>
 */
export const validateCardReference = (reference, rrn, dateTxn, amount) => {
  if (!reference || !rrn || !dateTxn || amount == null) return false;

  const normalizedDate = normalizeTxnDate(dateTxn);
  const normalizedAmount = Number(amount).toFixed(2);
  const expected = `rrn-${String(rrn)}|${normalizedDate}|${normalizedAmount}`;
  return String(reference).trim() === expected;
};

/**
 * Validates file size (max 5 MB), allowed types, and max 3 pages (for PDFs).
 * Pass { optional: true } to skip validation when no file is selected.
 * Returns an error string or empty string if valid.
 */
export const validateFile = (file, { optional = false } = {}) => {
  if (!file) return optional ? "" : "Document upload is required";
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
