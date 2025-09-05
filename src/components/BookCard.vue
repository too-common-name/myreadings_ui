<template>
  <v-card class="ma-3 book-card-custom" elevation="4" @click="$emit('bookCardClicked')">
    <v-img :src="coverUrl" :aspect-ratio="2 / 3" cover class="rounded-t book-cover-img">
      <template #default>
        <v-chip class="ma-2 book-genre-chip" color="yellow-darken-2" size="small" label>
          {{ genre }}
        </v-chip>
      </template>
    </v-img>

    <v-card-text class="px-3 pb-2 book-card-content">
      <div class="font-weight-bold book-title">
        {{ title }}
      </div>
      <div class="text-caption text-grey book-description">
        {{ description }}
      </div>
    </v-card-text>

    <v-spacer></v-spacer>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  genre: String,
  coverUrl: String,
  title: String,
  description: String,
})

defineEmits(['bookCardClicked'])
</script>

<style scoped>
.book-card-custom {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.book-cover-img {
  flex-shrink: 0;
}

.book-card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.book-title {
  word-break: break-word;
  line-height: 1.2;
  margin-bottom: 4px;
}

.book-description {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.3;
  flex-grow: 1;
}

.book-genre-chip {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.9);
}
</style>
