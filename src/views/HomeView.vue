<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import instance from '@/utils/axiosInstance';
import type { Book } from '@/models/Book';
import type { ReadingList } from '@/models/ReadingList';
import BookCard from '@/components/BookCard.vue';
import BookDialog from '@/components/BookDialog.vue';
import type { ReviewStats } from '@/models/ReviewStats';
import type { ReviewResponseDTO } from '@/models/ReviewResponseDTO';

const recentBooks = ref<Book[]>([]);
const recommendedBooks = ref<Book[]>([]);
const readingLists = ref<ReadingList[]>([]);
const selectedBookReviewStats = ref<ReviewStats | null>(null);
const currentUserRatingForSelectedBook = ref(0);
const currentUserReviewForSelectedBook = ref<ReviewResponseDTO | null>(null);
const readingListForSelectedBook = ref<ReadingList | null>(null);
const isDialogVisible = ref(false);
const selectedBook = ref<Book | null>(null);

const swiperBreakpoints = {
  320: { slidesPerView: 1, spaceBetween: 10 },
  640: { slidesPerView: 2, spaceBetween: 15 },
  768: { slidesPerView: 3, spaceBetween: 20 },
  1024: { slidesPerView: 4, spaceBetween: 25 },
  1280: { slidesPerView: 5, spaceBetween: 30 }
};

onMounted(async () => {
  const recentRes = await instance.get('/api/v1/books', { params: { sort: 'publicationdate', order: 'desc', limit: 10 } });
  recentBooks.value = recentRes.data ?? [];

  const recommendedRes = await instance.get('/api/v1/books', { params: { limit: 6 } });
  recommendedBooks.value = recommendedRes.data ?? [];

  const listsRes = await instance.get('/api/v1/readinglists');
  readingLists.value = listsRes.data ?? [];
});

async function fetchBookReadingList(bookId: string): Promise<ReadingList | null> {
  try {
    const res = await instance.get(`/api/v1/readinglists/books/${bookId}/in-my-list`);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchReviewStatsData(bookId: string): Promise<ReviewStats | null> {
  try {
    const res = await instance.get(`/api/v1/reviews/books/${bookId}/stats`);
    return res.data;
  } catch {
    return { bookId, totalReviews: 0, averageRating: 0 };
  }
}

async function fetchMyReviewForBook(bookId: string): Promise<ReviewResponseDTO | null> {
  try {
    const res = await instance.get(`/api/v1/reviews/books/${bookId}/my-review`);
    return res.data;
  } catch (e: any) {
    if (e.response?.status === 404) return null;
    return null;
  }
}

async function bookCardClicked(book: Book) {
  selectedBook.value = book;
  console.log(book)
  selectedBookReviewStats.value = await fetchReviewStatsData(book.bookId);
  currentUserReviewForSelectedBook.value = await fetchMyReviewForBook(book.bookId);
  readingListForSelectedBook.value = await fetchBookReadingList(book.bookId);
  currentUserRatingForSelectedBook.value = currentUserReviewForSelectedBook.value?.rating ?? 0;
  isDialogVisible.value = true;
}

const handleConfirmChanges = async ({ bookId, newRating, selectedListId }: { bookId: string, newRating?: number, selectedListId?: string }) => {
  if (newRating !== undefined) {
    try {
      const payload = {
        bookId,
        rating: newRating,
        reviewText: currentUserReviewForSelectedBook.value?.reviewText ?? null
      };
      if (currentUserReviewForSelectedBook.value) {
        const reviewId = currentUserReviewForSelectedBook.value.reviewId;
        const res = await instance.put(`/api/v1/reviews/${reviewId}`, payload);
        currentUserReviewForSelectedBook.value = res.data;
      } else {
        const res = await instance.post('/api/v1/reviews', payload);
        currentUserReviewForSelectedBook.value = res.data;
      }
      currentUserRatingForSelectedBook.value = newRating;
      selectedBookReviewStats.value = await fetchReviewStatsData(bookId);
    } catch { }
  }
  if (selectedListId !== undefined) {
    try {
      if (readingListForSelectedBook.value) {
        await instance.put(`/api/v1/readinglists/books/${bookId}/move`, {sourceListId: readingListForSelectedBook.value.readingListId,targetListId: selectedListId})
      } else {
        await instance.post(`/api/v1/readinglists/${selectedListId}/books`, { bookId });
        readingListForSelectedBook.value = readingLists.value.find(l => l.readingListId === selectedListId) ?? null;
      }
    } catch { }
  }
};
</script>

<template>
  <div class="new-releases">
    <h3>New Releases</h3>
    <p>Newly released books spanning various genres.</p>
    <swiper-container :breakpoints="swiperBreakpoints" speed="500" loop>
      <swiper-slide v-for="book in recentBooks" :key="book.bookId">
        <BookCard :genre="book.genre" :coverUrl="'https://covers.openlibrary.org/b/isbn/' + book.isbn + '-L.jpg'"
          :title="book.title" :description="book.description" @bookCardClicked="bookCardClicked(book)" />
      </swiper-slide>
    </swiper-container>
  </div>
  <div class="recommended">
    <h3>Recommended for you</h3>
    <p>Handpicked based on your reading preferences.</p>
    <swiper-container :breakpoints="swiperBreakpoints" speed="500" loop>
      <swiper-slide v-for="book in recommendedBooks" :key="book.bookId">
        <BookCard :genre="book.genre" :coverUrl="'https://covers.openlibrary.org/b/isbn/' + book.isbn + '-L.jpg'"
          :title="book.title" :description="book.description" @bookCardClicked="bookCardClicked(book)" />
      </swiper-slide>
    </swiper-container>
  </div>
  <BookDialog v-if="selectedBook && isDialogVisible" v-model="isDialogVisible" :book="selectedBook"
    :selectOptions="readingLists" :reviewStats="selectedBookReviewStats" :user-rating="currentUserRatingForSelectedBook"
    :bookReadingListId="readingListForSelectedBook?.readingListId ?? null" @confirm-changes="handleConfirmChanges" />
</template>

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
