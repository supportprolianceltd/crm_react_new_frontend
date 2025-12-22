import axios from "axios";
import { apiClient } from "../../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../../utils/helpers";

// INTERNAL REQUESTS
export const createInternalRequest = async (requestData) => {
  try {
    const response = await apiClient.post(
      "/api/talent-engine/requests/",
      requestData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const fetchAllInternalRequests = async () => {
  try {
    let allResults = [];
    let nextUrl = "/api/talent-engine/requests/";
    while (nextUrl) {
      const response = await apiClient.get(nextUrl);
      const data = response.data;
      allResults = [...allResults, ...data.results];
      nextUrl = data.next;
    }
    return allResults;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const fetchAllInternalRequestsByUser = async () => {
  try {
    let allResults = [];
    let nextUrl = "/api/talent-engine/requests/user";
    while (nextUrl) {
      const response = await apiClient.get(nextUrl);
      const data = response.data;
      allResults = [...allResults, ...data.results];
      nextUrl = data.next;
    }
    return allResults;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const fetchSingleInternalRequestById = async (requestId) => {
  try {
    const response = await apiClient.get(
      `/api/talent-engine/requests/${requestId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateInternalRequest = async (requestId, requestData) => {
  try {
    const response = await apiClient.patch(
      `/api/talent-engine/requests/${requestId}`,
      requestData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const deleteInternalRequest = async (requestId) => {
  try {
    const response = await apiClient.delete(
      `/api/talent-engine/requests/${requestId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// EXTERNAL REQUESTS

export const createExternalRequest = async (requestData) => {
  try {
    const response = await apiClient.post(
      `api/rostering/requests`,
      requestData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const updateExternalRequest = async (requestId, requestData) => {
  try {
    const response = await apiClient.patch(
      `api/rostering/requests/${requestId}`,
      requestData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const fetchAllExternalRequests = async () => {
  try {
    const response = await apiClient.get(`api/rostering/requests`);
    return response.data;
    // let allResults = [];
    // let nextUrl = "/api/rostering/requests";
    // while (nextUrl) {
    //   const response = await apiClient.get(nextUrl);
    //   const data = response.data;
    //   allResults = [...allResults, ...data.results];
    //   nextUrl = data.next;
    // }
    // return allResults;
  } catch (error) {
    handleApiError(error);
    return [];
  }
};

export const approveExternalRequest = async (requestId) => {
  try {
    const response = await apiClient.post(
      `/api/rostering/requests/${requestId}/approve`
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const declineExternalRequest = async (requestId) => {
  try {
    const response = await apiClient.post(
      `/api/rostering/requests/${requestId}/decline`
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const checkForEligibleCarers = async (requestId) => {
  try {
    const response = await apiClient.get(
      `api/rostering/requests/${requestId}/feasibility?includeScheduleCheck=true`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// export const fetchEmployees = async (pageUrl = null) => {
//   try {
//     const response = await apiClient.get(pageUrl || "/api/user/users");
//     return {
//       results: response.data.results,
//       count: response.data.count,
//       next: response.data.next,
//       previous: response.data.previous,
//     };
//   } catch (error) {
//     handleApiError(error);
//   }
// };

// export const createEmployee = async (employeeData) => {
//   try {
//     const response = await apiClient.post("/api/user/users/", employeeData);
//     return response.data;
//   } catch (error) {
//     console.log("Create employee error:", error.response?.data);
//     handleApiErrorWithValidation(error);
//   }
// };
