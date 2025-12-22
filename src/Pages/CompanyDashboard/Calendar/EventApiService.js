import { apiClient } from "../../../config";
import {handleApiError,handleApiErrorWithValidation,} from "../../../utils/helpers";

// Create Event
export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post("/api/events/events/", eventData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Get All Events (visible to user)
export const getEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.visibility) queryParams.append("visibility", params.visibility);
    if (params.creator) queryParams.append("creator", params.creator);

    const url = `/api/events/events/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get Event Details
export const getEventDetails = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/events/events/${eventId}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update Event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.put(`/api/events/events/${eventId}/`, eventData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Partial Update Event
export const partialUpdateEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.patch(`/api/events/events/${eventId}/`, eventData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Delete Event
export const deleteEvent = async (eventId) => {
  try {
    const response = await apiClient.delete(`/api/events/events/${eventId}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get My Events (created by user)
export const getMyEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    const url = `/api/events/events/my_events/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get Events I'm Invited To
export const getMyInvitations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    const url = `/api/events/events/my_invitations/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get Public Events
export const getPublicEvents = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);

    const url = `/api/events/events/public_events/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get Calendar Data
export const getCalendarData = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.user_id) queryParams.append("user_id", params.user_id);

    const url = `/api/events/calendar/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get Dashboard Data
export const getEventDashboard = async () => {
  try {
    const response = await apiClient.get("/api/events/dashboard/");
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Search Users for Participants
export const searchUsers = async (query = "") => {
  try {
    const params = query ? `?search=${encodeURIComponent(query)}` : "";
    const response = await apiClient.get(`/api/user/users/${params}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};