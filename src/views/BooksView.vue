<template>
    <v-container fluid class="pa-4">
        <v-row v-if="!display.xs.value">
            <v-col cols="12" md="3">
                <h2 class="text-h6 mb-4">My Collections</h2>
                <v-list nav>
                    <v-list-item v-for="collection in collections" :key="collection.readingListId"
                        @click="handleCollectionClick(collection)"
                        :active="selectedCollection?.readingListId === collection.readingListId" link>
                        <v-list-item-title>{{ collection.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ collection.description }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="collections.length === 0 && !loadingCollections">
                        <v-list-item-title>No collections found.</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="loadingCollections">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <span class="ml-2">Loading collections...</span>
                    </v-list-item>
                </v-list>
                <v-btn color="primary" variant="tonal" block class="mt-4" @click="showCreateListDialog = true">
                    <v-icon left>mdi-plus</v-icon>
                    Create New List
                </v-btn>
            </v-col>

            <v-col cols="12" md="9">
                <h2 class="text-h6 mb-4">
                    {{ selectedCollection ? `Books in "${selectedCollection.name}"` : 'Select a collection' }}
                </h2>
                <v-data-table :headers="desktopHeaders" :items="booksInCollection" item-value="bookId"
                    class="elevation-0" :loading="loadingBooks" no-data-text="No books in this collection.">
                    <template v-slot:item.cover="{ item }">
                        <v-img :src="getCoverUrl(item, 'M')" :alt="item.title" width="50" height="75" aspect-ratio="2/3"
                            contain class="my-2 rounded"></v-img>
                    </template>
                    <template v-slot:item.title="{ item }">
                        <a @click="handleBookClick(item)" class="text-decoration-underline book-title-link">{{
                            item.title }}</a>
                    </template>
                    <template v-slot:item.averageRating="{ item }">
                        <v-rating :model-value="item.reviewStats?.averageRating ?? 0" length="5" size="18"
                            active-color="primary" readonly half-increments density="compact" />
                        <span class="text-body-2 ms-1">({{ item.reviewStats?.averageRating?.toFixed(1) || 'N/A'
                        }})</span>
                    </template>
                    <template v-slot:item.userRating="{ item }">
                        <v-rating :model-value="item.userRating ?? 0" length="5" size="18" active-color="secondary"
                            readonly half-increments density="compact" />
                    </template>
                </v-data-table>
            </v-col>
        </v-row>

        <v-row v-else>
            <v-col cols="12">
                <div class="d-flex align-center mb-4">
                    <v-btn v-if="viewingCollectionBooks" icon size="small" class="mr-2"
                        @click="viewingCollectionBooks = false; selectedCollection = null">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <h2 class="text-h6">
                        {{ viewingCollectionBooks ? `Books in "${selectedCollection?.name}"` : 'My Collections' }}
                    </h2>
                </div>

                <v-btn v-if="!viewingCollectionBooks" color="primary" variant="tonal" block class="mt-4 mb-4"
                    @click="showCreateListDialog = true">
                    <v-icon left>mdi-plus</v-icon>
                    Create New List
                </v-btn>

                <v-list v-if="!viewingCollectionBooks" nav>
                    <template v-for="(collection, index) in collections" :key="collection.readingListId">
                        <v-list-item @click="handleCollectionClick(collection, true)" link>
                            <template v-slot:prepend>
                                <v-avatar color="grey-lighten-2">
                                    <v-icon>mdi-bookshelf</v-icon>
                                </v-avatar>
                            </template>
                            <v-list-item-title>{{ collection.name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ collection.description }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-divider v-if="index < collections.length - 1"></v-divider>
                    </template>
                    <v-list-item v-if="collections.length === 0 && !loadingCollections">
                        <v-list-item-title>No collections found.</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="loadingCollections">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <span class="ml-2">Loading collections...</span>
                    </v-list-item>
                </v-list>

                <v-list v-else nav>
                    <template v-for="(book, index) in booksInCollection" :key="book.bookId">
                        <v-list-item @click="handleBookClick(book)" link>
                            <template v-slot:prepend>
                                <v-img :src="getCoverUrl(book, 'M')" :alt="book.title" width="60" height="90"
                                    aspect-ratio="2/3" contain class="rounded mr-2"></v-img>
                            </template>
                            <v-list-item-title>{{ book.title }}</v-list-item-title>
                            <v-list-item-subtitle>{{ book.publisher || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-divider v-if="index < booksInCollection.length - 1"></v-divider>
                    </template>
                    <v-list-item v-if="booksInCollection.length === 0 && !loadingBooks">
                        <v-list-item-title>No books in this collection.</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="loadingBooks">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        <span class="ml-2">Loading books...</span>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>

        <BookDialog :model-value="showBookDetailsDialog" @update:model-value="showBookDetailsDialog = $event"
            :book="selectedBookForDetails" :select-options="collections"
            :review-stats="selectedBookForDetails?.reviewStats" :user-rating="userRatingForSelectedBook"
            :book-reading-list-id="bookReadingListIdForSelectedBook" @confirm-changes="confirmBookDialogChanges" />

        <CreateReadingListDialog :model-value="showCreateListDialog" @update:model-value="showCreateListDialog = $event"
            @create-list="handleCreateList" />
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import instance from '@/utils/axiosInstance';
import { useDisplay } from 'vuetify';
import type { Book, BookWithUserRating } from '@/models/Book';
import type { ReadingList } from '@/models/ReadingList';
import { useBookDataFetcher } from '@/composables/useBookDataFetcher';
import BookDialog from '@/components/BookDialog.vue';
import CreateReadingListDialog from '@/components/CreateReadingListDialog.vue';
import { useBookDialog } from '@/composables/useBookDialog';
import { getCoverUrl } from '@/utils/coverUtils';

const display = useDisplay();

const collections = ref<ReadingList[]>([]);
const selectedCollection = ref<ReadingList | null>(null);
const booksInCollection = ref<BookWithUserRating[]>([]);
const loadingCollections = ref(false);
const loadingBooks = ref(false);
const viewingCollectionBooks = ref(false);

const showCreateListDialog = ref(false);

const {
    showBookDetailsDialog,
    selectedBookForDetails,
    userRatingForSelectedBook,
    bookReadingListIdForSelectedBook,
    openBookDialog,
    handleConfirmChanges,
} = useBookDialog();

const {
  fetchBookReadingList, 
  fetchReviewStatsData,
  fetchMyReviewForBook,
} = useBookDataFetcher();

const desktopHeaders = [
    { title: 'Cover', key: 'cover', sortable: false },
    { title: 'Title', key: 'title' },
    { title: 'Average Rating', key: 'averageRating' },
    { title: 'Your Rating', key: 'userRating' },
];

const fetchCollections = async () => {
    loadingCollections.value = true;
    try {
        const response = await instance.get('/api/v1/readinglists');
        collections.value = response.data;
    } catch (error) {
        console.error('Error fetching collections:', error);
    } finally {
        loadingCollections.value = false;
    }
};

const fetchBooksInCollection = async (readingListId: string) => {
    loadingBooks.value = true;
    booksInCollection.value = [];
    try {
        const booksResponse = await instance.get(`/api/v1/readinglists/${readingListId}/books`);
        const booksData: Book[] = booksResponse.data;


        const booksWithDetailsPromises = booksData.map(async (book: Book) => {
            const readingList = await fetchBookReadingList(book.bookId);
            const currentReadingListId = readingList?.readingListId || null;
            const reviewStats = await fetchReviewStatsData(book.bookId);
            const myReview = await fetchMyReviewForBook(book.bookId);

            return {
                ...book,
                reviewStats: reviewStats,
                userRating: myReview?.rating ?? 0,
                readingListId: currentReadingListId,
                userReviewId: myReview?.reviewId ?? null,
                reviewText: myReview?.reviewText ?? null
            } as BookWithUserRating;
        });

        booksInCollection.value = await Promise.all(booksWithDetailsPromises);

    } catch (error) {
        console.error(`Error fetching books for collection ${readingListId}:`, error);
    } finally {
        loadingBooks.value = false;
    }
};

const handleCollectionClick = async (collection: ReadingList, isMobile: boolean = false) => {
    selectedCollection.value = collection;
    await fetchBooksInCollection(collection.readingListId);
    if (isMobile) {
        viewingCollectionBooks.value = true;
    }
};

async function handleBookClick(book: BookWithUserRating) {
    await openBookDialog(
        book,
        book.reviewStats!,
        book.userRating ?? 0,
        book.userReviewId ?? null,
        book.reviewText ?? null,
        book.readingListId || null
    );
}

const confirmBookDialogChanges = async (payload: { bookId: string, newRating?: number, selectedListId?: string | null }) => {
    await handleConfirmChanges(
        payload,
        (updatedBook) => {
            const index = booksInCollection.value.findIndex(b => b.bookId === updatedBook.bookId);
            if (index !== -1) {
                const bookToUpdate = booksInCollection.value[index];
                bookToUpdate.userRating = updatedBook.userRating;
                bookToUpdate.userReviewId = updatedBook.userReviewId;
                bookToUpdate.reviewText = updatedBook.reviewText;
                bookToUpdate.reviewStats = updatedBook.reviewStats;
            }
        },
        async () => {
            if (selectedCollection.value) {
                await fetchBooksInCollection(selectedCollection.value.readingListId);
            }
        }
    );
};

const handleCreateList = async (listDetails: { name: string; description: string }) => {
    try {
        const response = await instance.post('/api/v1/readinglists', listDetails);
        console.log('List created successfully:', response.data);
        showCreateListDialog.value = false;
        await fetchCollections();
    } catch (error) {
        console.error('Error creating list:', error);
    }
};

onMounted(() => {
    fetchCollections();
});
</script>

<style scoped>
.v-img.rounded {
    border-radius: 4px;
}

.v-data-table {
    width: 100%;
}

.v-data-table.elevation-0 {
    box-shadow: none !important;
}

a {
    color: inherit;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
    cursor: pointer;
}

@media (max-width: 599px) {
    .d-flex.align-center.mb-4 {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
    }

    .d-flex.align-center.mb-4 .v-btn {
        margin-right: 8px;
    }

    .d-flex.align-center.mb-4 .text-h6 {
        flex-grow: 1;
    }
}
</style>
