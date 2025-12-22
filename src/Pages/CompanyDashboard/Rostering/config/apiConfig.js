import { apiClient } from "../../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../../utils/helpers";

export const fetchClients = async (
  pageUrl = null,
  filters = {},
  sort = null
) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) {
      params.append("status", filters.status);
    }
    if (filters.compliance) {
      params.append("compliance", filters.compliance);
    }
    if (sort) {
      params.append("ordering", sort);
    }

    const url = pageUrl || `/api/user/clients?${params.toString()}`;
    const response = await apiClient.get(url);
    return {
      results: response.data.results,
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
    };
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchSingleClient = async (clientId) => {
  try {
    const response = await apiClient.get(`/api/user/clients/${clientId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const formData = new FormData();

    // Helper function to append nested objects (unchanged)
    const appendNestedObject = (obj, prefix = "") => {
      Object.keys(obj).forEach((key) => {
        if (obj[key] !== null && obj[key] !== undefined) {
          const formKey = prefix ? `${prefix}[${key}]` : key;

          if (obj[key] instanceof File) {
            formData.append(formKey, obj[key]);
          } else if (Array.isArray(obj[key])) {
            obj[key].forEach((item, index) => {
              if (typeof item === "object" && !(item instanceof File)) {
                appendNestedObject(item, `${formKey}[${index}]`);
              } else if (item instanceof File) {
                formData.append(`${formKey}[${index}]`, item);
              } else {
                formData.append(`${formKey}[${index}]`, item.toString());
              }
            });
          } else if (
            typeof obj[key] === "object" &&
            !(obj[key] instanceof File)
          ) {
            appendNestedObject(obj[key], formKey);
          } else {
            formData.append(formKey, obj[key].toString());
          }
        }
      });
    };

    appendNestedObject(clientData);

    const response = await apiClient.patch(
      `/api/user/clients/${clientId}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("Update client error:", error.response?.data);
    handleApiErrorWithValidation(error);
  }
};

export const fetchCarePlanByClient = async (clientId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/careplans/client/${clientId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchCarePlanCarers = async (clientId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/careplans/client/${clientId}/carers`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateCarePlan = async (carePlanId, patchData) => {
  try {
    const response = await apiClient.patch(`/api/rostering/careplans/${carePlanId}`, patchData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const createClientTask = async (taskData) => {
  try {
    const response = await apiClient.post("/api/rostering/tasks/", taskData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const updateClientTask = async (taskId, taskData) => {
  try {
    const response = await apiClient.patch(`/api/rostering/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const deleteClientTask = async (taskId) => {
  try {
    const response = await apiClient.delete(`/api/rostering/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const fetchClientTaskByClientAndRelatedTable = async (
  clientId,
  relatedTable
) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/tasks/client/${clientId}/table/${relatedTable}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchClientTaskByClient = async (clientId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/tasks/client/${clientId}`
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

// CLIENT VISITS

export const fetchClientVisits = async (clientId, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.hasTasks !== undefined) {
      params.append("hasTasks", filters.hasTasks);
    }
    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }
    if (filters.page) {
      params.append("page", filters.page);
    }
    if (filters.pageSize) {
      params.append("pageSize", filters.pageSize);
    }

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await apiClient.get(
      `/api/rostering/tasks/client/${clientId}/visits${query}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// SCHEDULED VISITS
export const fetchScheduledVisits = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.pageSize) params.append('pageSize', filters.pageSize);

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/api/rostering/tasks/visits${query}`);
    return response.data; // { items: [], total, page, pageSize }
  } catch (error) {
    handleApiError(error);
  }
};

// REQUESTS BY STATUS
export const fetchRequestsByStatus = async (status) => {
  try {
    const response = await apiClient.get(`/api/rostering/requests/status/${status}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const assignClientToCluster = async (clusterId, clientId) => {
  try {
    const response = await apiClient.post(
      `/api/rostering/clusters/${clusterId}/assign-client/${clientId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchClusterClients = async (clusterId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/clusters/${clusterId}/clients`
    );
    const clientsData = response.data.clients;
    // Handle both formats: empty array or object with count/results
    if (Array.isArray(clientsData)) {
      return { count: 0, next: null, previous: null, results: [] };
    }
    return clientsData; // { count, next, previous, results }
  } catch (error) {
    handleApiError(error);
  }
};

// Bulk fetch user details (carers/employees)
export const fetchBulkUserDetails = async (userIds) => {
  try {
    const response = await apiClient.post('/api/user/bulk-user-details', {
      user_ids: userIds
    });
    
    // Transform array response to object keyed by user ID for easy lookup
    const usersMap = {};
    if (response.data.users && Array.isArray(response.data.users)) {
      response.data.users.forEach(user => {
        usersMap[user.id] = user;
      });
    }
    
    return usersMap;
  } catch (error) {
    handleApiError(error);
    return {};
  }
};

export const fetchClientCarers = async (clientId) => {
  try {
    const response = await apiClient.get(`/api/rostering/careplans/client/${clientId}/carers`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    return { carers: [] };
  }
};
