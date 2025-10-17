import type { ReviewStats } from './Review'

export interface Book {
  bookId: string
  title: string
  description: string
  isbn: string
  authors: string[]
  publisher: string
  publicationDate: string
  pageCount: number
  genre: string
  originalLanguage: string
  coverImageId: string
}

export interface BookWithDetails extends Book {
  reviewStats: ReviewStats | null
  userRating: number
  userReviewId: string | null
  reviewText: string | null
  readingListId: string | null
}

export interface PagedResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  pageNumber: number
  pageSize: number
  first: boolean
  last: boolean
}