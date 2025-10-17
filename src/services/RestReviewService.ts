import type { IReviewService } from './IReviewService'
import type { Review, ReviewStats } from '@/models/Review'
import axiosInstance from '@/utils/axiosInstance'

export class RestReviewService implements IReviewService {
  public async getReviewStats(bookId: string): Promise<ReviewStats | null> {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews/books/${bookId}/stats`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null
      }
      throw error
    }
  }

  public async getMyReviewForBook(bookId: string): Promise<Review | null> {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews/books/${bookId}/my-review`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null
      }
      throw error
    }
  }

  public async getReviewsByUser(userId: string): Promise<Review[]> {
    const response = await axiosInstance.get(`/api/v1/reviews/users/${userId}`)
    return response.data ?? []
  }

  public async createOrUpdateReview(details: {
    bookId: string
    reviewId?: string | null
    rating: number
    reviewText?: string
  }): Promise<Review> {
    const requestBody = {
      bookId: details.bookId,
      rating: details.rating,
      reviewText: details.reviewText,
    }

    if (details.reviewId) {
      const response = await axiosInstance.put(`/api/v1/reviews/${details.reviewId}`, requestBody)
      return response.data
    } else {
      const response = await axiosInstance.post('/api/v1/reviews', requestBody)
      return response.data
    }
  }
}