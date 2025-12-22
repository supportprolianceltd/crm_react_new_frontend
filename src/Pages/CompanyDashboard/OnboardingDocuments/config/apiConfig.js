// config/apiConfig.js (updated)
import { apiClient } from "../../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../../utils/helpers";

export const fetchOnboardingDocuments = async () => {
  const abortController = new AbortController();

  try {
    const response = await apiClient.get("/api/user/documents/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      signal: abortController.signal,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const uploadOnboardingDocument = async (formData, documentId = null) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "multipart/form-data",
      },
    };

    let response;
    if (documentId) {
      response = await apiClient.patch(
        `/api/user/documents/${documentId}/`,
        formData,
        config
      );
    } else {
      response = await apiClient.post("/api/user/documents/", formData, config);
    }

    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const deleteOnboardingDocument = async (documentId) => {
  try {
    await apiClient.delete(`/api/user/documents/${documentId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchUsersNoPagination = async () => {
  try {
    const response = await apiClient.get("/api/user/users-no-pagination/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateDocumentPermissions = async (documentId, payload) => {
  try {
    const response = await apiClient.patch(
      `/api/user/documents/${documentId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateOnboardingDocument = async (documentId, payload) => {
  try {
    const response = await apiClient.patch(
      `/api/user/documents/${documentId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const fetchDocumentDetails = async (documentId) => {
  try {
    const response = await apiClient.get(`/api/user/documents/${documentId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const fetchAcknowledgements = async (documentId) => {
  try {
    const response = await apiClient.get(
      `/api/user/documents/${documentId}/acknowledgments/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const fetchVersions = async (documentId) => {
  try {
    const response = await apiClient.get(
      `/api/user/documents/${documentId}/versions/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const bulkCreateUsers = async (usersPayload) => {
  try {
    const response = await apiClient.post(
      "/api/user/users/bulk-create/",
      usersPayload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
