import type { IUserService } from './IUserService'
import type { User } from '@/models/User'
import axiosInstance from '@/utils/axiosInstance'

export class RestUserService implements IUserService {
  public async getUserProfile(userId: string): Promise<User | null> {
    try {
      const response = await axiosInstance.get(`/api/v1/users/${userId}`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null
      }
      console.error('Error fetching user profile:', error)
      throw error
    }
  }
}