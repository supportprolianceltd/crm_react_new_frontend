import { apiClient } from "../../../config";

export const createTenant = async (tenantData) => {
  try {
    const response = await apiClient.post("/api/tenant/tenants/", tenantData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    const apiError = error.response?.data;
    let errorMessage = error.message || "Failed to create tenant.";

    if (apiError) {
      if (typeof apiError === "string") {
        errorMessage = apiError;
      } else if (typeof apiError === "object") {
        errorMessage = Object.values(apiError).flat().join(", ");
      }
    }

    throw new Error(errorMessage);
  }
};

export const fetchTenants = async (url = null) => {
  try {
    const response = await apiClient.get(url || "/api/tenant/tenants/");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch tenants.");
  }
};

export const fetchSingleTenant = async (tenantId) => {
  try {
    const response = await apiClient.get(`/api/tenant/tenants/${tenantId}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch tenant details.");
  }
};

export const updateTenant = async (tenantId, tenantData) => {
  try {
    const response = await apiClient.patch(
      `/api/tenant/tenants/${tenantId}/`,
      tenantData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const apiError = error.response?.data;
    let errorMessage = error.message || "Failed to update tenant.";

    if (apiError) {
      if (typeof apiError === "string") {
        errorMessage = apiError;
      } else if (typeof apiError === "object") {
        errorMessage = Object.values(apiError).flat().join(", ");
      }
    }

    throw new Error(errorMessage);
  }
};

export const deleteTenant = async (tenantId) => {
  try {
    const response = await apiClient.delete(`/api/tenant/tenants/${tenantId}/`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete tenant.");
  }
};
