import { ref } from 'vue';
import instance from '@/utils/axiosInstance';
import type { Book, BookWithUserRating } from '@/models/Book';
import type { ReviewStats } from '@/models/ReviewStats';

export function useBookDialog() {
  const showBookDetailsDialog = ref(false);
  const selectedBookForDetails = ref<BookWithUserRating | null>(null);
  const userRatingForSelectedBook = ref(0);
  const bookReadingListIdForSelectedBook = ref<string | null>(null);

  const openBookDialog = async (
    bookBaseInfo: Book,
    fetchedReviewStats: ReviewStats | null,
    fetchedUserRating: number,
    fetchedUserReviewId: string | null,
    fetchedReviewText: string | null,
    currentReadingListId: string | null
  ) => {
    selectedBookForDetails.value = {
      ...bookBaseInfo,
      reviewStats: fetchedReviewStats,
      userRating: fetchedUserRating,
      readingListId: currentReadingListId,
      userReviewId: fetchedUserReviewId,
      reviewText: fetchedReviewText,
    } as BookWithUserRating;

    userRatingForSelectedBook.value = fetchedUserRating;
    bookReadingListIdForSelectedBook.value = currentReadingListId;
    showBookDetailsDialog.value = true;
  };

  const handleConfirmChanges = async (
    payload: { bookId: string; newRating?: number; selectedListId?: string | null },
    onBookUpdatedInList?: (updatedBook: BookWithUserRating) => void,
    onBookMoved?: () => Promise<void>
  ) => {
    let needsDialogRefresh = false;

    if (payload.newRating !== undefined && payload.newRating !== userRatingForSelectedBook.value) {
      try {
        const reviewPayload = {
          bookId: payload.bookId,
          rating: payload.newRating,
          reviewText: selectedBookForDetails.value?.reviewText ?? null
        };

        if (selectedBookForDetails.value?.userReviewId) {
          await instance.put(`/api/v1/reviews/${selectedBookForDetails.value.userReviewId}`, reviewPayload);
        } else {
          const response = await instance.post(`/api/v1/reviews`, reviewPayload);
          if (response.data && response.data.reviewId && selectedBookForDetails.value) {
            selectedBookForDetails.value.userReviewId = response.data.reviewId;
          }
        }
        needsDialogRefresh = true;
      } catch (error) {
        console.error('Error updating/creating rating:', error);
      }
    }

    if (payload.selectedListId !== undefined && payload.selectedListId !== bookReadingListIdForSelectedBook.value) {
      try {
        await instance.put(`/api/v1/readinglists/books/${payload.bookId}/move`, {
          sourceListId: bookReadingListIdForSelectedBook.value,
          targetListId: payload.selectedListId
        });
        needsDialogRefresh = true;
        if (onBookMoved) {
          await onBookMoved();
        }
      } catch (error) {
        console.error('Error moving book:', error);
      }
    }

    if (needsDialogRefresh && payload.bookId && selectedBookForDetails.value) {
      const { reviewStats, userRating, userReviewId, reviewText } = await fetchBookUserAndReviewDetails(payload.bookId);
      
      selectedBookForDetails.value.reviewStats = reviewStats;
      selectedBookForDetails.value.userRating = userRating;
      selectedBookForDetails.value.userReviewId = userReviewId;
      selectedBookForDetails.value.reviewText = reviewText;
      selectedBookForDetails.value.readingListId = payload.selectedListId;

      userRatingForSelectedBook.value = userRating;
      bookReadingListIdForSelectedBook.value = payload.selectedListId!;

      if (onBookUpdatedInList) {
        onBookUpdatedInList(selectedBookForDetails.value);
      }
    }

    showBookDetailsDialog.value = false;
  };

  async function fetchBookUserAndReviewDetails(bookId: string) {
    let reviewStats: ReviewStats | null = null;
    let userRating = 0;
    let userReviewId: string | null = null;
    let reviewText: string | null = null;

    try {
      const statsResponse = await instance.get(`/api/v1/reviews/books/${bookId}/stats`);
      reviewStats = statsResponse.data;
    } catch (statsError: any) {
      if (statsError.response && statsError.response.status !== 404) {
        console.warn(`Could not fetch review stats for book ${bookId}: ${statsError.response.status}`);
      }
    }

    try {
      const userReviewResponse = await instance.get(`/api/v1/reviews/books/${bookId}/my-review`);
      if (userReviewResponse.data) {
        userRating = userReviewResponse.data.rating || 0;
        userReviewId = userReviewResponse.data.reviewId || null;
        reviewText = userReviewResponse.data.reviewText || null;
      }
    } catch (userReviewError: any) {
      if (userReviewError.response && userReviewError.response.status !== 404) {
        console.warn(`Could not fetch user review for book ${bookId}: ${userReviewError.response.status}`);
      }
    }
    return { reviewStats, userRating, userReviewId, reviewText };
  }


  return {
    showBookDetailsDialog,
    selectedBookForDetails,
    userRatingForSelectedBook,
    bookReadingListIdForSelectedBook,
    openBookDialog, 
    handleConfirmChanges,
  };
}
