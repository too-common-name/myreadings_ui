export interface ReadingList {
  readingListId: string
  name: string
  description: string
  books: string[]
}

export interface ReadingListInput {
  name: string
  description: string
}