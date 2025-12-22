import { apiClient } from "../../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../../utils/helpers";

export const fetchApplicantDetails = async (applicantId) => {
  try {
    const response = await apiClient.get(
      `/api/applications-engine/applications/${applicantId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const completeCompliance = async (applicantId, payload) => {
  try {
    const response = await apiClient.post(
      `/api/applications-engine/applications/applicant/check/${applicantId}/compliance/`,
      payload
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const saveCompliance = async (applicantId, payload) => {
  try {
    const response = await apiClient.put(
      `/api/applications-engine/applications/${applicantId}/`,
      payload
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};
