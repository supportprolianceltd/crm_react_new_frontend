// utils/interviewUtils.js
import dayjs from "dayjs";

export const getValidDate = (dateString) => {
  const date = dayjs(dateString);
  return date.isValid() ? date : null;
};

export const calculateInterviewStatus = (interview) => {
  const now = new Date();
  const startTime = new Date(interview?.interview_start_date_time);
  const endTime = new Date(interview?.interview_end_date_time);

  if (now < startTime) return "not_started";
  if (now >= startTime && now <= endTime) return "join";
  return "ended";
};

export const formatRemainingTime = (startTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const diffMs = start - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHrs = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
  if (diffHrs > 0) return `in ${diffHrs} hour${diffHrs > 1 ? "s" : ""}`;
  return "soon";
};

export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60));
};

export const extractRoomId = (url) => {
  if (!url) return Math.random().toString(36).substring(2, 11);
  const parts = url.split("/");
  return parts[parts.length - 1] || Math.random().toString(36).substring(2, 11);
};

export const statusMessages = {
  not_started: (time) => `Your meeting has not started yet. It is in ${time}.`,
  join: "Join Meeting",
  started: "The meeting has started.",
  ended: "This meeting has ended.",
};
