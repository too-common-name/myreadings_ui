<template>
  <v-container fluid class="pa-4">
    <v-row class="justify-center">
      <v-col cols="12" md="10" lg="8">
        <v-row>
          <v-col cols="12" md="5">
            <div class="text-center mb-4">
              <v-avatar size="120" color="primary" class="mb-2 elevation-4">
                <span class="text-h4 text-white initials-container">
                  <span class="initial-letter letter-1">{{ userInitials.charAt(0) }}</span>
                  <span class="initial-letter letter-2">{{ userInitials.charAt(1) }}</span>
                </span>
              </v-avatar>
              <h2 class="text-h5 font-weight-bold mb-2 text-center">
                {{ user?.firstName }} {{ user?.lastName }}
              </h2>
              <p class="text-body-2 text-grey-darken-1 text-center">
                Username: {{ user?.username }}
              </p>
              <p class="text-body-2 text-grey-darken-1 text-center">E-mail: {{ user?.email }}</p>
            </div>
          </v-col>

          <v-col cols="12" md="7">
            <v-progress-linear
              v-if="loadingUser"
              indeterminate
              color="primary"
              class="mb-4"
            ></v-progress-linear>
            <v-alert
              v-if="errorFetchingUser && !loadingUser"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              Failed to load user data. Please try again.
            </v-alert>

            <h2 class="text-h6 font-weight-bold mb-2">My Bookshelves</h2>
            <v-progress-linear
              v-if="loadingReadingLists"
              indeterminate
              color="primary"
              class="mb-4"
            ></v-progress-linear>
            <v-alert
              v-if="errorFetchingReadingLists && !loadingReadingLists"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              Failed to load reading lists.
            </v-alert>
            <v-list v-if="readingLists.length > 0 && !loadingReadingLists" nav class="profile-list">
              <v-list-item v-for="list in readingLists" :key="list.readingListId">
                <v-list-item-title class="font-weight-medium">{{ list.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ list.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else-if="!loadingReadingLists" class="text-center text-body-2 text-grey-darken-1">
              No reading lists found.
            </p>

            <v-divider class="my-4"></v-divider>
            <h2 class="text-h6 font-weight-bold mb-2">My Recent Reviews</h2>

            <v-progress-linear
              v-if="loadingReviews"
              indeterminate
              color="primary"
              class="mb-4"
            ></v-progress-linear>

            <v-alert
              v-if="errorFetchingReviews && !loadingReviews"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              Failed to load reviews.
            </v-alert>

            <v-list v-if="recentReviews.length > 0 && !loadingReviews" class="profile-list">
              <v-list-item v-for="review in recentReviews" :key="review.reviewId">
                <v-list-item-title class="font-weight-medium">{{
                  review.bookTitle
                }}</v-list-item-title>
                <v-list-item-subtitle>
                  Rated:
                  <v-rating
                    :model-value="review.rating"
                    length="5"
                    size="16"
                    active-color="primary"
                    readonly
                    density="compact"
                  />
                  <span class="ms-2">({{ review.rating }})</span>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else-if="!loadingReviews" class="text-center text-body-2 text-grey-darken-1">
              No recent reviews found.
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useKeycloak } from '@josempgon/vue-keycloak'
import type { User } from '@/models/User'
import type { ReadingList } from '@/models/ReadingList'
import type { ReviewWithBookTitle } from '@/models/Review'
import { userService, reviewService, readingListService, bookService } from '@/services/serviceFactory'

const { keycloak } = useKeycloak()

const user = ref<User | null>(null)
const loadingUser = ref(false)
const errorFetchingUser = ref(false)

const recentReviews = ref<ReviewWithBookTitle[]>([])
const loadingReviews = ref(false)
const errorFetchingReviews = ref(false)

const readingLists = ref<ReadingList[]>([])
const loadingReadingLists = ref(false)
const errorFetchingReadingLists = ref(false)

const currentUserId = computed(() => keycloak.value?.subject)

const userInitials = computed(() => {
  if (user.value) {
    const firstInitial = user.value.firstName ? user.value.firstName.charAt(0).toUpperCase() : ''
    const lastInitial = user.value.lastName ? user.value.lastName.charAt(0).toUpperCase() : ''
    return `${firstInitial}${lastInitial}`
  }
  return ''
})

const fetchUserData = async () => {
  if (!currentUserId.value) return
  loadingUser.value = true
  errorFetchingUser.value = false
  try {
    user.value = await userService.getUserProfile(currentUserId.value)
  } catch (error) {
    console.error('Error fetching user data:', error)
    errorFetchingUser.value = true
  } finally {
    loadingUser.value = false
  }
}

const fetchRecentReviews = async () => {
  if (!currentUserId.value) return
  loadingReviews.value = true
  errorFetchingReviews.value = false
  try {
    const reviewsData = await reviewService.getReviewsByUser(currentUserId.value)
    
    const sortedReviews = [...reviewsData].sort(
      (a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime()
    )
    const topReviews = sortedReviews.slice(0, 5)

    const reviewsWithDetailsPromises = topReviews.map(async (review) => {
      const bookInfo = await bookService.getBookById(review.bookId)
      return {
        reviewId: review.reviewId,
        bookId: review.bookId,
        bookTitle: bookInfo?.title ?? 'Unknown Book',
        rating: review.rating,
        publicationDate: review.publicationDate,
      }
    })

    recentReviews.value = await Promise.all(reviewsWithDetailsPromises)
  } catch (error) {
    console.error('Error fetching recent reviews:', error)
    errorFetchingReviews.value = true
    recentReviews.value = []
  } finally {
    loadingReviews.value = false
  }
}

const fetchReadingListsForProfile = async () => {
  loadingReadingLists.value = true
  errorFetchingReadingLists.value = false
  try {
    readingLists.value = await readingListService.getMyReadingLists()
  } catch (error) {
    console.error('Error fetching reading lists for ProfileView:', error)
    errorFetchingReadingLists.value = true
  } finally {
    loadingReadingLists.value = false
  }
}

onMounted(() => {
  if (currentUserId.value) {
    fetchUserData()
    fetchRecentReviews()
    fetchReadingListsForProfile()
  } else {
    console.warn('User ID not available on mount.')
    errorFetchingUser.value = true
    errorFetchingReviews.value = true
    errorFetchingReadingLists.value = true
  }
})
</script>

<style scoped>
.initials-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.initial-letter {
  display: inline-block;
  position: relative;
}

.initial-letter.letter-1 {
  animation: bounce-with-pause 5s infinite;
}

@keyframes bounce-with-pause {
  0% {
    transform: translateY(0);
  }

  2% {
    transform: translateY(-10px);
  }

  4% {
    transform: translateY(0);
  }

  6% {
    transform: translateY(-5px);
  }

  8% {
    transform: translateY(0);
  }

  20% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(0);
  }
}

.initial-letter.letter-2 {
  animation: none;
}

@media (min-width: 960px) {
  .v-col.md-12 > h2:first-of-type {
    margin-top: 0;
  }

  .v-col.md-12 > .mb-6 {
    margin-bottom: 24px !important;
  }
}
</style>
