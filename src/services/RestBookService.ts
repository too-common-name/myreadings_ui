import type { IBookService } from './IBookService'
import type { Book, PagedResponse, BookWithDetails } from '@/models/Book'
import type { IReadingListService } from './IReadingListService'
import type { IReviewService } from './IReviewService'
import axiosInstance from '@/utils/axiosInstance'

export class RestBookService implements IBookService {
  public constructor(
    private readingListService: IReadingListService,
    private reviewService: IReviewService,
  ) {}

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

    const booksWithDetailsPromises = booksData.map(async (book) => {
      const [listInfo, stats, myReview] = await Promise.all([
        this.readingListService.getReadingListContainingBook(book.bookId),
        this.reviewService.getReviewStats(book.bookId),
        this.reviewService.getMyReviewForBook(book.bookId),
      ])

      return {
        ...book,
        reviewStats: stats,
        userRating: myReview?.rating ?? 0,
        userReviewId: myReview?.reviewId ?? null,
        reviewText: myReview?.reviewText ?? null,
        readingListId: listInfo?.readingListId ?? null,
      }
    })

    return Promise.all(booksWithDetailsPromises)
  }
}