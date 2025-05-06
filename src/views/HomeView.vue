<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getToken } from '@josempgon/vue-keycloak';
import instance from '@/utils/axiosInstance';
import type { Book } from '@/models/Book';
import BookCard from '@/components/BookCard.vue';
import BookDialog from '@/components/BookDialog.vue'

const recentBooks = ref<Book[]>([]);
const recommendedBooks = ref<Book[]>([]);
const swiperBreakpoints = {
  320: {
    slidesPerView: 1,
    spaceBetween: 10
  },
  640: {
    slidesPerView: 2,
    spaceBetween: 15
  },
  768: {
    slidesPerView: 3,
    spaceBetween: 20
  },
  1024: {
    slidesPerView: 4,
    spaceBetween: 25
  },
  1280: {
    slidesPerView: 5,
    spaceBetween: 30
  }
};
const isDialogVisible = ref(false);
const selectedBook = ref<Book | null>(null);

onMounted(async () => {

  const recentBooksResponse = await instance.get('/api/v1/books', {
    params: {
      sort: 'publicationdate',
      order: 'desc',
      limit: 10
    }
  });

  if (recentBooksResponse.data) {
    recentBooks.value = recentBooksResponse.data;
  } else {
    console.error('Failed to fetch user reviews');
  }

  const recommendedBooksResponse = await instance.get('/api/v1/books', {
    params: {
      limit: 6
    }
  });

  if (recommendedBooksResponse.data) {
    recommendedBooks.value = recommendedBooksResponse.data;
  } else {
    console.error('Failed to fetch user reviews');
  }
});

function bookCardClicked(book: Book) {
  selectedBook.value = book;
  isDialogVisible.value = true;
}
</script>

<template>
  <div class="new-releases">
    <h3>New Releases</h3>
    <p>Newly released books spanning various genres.</p>
    <swiper-container :breakpoints="swiperBreakpoints" speed="500" loop="true">
      <swiper-slide v-for="book in recentBooks" :key="book.bookId">
        <BookCard :genre="book.genre" :coverUrl="'https://covers.openlibrary.org/b/isbn/' + book.isbn + '-L.jpg'"
          :title="book.title" :description="book.description" @bookCardClicked="bookCardClicked(book)" />
      </swiper-slide>
    </swiper-container>
  </div>
  <div class="recommended">
    <h3>Recommended for you</h3>
    <p>Handpicked based on your reading preferences.</p>
    <swiper-container :breakpoints="swiperBreakpoints" speed="500" loop="true">
      <swiper-slide v-for="book in recommendedBooks" :key="book.bookId">
        <BookCard :genre="book.genre" :coverUrl="'https://covers.openlibrary.org/b/isbn/' + book.isbn + '-L.jpg'"
          :title="book.title" :description="book.description" @bookCardClicked="bookCardClicked(book)" />
      </swiper-slide>
    </swiper-container>
  </div>
  <BookDialog v-model="isDialogVisible" :book="selectedBook" />
</template>

<style scoped>
h3 {
  font-weight: bold;
}

.new-releases {
  padding-left: 15px;
  padding-top: 15px;
}

.recommended {
  padding-left: 15px;
  padding-top: 15px;
}
</style>