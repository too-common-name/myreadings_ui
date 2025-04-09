<template>
    <NavigationBar />
    <div class="container">
        <div class="profile-readinglists">
            <div class="profile">
                <div class="d-flex align-center mb-4">
                    <div class="d-flex flex-column align-center mb-4">
                        <v-avatar size="200" color="grey lighten-1" class="mr-4">
                            <v-img
                                src="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortRound&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Blue03&graphicType=Blank&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light"></v-img>
                        </v-avatar>
                        <div class="text-caption font-weight-bold" style="cursor: pointer;"
                            @click="showReviews = !showReviews">
                            {{ reviewCount }} reviews
                        </div>
                    </div>
                    <div>
                        <div class="text-h6">Hello</div>
                        <div class="text-subtitle-1">{{userDetails.firstName}} {{userDetails.lastName}}</div>
                    </div>
                </div>
            </div>
            <div class="readinglists">
                <div class="text-h6">{{userDetails.firstName}}'s Reading Lists</div>
                <div class="text-subtitle-1">[Reading](num)</div>
                <div class="text-subtitle-1">[Readed](num)</div>
            </div>
        </div>
        <div class="readindlists-books">
            <div class="text-h6">[Reading list name]</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import NavigationBar from '@/components/NavigationBar.vue';
import { ref, onMounted } from 'vue';
import instance from '@/utils/axiosInstance';
import { getToken } from '@josempgon/vue-keycloak';
import { jwtDecode } from "jwt-decode";
import { useElevation } from 'vuetify/lib/composables/elevation.mjs';

const profileImageUrl = ref('https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortRound&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Blue03&graphicType=Blank&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light');
const reviewCount = ref(0);
const showReviews = ref(false);
const readingBooks = ref([]);
const userDetails = ref({});
const reviews = ref([]);
const readingLists = ref([]);

onMounted(async () => {
    try {
        const token = await getToken();
        const parsedToken = jwtDecode(token);

        const userIdFromToken = parsedToken?.sub;

        if (userIdFromToken) {
            const userResponse = await instance.get(`/api/v1/users/${userIdFromToken}`);

            if (userResponse.data) {
                userDetails.value = userResponse.data;
            } else {
                console.error('Failed to fetch user details');
            }

            const reviewsResponse = await instance.get(`/api/v1/reviews/users/${userIdFromToken}`);
            if (reviewsResponse.data) {
                reviews.value = reviewsResponse.data;
                reviewCount.value = reviews.value.length;
            } else {
                console.error('Failed to fetch user reviews');
            }
        } else {
            console.error('Could not retrieve user ID from the token.');
        }

        const readingListsResponse = await instance.get('/api/v1/readinglists');
        if (readingListsResponse.data) {
            readingLists.value = readingListsResponse.data;
        } else {
            console.error('Failed to fetch reading lists');
        }


    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    align-items: center;
}

.profile-readinglists {
    display: flex;
    width: 70%;
}

/* Add any custom styles here */
</style>