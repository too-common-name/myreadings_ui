import type { IBookService } from './IBookService'
import type { Book, PagedResponse, BookWithDetails } from '@/models/Book'
import type { IReviewService } from './IReviewService'
import axiosInstance from '@/utils/axiosInstance'

export class RestBookService implements IBookService {
  public constructor(private reviewService: IReviewService) {}

    public async getBookById(bookId: string): Promise<Book | null> {
    try {
      const response = await axiosInstance.get(`/api/v1/books/${bookId}`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null
      }
      throw error
    }
  }
  
  public async getBooksByIds(bookIds: string[]): Promise<Book[]> {
    if (bookIds.length === 0) return []
    const response = await axiosInstance.post('/api/v1/books/batch', bookIds)
    return response.data ?? []
  }

  public async getNewReleases(limit: number): Promise<Book[]> {
    const response = await axiosInstance.get('/api/v1/books', {
      params: { sort: 'publicationdate', order: 'desc', limit },
    })
    return response.data ?? []
  }

  public async getRecommended(limit: number): Promise<Book[]> {
    const response = await axiosInstance.get('/api/v1/books', { params: { limit } })
    return response.data ?? []
  }

  public async searchBooks(query: string, page: number, size: number): Promise<PagedResponse<Book>> {
    const response = await axiosInstance.get('/api/v1/books/search', {
      params: { query, page, size },
    })
    return response.data
  }

  public async getBooksInReadingListWithDetails(
    readingListId: string,
  ): Promise<BookWithDetails[]> {
    const booksResponse = await axiosInstance.get(`/api/v1/readinglists/${readingListId}/books`)
    const booksData: Book[] = booksResponse.data ?? []
    if (booksData.length === 0) return []

    const bookIds = booksData.map((b) => b.bookId)
    const [statsList, reviewsList] = await Promise.all([
      this.reviewService.getReviewStatsBatch(bookIds),
      this.reviewService.getMyReviewsForBooks(bookIds),
    ])

    const statsMap = new Map(statsList.map((s) => [s.bookId, s]))
    const reviewsMap = new Map(reviewsList.map((r) => [r.bookId, r]))

    return booksData.map((book) => {
      const review = reviewsMap.get(book.bookId)
      return {
        ...book,
        reviewStats: statsMap.get(book.bookId) ?? null,
        userRating: review?.rating ?? 0,
        userReviewId: review?.reviewId ?? null,
        reviewText: review?.reviewText ?? null,
        readingListId,
      }
    })
  }
}