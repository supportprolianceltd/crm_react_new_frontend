import { apiClient } from "../../config";
import axios from "axios";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../utils/helpers";

export const resetPassword = async (emailOrUsername) => {
  try {
    const tenantDomain = localStorage.getItem('tenantDomain') || '';
    let payload = {};
    if (emailOrUsername.includes(tenantDomain)) {
      payload = { email: emailOrUsername };
    } else {
      payload = { username: emailOrUsername };
    }
    localStorage.setItem('resetIdentifier', JSON.stringify(payload));
    const response = await apiClient.post("/api/user/password/reset", payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const confirmPasswordReset = async (token, newPassword, confirmPassword) => {
  try {
    const identifier = JSON.parse(localStorage.getItem('resetIdentifier') || '{}');
    const payload = {
      ...identifier,
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    const response = await apiClient.post("/api/user/password/reset/confirm", payload);
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const createPublicExternalRequest = async (requestData) => {
  try {
    const response = await axios.post(
      `https://server1.prolianceltd.com/api/rostering/requests/public`,
      requestData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};
