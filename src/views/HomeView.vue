<template>
  <div class="new-releases">
    <h3>New Releases</h3>
    <p>Newly released books spanning various genres.</p>
    <swiper-container :breakpoints="swiperBreakpoints" speed="500" loop>
      <swiper-slide v-for="book in recentBooks" :key="book.bookId">
        <BookCard
          :genre="book.genre"
          :coverUrl="getCoverUrl(book, 'L')"
          :title="book.title"
          :description="book.description"
          @bookCardClicked="bookCardClicked(book)"
        />
      </swiper-slide>
    </swiper-container>
  </div>
  <div class="recommended">
    <h3>Recommended for you</h3>
    <p>Handpicked based on your reading preferences.</p>
    <swiper-container :breakpoints="swiperBreakpoints" speed="500" loop>
      <swiper-slide v-for="book in recommendedBooks" :key="book.bookId">
        <BookCard
          :genre="book.genre"
          :coverUrl="getCoverUrl(book, 'L')"
          :title="book.title"
          :description="book.description"
          @bookCardClicked="bookCardClicked(book)"
        />
      </swiper-slide>
    </swiper-container>
  </div>

  <BookDialog
    v-if="selectedBookForDetails"
    :model-value="showBookDetailsDialog"
    @update:model-value="showBookDetailsDialog = $event"
    :book="selectedBookForDetails"
    :select-options="readingLists"
    :review-stats="selectedBookForDetails?.reviewStats"
    :user-rating="userRatingForSelectedBook"
    :book-reading-list-id="bookReadingListIdForSelectedBook"
    @confirm-changes="handleConfirmChanges"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Book, BookWithDetails } from '@/models/Book'
import type { ReadingList } from '@/models/ReadingList'
import BookCard from '@/components/BookCard.vue'
import BookDialog from '@/components/BookDialog.vue'
import { getCoverUrl } from '@/utils/coverUtils'
import { useBookDialog } from '@/composables/useBookDialog'
import { bookService, readingListService, reviewService } from '@/services/serviceFactory'

const recentBooks = ref<Book[]>([])
const recommendedBooks = ref<Book[]>([])
const readingLists = ref<ReadingList[]>([])

const {
  showBookDetailsDialog,
  selectedBookForDetails,
  userRatingForSelectedBook,
  bookReadingListIdForSelectedBook,
  openBookDialog,
  handleConfirmChanges,
} = useBookDialog()

const swiperBreakpoints = {
  320: { slidesPerView: 1, spaceBetween: 10 },
  640: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 25 },
  1280: { slidesPerView: 4, spaceBetween: 25 },
}

onMounted(async () => {
  try {
    const [recent, recommended, lists] = await Promise.all([
      bookService.getNewReleases(10),
      bookService.getRecommended(6),
      readingListService.getMyReadingLists(),
    ])
    recentBooks.value = recent
    recommendedBooks.value = recommended
    readingLists.value = lists
  } catch (error) {
    console.error('Error fetching initial data for Home:', error)
  }
})

async function bookCardClicked(book: Book) {
  const [listInfo, stats, myReview] = await Promise.all([
    readingListService.getReadingListContainingBook(book.bookId),
    reviewService.getReviewStats(book.bookId),
    reviewService.getMyReviewForBook(book.bookId),
  ])

  const bookWithDetails: BookWithDetails = {
    ...book,
    reviewStats: stats,
    userRating: myReview?.rating ?? 0,
    userReviewId: myReview?.reviewId ?? null,
    reviewText: myReview?.reviewText ?? null,
    readingListId: listInfo?.readingListId ?? null,
  }

  await openBookDialog(
    bookWithDetails,
    bookWithDetails.reviewStats,
    bookWithDetails.userRating,
    bookWithDetails.userReviewId,
    bookWithDetails.reviewText,
    bookWithDetails.readingListId,
  )
}
</script>

<style scoped>
h3 {
  font-weight: bold;
}

.new-releases,
.recommended {
  padding-left: 15px;
  padding-top: 15px;
}
</style>
