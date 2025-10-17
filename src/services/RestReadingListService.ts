import type { IReadingListService } from './IReadingListService'
import type { ReadingList, ReadingListInput } from '@/models/ReadingList'
import axiosInstance from '@/utils/axiosInstance'

export class RestReadingListService implements IReadingListService {
  public async getMyReadingLists(): Promise<ReadingList[]> {
    const response = await axiosInstance.get('/api/v1/readinglists')
    return response.data ?? []
  }

  public async getReadingListContainingBook(bookId: string): Promise<ReadingList | null> {
    try {
      const response = await axiosInstance.get(`/api/v1/readinglists/books/${bookId}/in-my-list`)
      return response.data
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null
      }
      throw error
    }
  }

  public async createReadingList(details: ReadingListInput): Promise<ReadingList> {
    const response = await axiosInstance.post('/api/v1/readinglists', details)
    return response.data
  }

  public async addBookToReadingList(listId: string, bookId: string): Promise<void> {
    await axiosInstance.post(`/api/v1/readinglists/${listId}/books`, { bookId })
  }

  public async removeBookFromReadingList(listId: string, bookId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/readinglists/${listId}/books/${bookId}`)
  }

  public async moveBookBetweenReadingLists(
    bookId: string,
    sourceListId: string,
    targetListId: string,
  ): Promise<void> {
    await axiosInstance.put(`/api/v1/readinglists/books/${bookId}/move`, {
      sourceListId,
      targetListId,
    })
  }
}