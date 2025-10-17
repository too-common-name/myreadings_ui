import type { Book, BookWithDetails, PagedResponse } from '@/models/Book';

export interface IBookService {
  getNewReleases(limit: number): Promise<Book[]>;
  getRecommended(limit: number): Promise<Book[]>;
  searchBooks(query: string, page: number, size: number): Promise<PagedResponse<Book>>;
  getBooksInReadingListWithDetails(readingListId: string): Promise<BookWithDetails[]>;
  getBookById(bookId: string): Promise<Book | null>
}