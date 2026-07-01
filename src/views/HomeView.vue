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
          @bookCardClicked="fetchAndOpenBookDialog(book)"
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
          @bookCardClicked="fetchAndOpenBookDialog(book)"
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
import type { Book } from '@/models/Book'
import BookCard from '@/components/BookCard.vue'
import BookDialog from '@/components/BookDialog.vue'
import { getCoverUrl } from '@/utils/coverUtils'
import { useBookDialog } from '@/composables/useBookDialog'
import { bookService } from '@/services/serviceFactory'

const recentBooks = ref<Book[]>([])
const recommendedBooks = ref<Book[]>([])

const {
  showBookDetailsDialog,
  selectedBookForDetails,
  userRatingForSelectedBook,
  bookReadingListIdForSelectedBook,
  readingLists,
  fetchAndOpenBookDialog,
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
    const [recent, recommended] = await Promise.all([
      bookService.getNewReleases(10),
      bookService.getRecommended(6),
    ])
    recentBooks.value = recent
    recommendedBooks.value = recommended
  } catch (error) {
    console.error('Error fetching initial data for Home:', error)
  }
})
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
