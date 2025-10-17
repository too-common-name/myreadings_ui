import type { User } from '@/models/User';

export interface IUserService {
  getUserProfile(userId: string): Promise<User | null>;
}