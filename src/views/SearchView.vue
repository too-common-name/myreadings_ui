<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
          v-model="searchQuery"
          label="Search for books..."
          append-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          @click:append-inner="performSearch"
          @keyup.enter="performSearch"
          @click:clear="clearSearch"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row v-if="loadingResults" class="justify-center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-2">Loading search results...</p>
      </v-col>
    </v-row>

    <v-row v-else-if="searchResults.length === 0 && hasSearched">
      <v-col cols="12" class="text-center">
        <v-alert type="info" variant="tonal" class="mx-auto" max-width="400">
          No books found matching your search.
        </v-alert>
      </v-col>
    </v-row>

    <v-row v-else-if="searchResults.length > 0">
      <v-col v-if="!display.xs.value" cols="12">
        <v-row>
          <v-col
            v-for="book in searchResults"
            :key="book.bookId"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="d-flex flex-column"
          >
            <BookCard
              :genre="book.genre"
              :coverUrl="getCoverUrl(book, 'L')"
              :title="book.title"
              :description="book.description"
              @bookCardClicked="handleBookClick(book)"
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col v-else cols="12">
        <v-list>
          <template v-for="(book, index) in searchResults" :key="book.bookId">
            <v-list-item @click="handleBookClick(book)" link>
              <template v-slot:prepend>
                <v-img
                  :src="getCoverUrl(book, 'M')"
                  :alt="book.title"
                  width="60"
                  height="90"
                  aspect-ratio="2/3"
                  contain
                  class="rounded mr-4"
                ></v-img>
              </template>
              <v-list-item>
                <v-list-item-title class="font-weight-bold">{{ book.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ book.publisher || 'N/A' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list-item>
            <v-divider v-if="index < searchResults.length - 1"></v-divider>
          </template>
        </v-list>
      </v-col>
    </v-row>

    <v-row v-if="totalPages > 1" class="mt-4">
      <v-col cols="12" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="display.xs.value ? 5 : 7"
          rounded="circle"
          color="primary"
          @update:model-value="onPageChange"
        ></v-pagination>
      </v-col>
    </v-row>

    <BookDialog
      :model-value="showBookDetailsDialog"
      @update:model-value="showBookDetailsDialog = $event"
      :book="selectedBookForDetails"
      :select-options="readingLists"
      :review-stats="selectedBookForDetails?.reviewStats"
      :user-rating="userRatingForSelectedBook"
      :book-reading-list-id="bookReadingListIdForSelectedBook"
      @confirm-changes="confirmBookDialogChanges"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDisplay } from 'vuetify'
import type { Book, BookWithDetails } from '@/models/Book'
import type { ReadingList } from '@/models/ReadingList'
import BookCard from '@/components/BookCard.vue'
import BookDialog from '@/components/BookDialog.vue'
import { useBookDialog } from '@/composables/useBookDialog'
import { getCoverUrl } from '@/utils/coverUtils'
import { bookService, readingListService, reviewService } from '@/services/serviceFactory'

const display = useDisplay()

const searchQuery = ref('')
const searchResults = ref<Book[]>([]) // Correct type is Book[]
const loadingResults = ref(false)
const hasSearched = ref(false)

const currentPage = ref(1)
const pageSize = 12
const totalResults = ref(0)
const totalPages = ref(0)

const readingLists = ref<ReadingList[]>([])

const {
  showBookDetailsDialog,
  selectedBookForDetails,
  userRatingForSelectedBook,
  bookReadingListIdForSelectedBook,
  openBookDialog,
  handleConfirmChanges,
} = useBookDialog()

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    hasSearched.value = false
    totalResults.value = 0
    totalPages.value = 0
    return
  }
  loadingResults.value = true
  hasSearched.value = true
  try {
    const response = await bookService.searchBooks(
      searchQuery.value,
      currentPage.value - 1,
      pageSize,
    )
    totalResults.value = response.totalElements || 0
    totalPages.value = response.totalPages || 0
    searchResults.value = response.content || [] // This is correct (assigns Book[])
  } catch (error) {
    console.error('Error fetching search results:', error)
    searchResults.value = []
    totalResults.value = 0
    totalPages.value = 0
  } finally {
    loadingResults.value = false
  }
}

const onPageChange = (newPage: number) => {
  currentPage.value = newPage
  performSearch()
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  hasSearched.value = false
  currentPage.value = 1
  totalResults.value = 0
  totalPages.value = 0
}

async function handleBookClick(book: Book) {
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

const confirmBookDialogChanges = async (payload: {
  bookId: string
  newRating?: number
  selectedListId?: string | null
}) => {
  await handleConfirmChanges(payload, () => {})
}

onMounted(async () => {
  try {
    readingLists.value = await readingListService.getMyReadingLists()
  } catch (error) {
    console.error('Error fetching reading lists for BookDialog:', error)
  }
})

watch(searchQuery, (newQuery, oldQuery) => {
  if (newQuery.trim() !== oldQuery.trim()) {
    currentPage.value = 1
  }
})
</script>
<style scoped>
.v-text-field {
  max-width: 600px;
  margin: 0 auto;
}

.v-list-item-content {
  flex-grow: 1;
}

.v-list-item-title {
  white-space: normal;
  line-height: 1.2;
}

.v-list-item-subtitle {
  white-space: normal;
}
</style>
