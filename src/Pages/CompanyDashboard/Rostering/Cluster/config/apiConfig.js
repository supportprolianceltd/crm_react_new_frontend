import { apiClient } from "../../../../../config";
import {
  handleApiError,
  handleApiErrorWithValidation,
} from "../../../../../utils/helpers";

export const createCluster = async (clusterData) => {
  try {
    const response = await apiClient.post(
      `/api/rostering/clusters`,
      clusterData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const fetchAllClusters = async () => {
  try {
    const response = await apiClient.get(`/api/rostering/clusters`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateCluster = async (clusterData) => {
  try {
    const response = await apiClient.put(
      `/api/rostering/clusters/${clusterData.id}`,
      clusterData
    );
    return response.data;
  } catch (error) {
    handleApiErrorWithValidation(error);
  }
};

export const deleteCluster = async (clusterId) => {
  try {
    const response = await apiClient.delete(
      `/api/rostering/clusters/${clusterId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchClusterClients = async (clusterId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/clusters/${clusterId}/clients`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchClusterCarers = async (clusterId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/clusters/${clusterId}/carers`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchClientCarers = async (clientId) => {
  try {
    const response = await apiClient.get(
      `/api/rostering/careplans/client/${clientId}/carers`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const assignClientToCluster = async (clusterId, clientId) => {
  try {
    const response = await apiClient.post(
      `/api/rostering/clusters/${clusterId}/assign-client/${clientId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const assignCarerToCluster = async (clusterId, carerId) => {
  try {
    const response = await apiClient.post(
      `/api/rostering/clusters/${clusterId}/assign-carer/${carerId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
