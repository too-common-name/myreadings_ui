import instance from '@/utils/axiosInstance';
import type { ReadingList } from '@/models/ReadingList';
import type { ReviewStats } from '@/models/ReviewStats';

export function useBookDataFetcher() {
  
  async function fetchBookReadingList(bookId: string): Promise<ReadingList | null> {
    try {
      const res = await instance.get(`/api/v1/readinglists/books/${bookId}/in-my-list`);
      return res.data;
    } catch (e: any) {
      if (e.response?.status === 404) return null;
      console.error(`Error fetching reading list for book ${bookId}:`, e);
      return null;
    }
  }
  
  async function fetchReviewStatsData(bookId: string): Promise<ReviewStats | null> {
    try {
      const res = await instance.get(`/api/v1/reviews/books/${bookId}/stats`);
      return res.data;
    } catch (e: any) {
      if (e.response?.status === 404) return { bookId, totalReviews: 0, averageRating: 0 };
      console.error(`Error fetching review stats for book ${bookId}:`, e);
      return null;
    }
  }
  
  async function fetchMyReviewForBook(bookId: string): Promise<{ rating: number; reviewId: string | null; reviewText: string | null } | null> {
    try {
      const res = await instance.get(`/api/v1/reviews/books/${bookId}/my-review`);
      return {
        rating: res.data.rating || 0,
        reviewId: res.data.reviewId || null,
        reviewText: res.data.reviewText || null
      };
    } catch (e: any) {
      if (e.response?.status === 404) return { rating: 0, reviewId: null, reviewText: null };
      console.error(`Error fetching user review for book ${bookId}:`, e);
      return null;
    }
  }

  return {
    fetchBookReadingList,
    fetchReviewStatsData,
    fetchMyReviewForBook,
  };
}
