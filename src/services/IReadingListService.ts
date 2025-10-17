import type { ReadingList } from '@/models/ReadingList';

export interface IReadingListService {
  getMyReadingLists(): Promise<ReadingList[]>;
  getReadingListContainingBook(bookId: string): Promise<ReadingList | null>;
  createReadingList(details: { name: string; description: string }): Promise<ReadingList>;
  addBookToReadingList(listId: string, bookId: string): Promise<void>;
  removeBookFromReadingList(listId: string, bookId: string): Promise<void>;
  moveBookBetweenReadingLists(bookId: string, sourceListId: string, targetListId: string): Promise<void>;
}