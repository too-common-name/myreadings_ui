<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"
    :fullscreen="display.xs.value" max-width="700px">
    <v-card v-if="book" class="d-flex flex-column h-100 book-details-card">
      
      <!-- Toolbar for mobile -->
      <v-toolbar color="primary" dark v-if="display.xs.value">
        <v-btn icon dark @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ book.title }}</v-toolbar-title>
        <v-btn icon dark @click="handleConfirm">
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Title for desktop -->
      <v-card-title v-else class="headline grey lighten-2" primary-title>
        {{ book.title }}
      </v-card-title>

      <v-card-text class="flex-grow-1 book-details-content-scroll">
        <v-container>
          <v-row>
            <v-col cols="12" :md="display.xs.value ? 12 : 4">
              <v-img :src="coverUrl" :alt="book.title" aspect-ratio="2/3" contain
                class="mb-4 rounded elevation-2 mx-auto" />
            </v-col>
            <v-col cols="12" :md="display.xs.value ? 12 : 8">
              <p class="text-body-2 mb-2"><strong>Genre:</strong> {{ book.genre || 'N/A' }}</p>
              <p class="text-body-2 mb-2"><strong>Publisher:</strong> {{ book.publisher || 'N/A' }}</p>
              <p class="text-body-2 mb-2"><strong>Publication Date:</strong> {{ formattedPublicationDate }}</p>
              <p class="text-body-2 mb-2"><strong>ISBN:</strong> {{ book.isbn || 'N/A' }}</p>
              <p class="text-body-2 mb-2"><strong>Pages:</strong> {{ book.pageCount || 'N/A' }}</p>
              <p class="text-body-2 mb-2"><strong>Original Language:</strong> {{ book.originalLanguage || 'N/A' }}</p>

              <div class="mt-4">
                <p class="text-body-2 mb-1"><strong>Description:</strong></p>
                <p class="text-body-2" style="white-space: pre-wrap;">
                  {{ book.description || 'No description available.' }}
                </p>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12">
              <h4 class="mb-2">Reviews Overview</h4>
              <div class="d-flex align-center">
                <p class="text-body-2 mb-0 me-2">Average Rating:</p>
                <v-rating
                  :model-value="reviewStats?.averageRating ?? 0"
                  length="5"
                  size="24"
                  active-color="primary"
                  readonly
                  half-increments
                  density="compact"
                />
                <span class="text-body-2 ms-2">
                  ({{ reviewStats?.averageRating?.toFixed(1) || 'N/A' }})
                </span>
              </div>
              <p class="text-body-2">Total reviews: {{ reviewStats?.totalReviews }}</p>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row justify="center">
            <v-col cols="12" md="6" class="selection-container">
              <ReadingListSelectBox :items="selectOptions" v-model="selectedReadingListId" />
            </v-col>
            <v-col cols="12" md="6" class="rate-container">
              <h4 class="mb-2">Rate this Book</h4>
              <v-rating
                :model-value="rating"
                @update:model-value="handleRatingChange"
                length="5"
                size="32"
                hover
                active-color="primary"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions v-if="!display.xs.value">
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="handleConfirm">Confirm</v-btn>
        <v-btn color="primary" text @click="handleClose">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDisplay } from 'vuetify';
import type { Book } from '@/models/Book';
import type { ReadingList } from '@/models/ReadingList';
import type { ReviewStats } from '@/models/ReviewStats';
import ReadingListSelectBox from './ReadingListSelectBox.vue';

const props = defineProps({
  modelValue: Boolean,
  book: Object as () => Book | null,
  selectOptions: Array as () => ReadingList[],
  reviewStats: Object as () => ReviewStats | null,
  userRating: {
    type: Number,
    default: 0
  },
  bookReadingListId: {
    type: String as () => string | null,
    default: null
  }
});

const emit = defineEmits([
  'update:modelValue',
  'confirm-changes'
]);

const display = useDisplay();


const rating = ref<number>(props.userRating);
const selectedReadingListId = ref<string | null>(props.bookReadingListId);


const coverUrl = computed(() => {
  if (props.book?.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${props.book.isbn}-L.jpg`;
  } else if (props.book?.coverImageId) {
    return `https://covers.openlibrary.org/b/id/${props.book.coverImageId}-L.jpg`;
  }
  return 'https://via.placeholder.com/300x450.png?text=No+Cover';
});


const formattedPublicationDate = computed(() => {
  if (!props.book?.publicationDate) return 'N/A';
  try {
    return new Date(props.book.publicationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return props.book.publicationDate;
  }
});

const handleRatingChange = (val: string | number) => {
  rating.value = typeof val === 'string' ? parseInt(val, 10) : val;
};

const handleClose = () => {
  emit('update:modelValue', false);
};

const handleConfirm = () => {
  if (!props.book) {
    emit('update:modelValue', false);
    return;
  }

  emit('confirm-changes', {
    bookId: props.book.bookId,
    newRating: rating.value !== props.userRating ? rating.value : undefined,
    selectedListId: selectedReadingListId.value !== props.bookReadingListId ? selectedReadingListId.value : undefined
  });

  emit('update:modelValue', false);
};
</script>

<style scoped>
.v-dialog > .v-overlay__content > .v-card {
  overflow-y: hidden;
}

.book-details-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.book-details-content-scroll {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
}

.book-details-content-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.headline {
  font-size: 1.25rem;
  padding-top: 12px;
  padding-bottom: 12px;
}

.v-card-text h3 {
  margin-top: 0;
  font-size: 1.75rem;
  line-height: 1.3;
}

.v-card-text h4 {
  font-size: 1.15rem;
  font-weight: 500;
}

.text-body-2 strong {
  font-weight: bold;
}

.v-dialog--fullscreen .v-card-text {
  padding-top: 16px;
}

.selection-container {
  padding-bottom: 0px;
}

.rate-container {
  padding-top: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
