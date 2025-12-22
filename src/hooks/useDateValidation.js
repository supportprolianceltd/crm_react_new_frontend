import { useState } from "react";

export const useDateValidation = (initialValue = "") => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  const validateDate = (dateString, minDate = null, maxDate = null) => {
    if (!dateString) {
      setError("");
      return true;
    }

    const inputDate = new Date(dateString);
    const today = new Date();

    if (maxDate && inputDate > new Date(maxDate)) {
      setError(`Date cannot be in the future`);
      return false;
    }

    if (minDate && inputDate < new Date(minDate)) {
      setError(`Date cannot be before ${formatDisplayDate(minDate)}`);
      return false;
    }

    setError("");
    return true;
  };

  return { value, setValue, error, validateDate };
};
