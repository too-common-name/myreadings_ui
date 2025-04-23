<script setup lang="ts">
import {RouterView } from 'vue-router'
import BottomNavigation from './components/BottomNavigation.vue';
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>

    <BottomNavigation />
  </v-app>
</template>

<style scoped>
</style>
