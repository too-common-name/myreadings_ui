<template>
    Profile view
</template>

<script setup lang="ts">
// import { ref, onMounted } from 'vue';
// import instance from '@/utils/axiosInstance';
// import { getToken } from '@josempgon/vue-keycloak';
// import { jwtDecode } from "jwt-decode";
// import { useElevation } from 'vuetify/lib/composables/elevation.mjs';
// import BottomNavigation from '@/components/BottomNavigation.vue';

// const profileImageUrl = ref('https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortRound&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Blue03&graphicType=Blank&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Smile&skinColor=Light');
// const reviewCount = ref(0);
// const showReviews = ref(false);
// const readingBooks = ref([]);
// const userDetails = ref({});
// const reviews = ref([]);
// const readingLists = ref([]);

// onMounted(async () => {
//     try {
//         const token = await getToken();
//         const parsedToken = jwtDecode(token);

//         const userIdFromToken = parsedToken?.sub;

//         if (userIdFromToken) {
//             const userResponse = await instance.get(`/api/v1/users/${userIdFromToken}`);

//             if (userResponse.data) {
//                 userDetails.value = userResponse.data;
//             } else {
//                 console.error('Failed to fetch user details');
//             }

//             const reviewsResponse = await instance.get(`/api/v1/reviews/users/${userIdFromToken}`);
//             if (reviewsResponse.data) {
//                 reviews.value = reviewsResponse.data;
//                 reviewCount.value = reviews.value.length;
//             } else {
//                 console.error('Failed to fetch user reviews');
//             }
//         } else {
//             console.error('Could not retrieve user ID from the token.');
//         }

//         const readingListsResponse = await instance.get('/api/v1/readinglists');
//         if (readingListsResponse.data) {
//             readingLists.value = readingListsResponse.data;
//         } else {
//             console.error('Failed to fetch reading lists');
//         }


//     } catch (error) {
//         console.error('Error fetching data:', error);
//     }
// });

</script>

<style scoped>
</style>