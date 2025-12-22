import { apiClient } from "../../../../../config";
import { handleApiError } from "../../../../../utils/helpers";

export const fetchEmployeesForRostering = async () => {
  try {
    const response = await apiClient.get("/api/user/users-no-pagination/");
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
