import { format, parseISO, parse } from "date-fns";

export const getWeekRange = (date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return { start: startOfWeek, end: endOfWeek };
};

export const getDisplayValue = (value) =>
  value === true || value === "yes"
    ? "Yes"
    : value === false || value === "no"
    ? "No"
    : value || "N/A";

export const getMaxBirthDate = () => {
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  return maxDate.toISOString().split("T")[0];
};

// Function to validate date is not more than 3 months ago
export const validateIssueDate = (dateString) => {
  if (!dateString) return true; // Empty date is allowed if not required

  const issueDate = new Date(dateString);
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  return issueDate >= threeMonthsAgo;
};

// Function to get maximum allowed date (today)
export const getMaxDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Function to get minimum allowed date (3 months ago)
export const getMinDate = () => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return threeMonthsAgo.toISOString().split("T")[0];
};

// Disable past dates - prevents selecting dates before today
export const disablePastDates = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Disable future dates - prevents selecting dates after today
export const disableFutureDates = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper function to parse date string as local date
export const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00");
};

// Helper function to format date to YYYY-MM-DD
export const formatToYYYYMMDD = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const validateDateRange = (
  dateString,
  minDate = null,
  maxDate = null
) => {
  if (!dateString) return true; // Empty is allowed

  const inputDate = new Date(dateString);
  const today = new Date();

  if (maxDate && inputDate > new Date(maxDate)) {
    return false;
  }

  if (minDate && inputDate < new Date(minDate)) {
    return false;
  }

  return true;
};

// Utility function to validate that end date is not before start date
export const validateEndDateAfterStart = (startDate, endDate) => {
  if (!startDate || !endDate) return true; // Allow empty dates

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Handle invalid dates by considering them as not valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return end >= start;
};

// Safe field getter function
export const getField = (row, fieldName, fallback = "--") => {
  return row[fieldName] || fallback;
};

// Enhanced helper for last modified (add this near your existing getField)
export const getLastModified = (row) => {
  let date = getField(row, "lastModifiedDate", "--");
  let time = getField(row, "lastModifiedTime", "");

  // If updated_at exists, parse and override
  if (row.updated_at) {
    const updatedDate = parseISO(row.updated_at); // Handles ISO strings like "2025-10-04T14:30:00Z"
    date = format(updatedDate, "MMM dd, yyyy"); // e.g., "Oct 04, 2025"
    time = format(updatedDate, "hh:mm a"); // e.g., "2:30 PM" (adjust format as needed)
  }

  return { date, time };
};

// Helper to format date string for date input (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const parsedDate = parseISO(dateString);
    return format(parsedDate, "yyyy-MM-dd");
  } catch (error) {
    return "";
  }
};

// Helper function to format date for display - handles ISO strings and outputs in DD/MM/YYYY or ordinal format
export const formatDisplayDate = (dateString, formatType = "dd/MM/yyyy") => {
  if (!dateString) return "-";

  try {
    const parsedDate = parseISO(dateString); // Handles ISO strings like "2025-10-21T00:00:00Z"

    // If formatType is 'ordinal', use 'do MMMM, yyyy' for "21st October, 2025"
    // Otherwise, default to 'dd/MM/yyyy' for "21/10/2025"
    const outputFormat =
      formatType === "ordinal" ? "do MMMM, yyyy" : "dd/MM/yyyy";
    return format(parsedDate, outputFormat);
  } catch (error) {
    // Fallback if parsing fails (e.g., invalid date string)
    return dateString;
  }
};

// Helper function to extract file extension
export const getFileExtension = (fileUrl) => {
  if (typeof fileUrl !== "string" || !fileUrl) return "";
  // Remove query string (?...) and fragment (#...)
  const cleanUrl = fileUrl.split(/[?#]/)[0];
  // Extract the last part after the final dot
  const parts = cleanUrl.split(".").pop();
  return parts || "";
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const isImageFile = (file) => {
  // Case 1: Handle File objects with MIME types
  if (file && typeof file === "object" && file.type) {
    return file.type.startsWith("image/");
  }

  // Case 2: Handle file URLs (strings)
  if (typeof file === "string") {
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
    const extension = getFileExtension(file)?.toLowerCase();
    return imageExtensions.includes(extension);
  }

  // Return false if neither condition is met
  return false;
};

export const isPDFFile = (file) => {
  return file?.type === "application/pdf";
};

export const isWordFile = (file) => {
  const wordTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return wordTypes.includes(file?.type);
};

export function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str?.charAt(0).toUpperCase() + str?.slice(1);
}

export const normalizeText = (str) => {
  if (!str || typeof str !== "string") return "";

  // Check if the string looks like a phone number (contains digits, +, or -)
  if (/[0-9+]-?/.test(str)) {
    return str.replace(/[-]/g, ""); // Remove hyphens for phone numbers
  }

  // Original logic for text with underscores
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const generateRandomPassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const flattenErrorMessages = (errors, prefix = "") => {
  let messages = [];

  if (typeof errors === "string") {
    // Use the prefix as-is or format it for readability
    const readablePrefix = prefix
      .split(".")
      .map((part) => part.replace(/\[\d+\]/g, "")) // Remove array indices
      .join(" > ")
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
    return [readablePrefix ? `${readablePrefix}: ${errors}` : errors];
  }

  if (Array.isArray(errors)) {
    return errors
      .flatMap((item, index) =>
        flattenErrorMessages(item, prefix ? `${prefix}[${index}]` : `${index}`)
      )
      .filter(Boolean);
  }

  if (typeof errors === "object" && errors !== null) {
    return Object.keys(errors)
      .flatMap((key) =>
        flattenErrorMessages(errors[key], prefix ? `${prefix}.${key}` : key)
      )
      .filter(Boolean);
  }

  return messages;
};

// Function to convert date from MM-DD-YYYY or YYYY-MM-DD format to ISO string
export const convertToISO = (dateString) => {
  if (!dateString) return null;

  try {
    const parts = dateString.split("-");
    let parsedDate;

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // Assume YYYY-MM-DD format
        parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
      } else {
        // Assume MM-DD-YYYY format
        parsedDate = parse(dateString, "MM-dd-yyyy", new Date());
      }
    } else {
      // Fallback to ISO parse if it matches
      parsedDate = parseISO(dateString);
    }

    if (isNaN(parsedDate.getTime())) return null;
    return parsedDate.toISOString();
  } catch (error) {
    console.error("Date conversion error:", error);
    return null;
  }
};

export const truncateText = (text, maxLength = 20) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

// Error handling utility function
export const handleApiError = (error) => {
  // If it's not an axios error with response, throw the original error
  if (!error.response) {
    throw error;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      // For 400 errors, show user-friendly messages but limit length
      if (data?.detail) {
        if (data.detail.length > 100) {
          throw new Error("Some information are missing");
        }
        throw new Error(data.detail);
      } else if (data?.non_field_errors) {
        throw new Error(data.non_field_errors[0] || "Invalid data provided");
      } else {
        throw new Error("Some information are missing");
      }

    case 401:
      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tenantId");
      localStorage.removeItem("tenantSchema");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");

    case 403:
      throw new Error("You don't have permission to perform this action.");

    case 404:
      throw new Error("The requested resource was not found.");

    case 409:
      throw new Error("Conflict occurred. Please check your data.");

    case 422:
      // Validation errors - show first field error or generic message
      if (data && typeof data === "object") {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          throw new Error(firstError[0] || "Validation error occurred");
        } else if (typeof firstError === "string") {
          throw new Error(firstError);
        }
      }
      throw new Error("Validation error occurred");

    case 429:
      throw new Error("Too many requests. Please try again later.");

    case 500:
    case 502:
    case 503:
      throw new Error("Server error. Please try again later.");

    default:
      throw new Error(
        data?.detail || `An unexpected error occurred (${status})`
      );
  }
};

// Enhanced error handler that preserves custom error formatting for validation errors
export const handleApiErrorWithValidation = (error) => {
  // If it's not an axios error with response, throw the original error
  if (!error.response) {
    throw error;
  }

  const { status, data } = error.response;

  // For 400 and 422 errors, use custom formatting with flattenErrorMessages
  if (status === 400 || status === 422) {
    if (data) {
      if (typeof data === "string") {
        throw new Error(data);
      } else if (typeof data === "object") {
        const flattenedErrors = flattenErrorMessages(data);
        const errorMessage = flattenedErrors.join(", ");
        throw new Error(errorMessage);
      }
    }
  }

  // For other status codes, use the standard handler
  return handleApiError(error);
};
