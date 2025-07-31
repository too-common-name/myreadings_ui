<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)"
    :fullscreen="display.xs.value" max-width="800px">
    <v-card v-if="book" class="d-flex flex-column h-100 book-details-card">
      <v-toolbar color="primary" dark v-if="display.xs.value">
        <v-btn icon dark @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ book.title }}</v-toolbar-title>
        <v-btn icon dark @click="handleConfirm">
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-title v-else class="headline grey lighten-2" primary-title>
        Book details
      </v-card-title>
      
      <v-card-text class="flex-grow-1 book-details-content-scroll" v-if="display.xs.value">
        <v-container fluid>
          <v-row>
            <v-col cols="12" class="d-flex flex-column align-center">
              <v-img :src="coverUrl" :alt="book.title" aspect-ratio="2/3" contain
                class="mb-4 rounded elevation-2 book-cover" />
              <h3 class="text-h5 text-center font-weight-bold mb-2">{{ book.title }}</h3> 
              <p class="text-subtitle-1 text-center mb-2">{{ book.publisher || 'N/A' }}</p>  
              <div class="d-flex align-center justify-center mb-4">
                <v-rating :model-value="reviewStats?.averageRating ?? 0" length="5" size="24" active-color="primary"
                  readonly half-increments density="compact" />
                <span class="text-body-2 ms-2">
                  ({{ reviewStats?.averageRating?.toFixed(1) || 'N/A' }})
                </span>
                <span class="text-body-2 ms-2 text-subtitle-2 text-grey-darken-2">
                  ({{ reviewStats?.totalReviews }} reviews)
                </span>
              </div>
              <ReadingListSelectBox
                :items="selectOptions"
                v-model="selectedReadingListId"
                class="mb-4 w-75"
                item-title="name"
                item-value="readingListId"
              />
              <div class="d-flex align-center justify-center mb-4">
                <v-rating :model-value="rating" @update:model-value="handleRatingChange" length="5" size="32" hover
                  active-color="primary" />
              </div>
              <p class="text-body-2 font-weight-bold mb-4 align-self-baseline" style="white-space: pre-wrap;">
                {{ book.description || 'No description available.' }}
              </p>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1 align-self-baseline">Genre: {{ book.genre || 'N/A' }}</p>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1 align-self-baseline">{{ book.pageCount || 'N/A' }} pages</p>
              <p class="text-subtitle-2 text-grey-darken-2 align-self-baseline">First published on {{ formattedPublicationDate }}</p>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      
      <v-card-text class="flex-grow-1 book-details-content-scroll" v-else>
        <v-container fluid>
          <v-row>
            <v-col cols="12" md="5" class="d-flex flex-column align-center">
              <v-img :src="coverUrl" :alt="book.title" aspect-ratio="2/3" contain
                class="mb-4 rounded elevation-2 book-cover" />
              <ReadingListSelectBox
                :items="selectOptions"
                v-model="selectedReadingListId"
                class="mb-4 w-100"
                item-title="name"
                item-value="readingListId"
              />
              <div class="d-flex flex-column align-center justify-center mb-4">
                <p class="text-subtitle-2 text-grey-darken-2">Rate the book:</p>
                <v-rating :model-value="rating" @update:model-value="handleRatingChange" length="5" size="32" hover
                  active-color="primary" />
              </div>
            </v-col>
            <v-col cols="12" md="7">
              <h3 class="text-h5 font-weight-bold mb-2">{{ book.title }}</h3>
              <p class="text-subtitle-1 mb-2">{{ book.publisher || 'N/A' }}</p>
              <div class="d-flex align-center mb-4">
                <v-rating :model-value="reviewStats?.averageRating ?? 0" length="5" size="24" active-color="primary"
                  readonly half-increments density="compact" />
                <span class="text-body-2 ms-2">
                  ({{ reviewStats?.averageRating?.toFixed(1) || 'N/A' }})
                </span>
                <span class="text-body-2 ms-2 text-subtitle-2 text-grey-darken-2">
                  ({{ reviewStats?.totalReviews }} reviews)
                </span>
              </div>
              <p class="text-body-2 font-weight-bold mb-4" style="white-space: pre-wrap;">
                {{ book.description || 'No description available.' }}
              </p>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1">Genre: {{ book.genre || 'N/A' }}</p>
              <p class="text-subtitle-2 text-grey-darken-2 mb-1">{{ book.pageCount || 'N/A' }} pages</p>
              <p class="text-subtitle-2 text-grey-darken-2">First published on {{ formattedPublicationDate }}</p>
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

watch(() => props.userRating, (newValue) => {
  rating.value = newValue;
});

watch(() => props.bookReadingListId, (newValue) => {
  selectedReadingListId.value = newValue;
});

watch(() => props.book, (newBook) => {
  if (newBook) {
    rating.value = props.userRating;
    selectedReadingListId.value = props.bookReadingListId;
  }
}, { immediate: true });


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
.v-dialog>.v-overlay__content>.v-card {
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


.book-cover {
  width: 100%; 
  max-width: 250px; 
  margin: 0 auto; 
}


@media (min-width: 960px) {
  .book-details-card .v-card-text .v-container {
    padding: 24px; 
  }

  .book-cover {
    max-width: 200px; 
  }

  
  .v-col.d-flex.flex-column.align-center {
    text-align: center; 
  }

  .v-card-text h3 {
    text-align: left; 
  }

  .v-card-text p.text-subtitle-1 {
    text-align: left; 
  }

  .v-card-text .d-flex.align-center {
    justify-content: flex-start; 
  }

  .v-card-text p.text-body-2.text-center {
    text-align: left; 
  }
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
