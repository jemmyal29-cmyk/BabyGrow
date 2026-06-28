/**
 * Children API Endpoints
 */

import apiClient from '../config';
import type {
  Child,
  ChildWithMeasurements,
  ChildFormData,
  ApiResponse,
  PaginatedResponse,
} from '../../types/models';

export const childrenApi = {
  /**
   * Get all children for current user
   */
  getChildren: async (): Promise<ApiResponse<Child[]>> => {
    const response = await apiClient.get<ApiResponse<Child[]>>('/children');
    return response.data;
  },

  /**
   * Get child by ID with measurements
   */
  getChildById: async (childId: string): Promise<ApiResponse<ChildWithMeasurements>> => {
    const response = await apiClient.get<ApiResponse<ChildWithMeasurements>>(
      `/children/${childId}`
    );
    return response.data;
  },

  /**
   * Create new child profile
   */
  createChild: async (data: ChildFormData): Promise<ApiResponse<Child>> => {
    const response = await apiClient.post<ApiResponse<Child>>('/children', data);
    return response.data;
  },

  /**
   * Update child profile
   */
  updateChild: async (
    childId: string,
    data: Partial<ChildFormData>
  ): Promise<ApiResponse<Child>> => {
    const response = await apiClient.patch<ApiResponse<Child>>(
      `/children/${childId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete child profile
   */
  deleteChild: async (childId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/children/${childId}`);
    return response.data;
  },

  /**
   * Upload child photo
   */
  uploadPhoto: async (childId: string, photoUri: string): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'child-photo.jpg',
    } as any);

    const response = await apiClient.post<ApiResponse<string>>(
      `/children/${childId}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default childrenApi;
