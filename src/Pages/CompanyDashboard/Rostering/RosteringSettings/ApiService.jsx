export const fetchTimezoneChoices = async () => {
  try {
    const response = await apiClient.get(
      "/api/applications-engine/schedules/api/timezone-choices/"
    );
    const data = response.data.data || response.data;

    if (
      !Array.isArray(data) ||
      !data.every(
        (tz) => typeof tz === "object" && "value" in tz && "label" in tz
      )
    ) {
      throw new Error("Invalid timezone choices format");
    }

    return data;
  } catch (error) {
    handleApiError(error);
  }
};
