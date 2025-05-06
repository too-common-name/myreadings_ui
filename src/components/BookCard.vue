<template>
  <v-card class="ma-3 book-card-custom" elevation="4" @click="$emit('bookCardClicked')">
    <v-img
      :src="coverUrl"
      :aspect-ratio="2/3" cover class="rounded-t book-cover-img"
    >
      <template #default>
        <v-chip class="ma-2 book-genre-chip" color="yellow-darken-2" size="small" label>
          {{ genre }}
        </v-chip>
      </template>
    </v-img>

    <v-card-text class="px-3 pb-2 book-card-content">
      <div class="font-weight-bold text-truncate book-title" style="max-width: 100%;">
        {{ title }}
      </div>
      <div class="text-caption text-grey text-truncate book-description" style="max-width: 100%;">
        {{ description }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  genre: String,
  coverUrl: String,
  title: String,
  description: String
})
</script>

<style scoped>
.book-card-custom {
  display: flex;
  flex-direction: column;
  height: 90%; 
  width: 90%; 
}

.book-cover-img {
  flex-shrink: 0;
}

.book-card-content {
  flex-grow: 1; 
  flex-direction: column;
  justify-content: space-between; 
  min-height: 70px; 
}

.book-genre-chip {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: black;
}
</style>