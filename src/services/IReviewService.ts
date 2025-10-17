import type { Review, ReviewInput, ReviewStats } from '@/models/Review'

export interface IReviewService {
  getReviewStats(bookId: string): Promise<ReviewStats | null>
  getMyReviewForBook(bookId: string): Promise<Review | null>
  getReviewsByUser(userId: string): Promise<Review[]>
  createOrUpdateReview(details: ReviewInput): Promise<Review>
}