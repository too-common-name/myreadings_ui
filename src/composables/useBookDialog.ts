import { ref } from 'vue'
import { reviewService, readingListService } from '@/services/serviceFactory'
import type { Book, BookWithDetails } from '@/models/Book'
import type { ReviewStats } from '@/models/Review'

export function useBookDialog() {
  const showBookDetailsDialog = ref(false)
  const selectedBookForDetails = ref<BookWithDetails | null>(null)
  const userRatingForSelectedBook = ref(0)
  const bookReadingListIdForSelectedBook = ref<string | null>(null)

  const openBookDialog = async (
    bookBaseInfo: Book,
    fetchedReviewStats: ReviewStats | null,
    fetchedUserRating: number,
    fetchedUserReviewId: string | null,
    fetchedReviewText: string | null,
    currentReadingListId: string | null,
  ) => {
    selectedBookForDetails.value = {
      ...bookBaseInfo,
      reviewStats: fetchedReviewStats,
      userRating: fetchedUserRating,
      readingListId: currentReadingListId,
      userReviewId: fetchedUserReviewId,
      reviewText: fetchedReviewText,
    } as BookWithDetails

    userRatingForSelectedBook.value = fetchedUserRating
    bookReadingListIdForSelectedBook.value = currentReadingListId
    showBookDetailsDialog.value = true
  }

  const handleConfirmChanges = async (
    payload: { bookId: string; newRating?: number; selectedListId?: string | null },
    onBookUpdatedInList?: (updatedBook: BookWithDetails) => void,
    onBookMoved?: () => Promise<void>,
  ) => {
    let needsDialogRefresh = false

    if (payload.newRating !== undefined && payload.newRating !== userRatingForSelectedBook.value) {
      try {
        const newReview = await reviewService.createOrUpdateReview({
          bookId: payload.bookId,
          rating: payload.newRating,
          reviewText: selectedBookForDetails.value?.reviewText ?? undefined,
          reviewId: selectedBookForDetails.value?.userReviewId ?? null,
        })

        if (selectedBookForDetails.value) {
          selectedBookForDetails.value.userReviewId = newReview.reviewId
        }
        needsDialogRefresh = true
      } catch (error) {
        console.error('Error updating/creating rating:', error)
      }
    }

    if (
      payload.selectedListId !== undefined &&
      payload.selectedListId !== bookReadingListIdForSelectedBook.value
    ) {
      try {
        if (bookReadingListIdForSelectedBook.value) {
          await readingListService.moveBookBetweenReadingLists(
            payload.bookId,
            bookReadingListIdForSelectedBook.value,
            payload.selectedListId!,
          ) 
        } else {
          await readingListService.addBookToReadingList(payload.selectedListId!, payload.bookId)
        }
        needsDialogRefresh = true
        if (onBookMoved) {
          await onBookMoved()
        }
      } catch (error) {
        console.error('Error moving book:', error)
      }
    }

    if (needsDialogRefresh && payload.bookId && selectedBookForDetails.value) {
      const { reviewStats, userRating, userReviewId, reviewText } =
        await fetchBookUserAndReviewDetails(payload.bookId)

      selectedBookForDetails.value.reviewStats = reviewStats
      selectedBookForDetails.value.userRating = userRating
      selectedBookForDetails.value.userReviewId = userReviewId
      selectedBookForDetails.value.reviewText = reviewText
      selectedBookForDetails.value.readingListId = payload.selectedListId!

      userRatingForSelectedBook.value = userRating
      bookReadingListIdForSelectedBook.value = payload.selectedListId!

      if (onBookUpdatedInList) {
        onBookUpdatedInList(selectedBookForDetails.value)
      }
    }

    showBookDetailsDialog.value = false
  }

  async function fetchBookUserAndReviewDetails(bookId: string) {
    let reviewStats: ReviewStats | null = null
    let userRating = 0
    let userReviewId: string | null = null
    let reviewText: string | null = null

try {
      const [stats, myReview] = await Promise.all([
        reviewService.getReviewStats(bookId),
        reviewService.getMyReviewForBook(bookId),
      ])

      reviewStats = stats
      if (myReview) {
        userRating = myReview.rating || 0
        userReviewId = myReview.reviewId || null
        reviewText = myReview.reviewText || null
      }
    } catch (error) {
      console.warn(`Could not fetch review details for book ${bookId}:`, error)
    }
    
    return { reviewStats, userRating, userReviewId, reviewText }
  }

  return {
    showBookDetailsDialog,
    selectedBookForDetails,
    userRatingForSelectedBook,
    bookReadingListIdForSelectedBook,
    openBookDialog,
    handleConfirmChanges,
  }
}
