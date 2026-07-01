import { ref } from 'vue'
import { reviewService, readingListService } from '@/services/serviceFactory'
import type { Book, BookWithDetails } from '@/models/Book'
import type { ReadingList } from '@/models/ReadingList'
import type { ReviewStats } from '@/models/Review'

export function useBookDialog() {
  const showBookDetailsDialog = ref(false)
  const selectedBookForDetails = ref<BookWithDetails | null>(null)
  const userRatingForSelectedBook = ref(0)
  const bookReadingListIdForSelectedBook = ref<string | null>(null)
  const readingLists = ref<ReadingList[]>([])
  let readingListsLoaded = false

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

  const fetchAndOpenBookDialog = async (book: Book) => {
    const [listInfo, stats, myReview, lists] = await Promise.all([
      readingListService.getReadingListContainingBook(book.bookId),
      reviewService.getReviewStats(book.bookId),
      reviewService.getMyReviewForBook(book.bookId),
      readingListsLoaded
        ? readingLists.value
        : readingListService.getMyReadingLists(),
    ])

    if (!readingListsLoaded) {
      readingLists.value = lists
      readingListsLoaded = true
    }

    await openBookDialog(
      book,
      stats,
      myReview?.rating ?? 0,
      myReview?.reviewId ?? null,
      myReview?.reviewText ?? null,
      listInfo?.readingListId ?? null,
    )
  }

  const handleConfirmChanges = async (
    payload: { bookId: string; newRating?: number; selectedListId?: string | null },
    onBookUpdatedInList?: (updatedBook: BookWithDetails) => void,
    onBookMoved?: () => Promise<void>,
  ) => {
    let changed = false

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
          selectedBookForDetails.value.userRating = payload.newRating
          userRatingForSelectedBook.value = payload.newRating
        }
        changed = true
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

        if (selectedBookForDetails.value) {
          selectedBookForDetails.value.readingListId = payload.selectedListId!
        }
        bookReadingListIdForSelectedBook.value = payload.selectedListId!
        changed = true

        if (onBookMoved) {
          await onBookMoved()
        }
      } catch (error) {
        console.error('Error moving book:', error)
      }
    }

    if (changed && selectedBookForDetails.value && onBookUpdatedInList) {
      onBookUpdatedInList(selectedBookForDetails.value)
    }

    showBookDetailsDialog.value = false
  }

  return {
    showBookDetailsDialog,
    selectedBookForDetails,
    userRatingForSelectedBook,
    bookReadingListIdForSelectedBook,
    readingLists,
    openBookDialog,
    fetchAndOpenBookDialog,
    handleConfirmChanges,
  }
}
