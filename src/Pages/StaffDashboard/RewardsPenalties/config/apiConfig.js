import { apiClient } from "../../../../config";
import { handleApiError } from "../../../../utils/helpers";

export const fetchUserRewards = async (pageUrl = null) => {
  try {
    const response = await apiClient.get(pageUrl || "/api/hr/user/rewards/");
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

export const fetchUserPenalties = async (pageUrl = null) => {
  try {
    const response = await apiClient.get(pageUrl || "/api/hr/user/penalties/");
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
