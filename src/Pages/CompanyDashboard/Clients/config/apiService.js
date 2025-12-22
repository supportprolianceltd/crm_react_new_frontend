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

export const createClient = async (clientData) => {
  try {
    const response = await apiClient.post("/api/user/clients/", clientData);
    return response.data;
  } catch (error) {
    console.log("Create client error:", error.response?.data);
    handleApiErrorWithValidation(error);
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

export const deleteClient = async (clientId) => {
  try {
    const response = await apiClient.delete(`/api/user/clients/${clientId}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Client care plan & rostering

// ...existing code...
export const createCarePlan = async (carePlanData) => {
  try {
    console.log("createCarePlan - payload:", carePlanData);
    if (carePlanData instanceof FormData) {
      const entries = {};
      for (const [k, v] of carePlanData.entries()) entries[k] = v;
      console.log("createCarePlan - FormData entries:", entries);
    } else {
      try {
        console.log("createCarePlan - payload JSON:", JSON.stringify(carePlanData, null, 2));
      } catch (e) {
        // ignore JSON stringify errors for circular refs
      }
    }

    const response = await apiClient.post(`/api/rostering/careplans`, carePlanData);
    console.log("createCarePlan - response:", response.data);
    return response.data;
  } catch (error) {
    console.error("createCarePlan - error:", error.response?.data || error);
    handleApiErrorWithValidation(error);
  }
};
// ...existing code...

export const fetchAllCarePlans = async () => {
  try {
    const response = await apiClient.get(`/api/rostering/careplans`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createRosteringTask = async (taskData) => {
  try {
    const response = await apiClient.post(`/api/rostering/tasks`, taskData);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const fetchRosteringTasks = async (carePlanId) => {
  try {
    const response = await apiClient.get(`/api/rostering/tasks`, {
      params: { care_plan_id: carePlanId },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
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

export const fetchRosteringTasksByClientAndRelatedTable = async (
  clientId,
  relatedTable
) => {
  try {
    const response = await apiClient.get(
      `/api/v1/tasks/client/${clientId}/table/${relatedTable}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const autoAssignClientToCluster = async (payload) => {
  try {
    const response = await apiClient.post("/api/rostering/clusters/auto-assign-client", payload);
    return response.data;
  } catch (error) {
    console.error("Auto-assign client to cluster error:", error.response?.data || error);
    // Don't throw, as this is optional and shouldn't block client creation
  }
};

export const bulkCreateClients = async (clientsData) => {
  try {
    const response = await apiClient.post("/api/user/clients/bulk-create/", clientsData);
    return response.data;
  } catch (error) {
    console.log("Bulk create clients error:", error.response?.data);
    handleApiErrorWithValidation(error);
  }
};
