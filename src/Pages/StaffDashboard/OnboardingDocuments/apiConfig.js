import { apiClient } from "../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../utils/helpers";

export const fetchStaffOnboardingDocuments = async (userId) => {
  const abortController = new AbortController();

  try {
    const response = await apiClient.get(
      `api/user/documents/user-access/?user_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        signal: abortController.signal,
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const acknowledgeStaffDocument = async (documentId) => {
  try {
    const response = await apiClient.post(
      `/api/user/documents/${documentId}/acknowledge/`,
      {},
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
