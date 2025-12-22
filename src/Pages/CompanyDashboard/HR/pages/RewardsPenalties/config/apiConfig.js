import { apiClient } from "../../../../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../../../../utils/helpers";

export const fetchRewards = async (pageUrl = null) => {
  try {
    const response = await apiClient.get(pageUrl || "/api/hr/rewards/");
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

export const createReward = async (rewardData) => {
  try {
    const response = await apiClient.post("/api/hr/rewards/", rewardData);
    return response.data;
  } catch (error) {
    console.log("Create reward error:", error.response?.data);
    handleApiErrorWithValidation(error);
  }
};

export const fetchSingleReward = async (rewardId) => {
  try {
    const response = await apiClient.get(`/api/hr/rewards/${rewardId}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchPenalties = async (pageUrl = null) => {
  try {
    const response = await apiClient.get(pageUrl || "/api/hr/penalties/");
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

export const createPenalty = async (penaltyData) => {
  try {
    const response = await apiClient.post("/api/hr/penalties/", penaltyData);
    return response.data;
  } catch (error) {
    console.log("Create penalty error:", error.response?.data);
    handleApiErrorWithValidation(error);
  }
};

export const fetchSinglePenalty = async (penaltyId) => {
  try {
    const response = await apiClient.get(`/api/hr/penalties/${penaltyId}/`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
