import type { IBookService } from './IBookService'
import type { Book, PagedResponse, BookWithDetails } from '@/models/Book'
import type { IReviewService } from './IReviewService'
import apolloClient from '@/utils/apolloClient'
import { gql } from '@apollo/client/core'

const GET_BOOK_BY_ID_QUERY = gql`
  query GetBookById($bookId: String!) {
    bookById(bookId: $bookId) {
      bookId title description isbn authors publisher publicationDate pageCount genre coverImageId
    }
  }
`

const GET_NEW_RELEASES_QUERY = gql`
  query GetNewReleases($limit: Int!) {
    allBooks(sort: "publicationDate", order: "desc", limit: $limit) {
      bookId title description isbn authors publisher publicationDate pageCount genre coverImageId
    }
  }
`

const GET_RECOMMENDED_QUERY = gql`
  query GetRecommended($limit: Int!) {
    allBooks(limit: $limit) {
      bookId title description isbn authors publisher publicationDate pageCount genre coverImageId
    }
  }
`

const SEARCH_BOOKS_QUERY = gql`
  query SearchBooks($query: String!, $page: Int, $size: Int) {
    searchBooks(query: $query, page: $page, size: $size) {
      content {
        bookId title description isbn authors publisher publicationDate pageCount genre coverImageId
      }
      totalPages totalElements pageNumber pageSize first last
    }
  }
`

export const GET_BOOKS_IN_LIST_QUERY = gql`
  query GetBooksInList($readingListId: String!) {
    booksInReadingList(readingListId: $readingListId) {
      bookId title description isbn authors publisher publicationDate pageCount genre coverImageId
    }
  }
`

interface AllBooksQueryResult {
  allBooks: Book[]
}
interface BookByIdQueryResult {
  bookById: Book | null
}
interface SearchBooksQueryResult {
  searchBooks: PagedResponse<Book>
}
interface BooksInListQueryResult {
  booksInReadingList: Book[]
}

export class GqlBookService implements IBookService {
  public constructor(private reviewService: IReviewService) {}

  public async getBookById(bookId: string): Promise<Book | null> {
    const { data } = await apolloClient.query<BookByIdQueryResult>({
      query: GET_BOOK_BY_ID_QUERY,
      variables: { bookId },
    })
    return data?.bookById ?? null
  }

  public async getBooksByIds(bookIds: string[]): Promise<Book[]> {
    if (bookIds.length === 0) return []
    const results = await Promise.all(bookIds.map((id) => this.getBookById(id)))
    return results.filter((b): b is Book => b !== null)
  }

  public async getNewReleases(limit: number): Promise<Book[]> {
    const { data } = await apolloClient.query<AllBooksQueryResult>({
      query: GET_NEW_RELEASES_QUERY,
      variables: { limit },
    })
    return data?.allBooks ?? []
  }

  public async getRecommended(limit: number): Promise<Book[]> {
    const { data } = await apolloClient.query<AllBooksQueryResult>({
      query: GET_RECOMMENDED_QUERY,
      variables: { limit },
    })
    return data?.allBooks ?? []
  }

  public async searchBooks(query: string, page: number, size: number): Promise<PagedResponse<Book>> {
    const { data } = await apolloClient.query<SearchBooksQueryResult>({
      query: SEARCH_BOOKS_QUERY,
      variables: { query, page, size },
    })
    return (
      data?.searchBooks ?? {
        content: [],
        totalPages: 0,
        totalElements: 0,
        pageNumber: page,
        pageSize: size,
        first: true,
        last: true,
      }
    )
  }

  public async getBooksInReadingListWithDetails(
    readingListId: string,
  ): Promise<BookWithDetails[]> {
    const { data } = await apolloClient.query<BooksInListQueryResult>({
      query: GET_BOOKS_IN_LIST_QUERY,
      variables: { readingListId },
    })
    const booksData: Book[] = data?.booksInReadingList ?? []

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