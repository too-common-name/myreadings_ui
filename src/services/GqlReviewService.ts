import type { IReviewService } from './IReviewService'
import type { Review, ReviewStats } from '@/models/Review'
import apolloClient from '@/utils/apolloClient'
import { gql } from '@apollo/client/core'

const GET_REVIEW_STATS_QUERY = gql`
  query GetReviewStats($bookId: String!) {
    reviewStatsByBookId(bookId: $bookId) {
      bookId
      totalReviews
      averageRating
    }
  }
`

const GET_MY_REVIEW_QUERY = gql`
  query GetMyReview($bookId: String!) {
    myReviewForBook(bookId: $bookId) {
      reviewId bookId userId rating reviewText publicationDate username
    }
  }
`

const GET_REVIEWS_BY_USER_QUERY = gql`
  query GetUserReviews($userId: String!) {
    reviewsByUserId(userId: $userId) {
      reviewId bookId userId rating reviewText publicationDate username
    }
  }
`

const UPDATE_REVIEW_MUTATION = gql`
  mutation UpdateReview($reviewId: String!, $updates: ReviewRequestDTOInput!) {
    updateReview(reviewId: $reviewId, updates: $updates) {
      reviewId bookId userId rating reviewText publicationDate username
    }
  }
`

const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($review: ReviewRequestDTOInput!) {
    createReview(review: $review) {
      reviewId bookId userId rating reviewText publicationDate username
    }
  }
`

interface ReviewStatsQueryResult {
  reviewStatsByBookId: ReviewStats | null
}
interface MyReviewQueryResult {
  myReviewForBook: Review | null
}
interface ReviewsByUserQueryResult {
  reviewsByUserId: Review[]
}
interface CreateReviewMutationResult {
  createReview: Review
}
interface UpdateReviewMutationResult {
  updateReview: Review
}

export class GqlReviewService implements IReviewService {
  public async getReviewStats(bookId: string): Promise<ReviewStats | null> {
    const { data } = await apolloClient.query<ReviewStatsQueryResult>({
      query: GET_REVIEW_STATS_QUERY,
      variables: { bookId },
    })
    return data?.reviewStatsByBookId ?? null
  }

  public async getMyReviewForBook(bookId: string): Promise<Review | null> {
    const { data } = await apolloClient.query<MyReviewQueryResult>({
      query: GET_MY_REVIEW_QUERY,
      variables: { bookId },
    })
    return data?.myReviewForBook ?? null
  }

  public async getReviewsByUser(userId: string): Promise<Review[]> {
    const { data } = await apolloClient.query<ReviewsByUserQueryResult>({
      query: GET_REVIEWS_BY_USER_QUERY,
      variables: { userId },
    })
    return data?.reviewsByUserId ?? []
  }

  public async createOrUpdateReview(details: {
    bookId: string
    reviewId?: string | null
    rating: number
    reviewText?: string
  }): Promise<Review> {
    const refetchQueries = [
      {
        query: GET_REVIEW_STATS_QUERY,
        variables: { bookId: details.bookId },
      },
      {
        query: GET_MY_REVIEW_QUERY,
        variables: { bookId: details.bookId },
      },
    ]

    if (details.reviewId) {
      const { data } = await apolloClient.mutate<UpdateReviewMutationResult>({
        mutation: UPDATE_REVIEW_MUTATION,
        variables: {
          reviewId: details.reviewId,
          updates: {
            bookId: details.bookId,
            rating: details.rating,
            reviewText: details.reviewText,
          },
        },
        refetchQueries,
        awaitRefetchQueries: true,
      })
      return data!.updateReview
    } else {
      const { data } = await apolloClient.mutate<CreateReviewMutationResult>({
        mutation: CREATE_REVIEW_MUTATION,
        variables: {
          review: {
            bookId: details.bookId,
            rating: details.rating,
            reviewText: details.reviewText,
          },
        },
        refetchQueries,
        awaitRefetchQueries: true,
      })
      return data!.createReview
    }
  }
}