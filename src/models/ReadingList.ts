import type { Book } from './Book'

export interface ReadingList {
  books: Book[]
  description: string
  name: string
  readingListId: string
}
