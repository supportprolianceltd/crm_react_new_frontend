import { apiClient } from "../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../utils/helpers";

// Fetch tasks for the current user
export const fetchTasks = async (date = null, pageUrl = null) => {
  try {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }

    const queryString = params.toString();
    const url = pageUrl || `/api/tasks/tasks/${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return {
      results: response.data.results || response.data,
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
    };
  } catch (error) {
    handleApiError(error);
  }
};

// Clock in to a task
export const clockInTask = async (taskId, clockData = {}) => {
  try {
    const response = await apiClient.post(`/api/tasks/tasks/${taskId}/clock-in/`, {
      ...clockData,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Clock out from a task
export const clockOutTask = async (taskId, clockData = {}) => {
  try {
    const response = await apiClient.post(`/api/tasks/tasks/${taskId}/clock-out/`, {
      ...clockData,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Get task history
export const getTaskHistory = async (taskId) => {
  try {
    const response = await apiClient.get(`/api/tasks/tasks/${taskId}/history/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Update task status
export const updateTaskStatus = async (taskId, statusData) => {
  try {
    const response = await apiClient.patch(`/api/tasks/tasks/${taskId}/`, statusData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Get tasks for a specific date range
export const fetchTasksByDateRange = async (startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);

    const response = await apiClient.get(`/api/tasks/tasks/?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get user's task statistics
export const getTaskStatistics = async (date = null) => {
  try {
    const params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }

    const queryString = params.toString();
    const url = `/api/tasks/statistics/${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Visit-related API functions

// Get carer visits for a specific user
export const fetchCarerVisits = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.date) {
      params.append('date', filters.date);
    }
    if (filters.day) {
      params.append('day', filters.day);
    }
    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const queryString = params.toString();
    const url = `/api/rostering/tasks/carer/${userId}/visits${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Get carer visits by date
export const fetchCarerVisitsByDate = async (userId, date) => {
  return fetchCarerVisits(userId, { date });
};

// Get carer visits by weekday
export const fetchCarerVisitsByWeekday = async (userId, day) => {
  return fetchCarerVisits(userId, { day });
};

// Get carer visits within a date range
export const fetchCarerVisitsByDateRange = async (userId, startDate, endDate) => {
  return fetchCarerVisits(userId, { startDate, endDate });
};

// Get single visit details
export const fetchSingleVisit = async (visitId) => {
  try {
    const response = await apiClient.get(`/api/rostering/tasks/visits/${visitId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Clock in to a visit
export const clockInVisit = async (visitId, clockData = {}) => {
  try {
    const response = await apiClient.post(`/api/rostering/tasks/visits/${visitId}/clockin`, {
      ...clockData,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

// Clock out from a visit
export const clockOutVisit = async (visitId, clockData = {}) => {
  try {
    const response = await apiClient.post(`/api/rostering/tasks/visits/${visitId}/clockout`, {
      ...clockData,
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};