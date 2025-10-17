import type { IUserService } from './IUserService'
import type { User } from '@/models/User'
import apolloClient from '@/utils/apolloClient'
import { gql } from '@apollo/client/core'

const GET_USER_BY_ID_QUERY = gql`
        query GetUserProfile($userId: String!) {
          userById(userId: $userId) {
            userId
            username
            firstName
            lastName
            email
            themePreference
          }
        }
      `

interface UserByIdQueryResult {
  userById: User | null
}

export class GqlUserService implements IUserService {
  public async getUserProfile(userId: string): Promise<User | null> {
    const { data } = await apolloClient.query<UserByIdQueryResult>({
      query: GET_USER_BY_ID_QUERY,
      variables: { userId },
    })
    return data?.userById ?? null
  }
}