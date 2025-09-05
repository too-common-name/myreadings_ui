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
import instance from '@/utils/axiosInstance'
import { useDisplay } from 'vuetify'
import type { Book } from '@/models/Book'
import type { ReadingList } from '@/models/ReadingList'
import BookCard from '@/components/BookCard.vue'
import BookDialog from '@/components/BookDialog.vue'
import { useBookDataFetcher } from '@/composables/useBookDataFetcher'
import { useBookDialog } from '@/composables/useBookDialog'
import { getCoverUrl } from '@/utils/coverUtils'

const display = useDisplay()

const searchQuery = ref('')
const searchResults = ref<Book[]>([])
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

const { fetchBookReadingList, fetchReviewStatsData, fetchMyReviewForBook } = useBookDataFetcher()

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
    const response = await instance.get('/api/v1/books/search', {
      params: {
        query: searchQuery.value,
        page: currentPage.value - 1,
        size: pageSize,
      },
    })
    totalResults.value = response.data.totalElements || 0
    totalPages.value = response.data.totalPages || 0
    searchResults.value = response.data.content || []
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

const confirmBookDialogChanges = async (payload: {
  bookId: string
  newRating?: number
  selectedListId?: string | null
}) => {
  await handleConfirmChanges(payload, (updatedBook) => {
    const index = searchResults.value.findIndex((b) => b.bookId === updatedBook.bookId)
    if (index !== -1) {
      Object.assign(searchResults.value[index], {
        userRating: updatedBook.userRating,
        reviewStats: updatedBook.reviewStats,
        readingListId: updatedBook.readingListId,
      })
    }
  })
}

onMounted(async () => {
  try {
    const listsRes = await instance.get('/api/v1/readinglists')
    readingLists.value = listsRes.data ?? []
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
