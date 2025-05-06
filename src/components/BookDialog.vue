
<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :fullscreen="display.xs.value" max-width="700px"          scrollable
    transition="dialog-bottom-transition" >
    <v-card v-if="book">
      <v-toolbar color="primary" dark v-if="display.xs.value">
        <v-btn icon dark @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ book.title }}</v-toolbar-title>
      </v-toolbar>
      
      <v-card-title v-else class="headline grey lighten-2" primary-title>
        Book Details
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" :md="display.xs.value ? 12 : 4"> <v-img
                :src="coverUrl"
                :alt="book.title"
                aspect-ratio="2/3"
                contain
                class="mb-4 rounded elevation-2 mx-auto"
                :max-width="display.xs.value ? '250px' : undefined" ></v-img>
            </v-col>
            <v-col cols="12" :md="display.xs.value ? 12 : 8">
              <h3 class="mb-2" v-if="!display.xs.value">{{ book.title }}</h3> <p class="text-body-2 mb-3">
                <strong>Genre:</strong> {{ book.genre || 'N/A' }}
              </p>
              <p class="text-body-2 mb-3">
                <strong>Publisher:</strong> {{ book.publisher || 'N/A' }}
              </p>
              <p class="text-body-2 mb-3">
                <strong>Publication Date:</strong> {{ formattedPublicationDate || 'N/A' }}
              </p>
              <p class="text-body-2 mb-3">
                <strong>ISBN:</strong> {{ book.isbn || 'N/A' }}
              </p>
              <p class="text-body-2 mb-3">
                <strong>Pages:</strong> {{ book.pageCount || 'N/A' }}
              </p>
              <p class="text-body-2 mb-3">
                <strong>Original Language:</strong> {{ book.originalLanguage || 'N/A' }}
              </p>

              <div class="mt-3">
                <p class="text-body-2 mb-1"><strong>Description:</strong></p>
                <p class="text-body-2" style="white-space: pre-wrap;">
                  {{ book.description || 'No description available.' }}
                </p>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider v-if="!display.xs.value"></v-divider>

      <v-card-actions v-if="!display.xs.value"> <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="$emit('update:modelValue', false)"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Book } from '@/models/Book';
import { useDisplay } from 'vuetify'; 

const props = defineProps({
  modelValue: Boolean,
  book: {
    type: Object as () => Book | null,
    default: null
  }
});

defineEmits(['update:modelValue']);


const display = useDisplay(); 

const coverUrl = computed(() => {
  if (props.book && props.book.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${props.book.isbn}-L.jpg`;
  } else if (props.book && props.book.coverImageId) {
    return `https://covers.openlibrary.org/b/id/${props.book.coverImageId}-L.jpg`;
  }
  return 'https://via.placeholder.com/300x450.png?text=No+Cover';
});

const formattedPublicationDate = computed(() => {
  if (props.book && props.book.publicationDate) {
    try {
      return new Date(props.book.publicationDate).toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return props.book.publicationDate;
    }
  }
  return 'N/A';
});
</script>

<style scoped>
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

.text-body-2 strong {
  font-weight: bold;
}

.v-dialog--fullscreen .v-card-text {
  padding-top: 16px;
}

.v-dialog--fullscreen .v-toolbar-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

</style>