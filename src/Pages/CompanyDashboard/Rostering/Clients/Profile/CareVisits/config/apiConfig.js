import { apiClient } from "../../../../../../../config";
import { handleApiError } from "../../../../../../../utils/helpers";

export const fetchCarers = async () => {
  try {
    const response = await apiClient.get("/api/user/users-no-pagination/");

    const allUsers = response.data || [];
    const keywords = [
      "carer",
      "care",
      "healthcare",
      "nurse",
      "support",
      "assistant",
      "aide",
    ];

    console.log(allUsers);

    const filteredCarers = allUsers.filter((user) => {
      const role = user.role?.toLowerCase() || "";
      const jobRole = user.job_role?.toLowerCase() || "";

      const hasCarerRole = role === "carer";
      const hasRelatedJobRole = keywords.some((keyword) =>
        jobRole.includes(keyword)
      );

      console.log(hasCarerRole, hasRelatedJobRole, user);

      return hasCarerRole || hasRelatedJobRole;
    });

    return filteredCarers;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
