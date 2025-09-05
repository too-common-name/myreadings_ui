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
import instance from '@/utils/axiosInstance'
import type { Book } from '@/models/Book'
import type { ReadingList } from '@/models/ReadingList'
import BookCard from '@/components/BookCard.vue'
import BookDialog from '@/components/BookDialog.vue'
import { getCoverUrl } from '@/utils/coverUtils' // Importa la funzione generalizzata
import { useBookDialog } from '@/composables/useBookDialog'
import { useBookDataFetcher } from '@/composables/useBookDataFetcher'

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

const { fetchBookReadingList, fetchReviewStatsData, fetchMyReviewForBook } = useBookDataFetcher()

const swiperBreakpoints = {
  320: { slidesPerView: 1, spaceBetween: 10 },
  640: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 25 },
  1280: { slidesPerView: 4, spaceBetween: 25 },
}

onMounted(async () => {
  try {
    const recentRes = await instance.get('/api/v1/books', {
      params: { sort: 'publicationdate', order: 'desc', limit: 10 },
    })
    recentBooks.value = recentRes.data ?? []

    const recommendedRes = await instance.get('/api/v1/books', { params: { limit: 6 } })
    recommendedBooks.value = recommendedRes.data ?? []

    const listsRes = await instance.get('/api/v1/readinglists')
    readingLists.value = listsRes.data ?? []
  } catch (error) {
    console.error('Error fetching initial data for Home:', error)
  }
})

async function bookCardClicked(book: Book) {
  const [readingList, reviewStats, myReview] = await Promise.all([
    fetchBookReadingList(book.bookId),
    fetchReviewStatsData(book.bookId),
    fetchMyReviewForBook(book.bookId),
  ])

  const currentReadingListId = readingList?.readingListId || null
  const fetchedReviewStats = reviewStats
  const fetchedUserRating = myReview?.rating ?? 0
  const fetchedUserReviewId = myReview?.reviewId ?? null
  const fetchedReviewText = myReview?.reviewText ?? null

  await openBookDialog(
    book,
    fetchedReviewStats,
    fetchedUserRating,
    fetchedUserReviewId,
    fetchedReviewText,
    currentReadingListId,
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
