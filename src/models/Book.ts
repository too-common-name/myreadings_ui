import type { ReviewStats } from './ReviewStats'

export interface Book {
  bookId: string
  coverImageId: string
  description: string
  isbn: string
  originalLanguage: string
  pageCount: number
  publicationDate: string
  publisher: string
  title: string
  genre: string
}

export interface BookWithUserRating extends Book {
  userRating?: number
  readingListId?: string | null
  reviewStats?: ReviewStats | null
  userReviewId?: string | null
  reviewText?: string | null
}
