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
                        <div class="text-subtitle-1">[Name], [Surname]</div>
                    </div>
                </div>
            </div>
            <div class="readinglists">
                <div class="text-h6">[Name]'s Reading Lists</div>
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
import { ref } from 'vue';

const reviewCount = ref(100);
const showReviews = ref(false);

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