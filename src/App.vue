<script setup lang="ts">
import {RouterView } from 'vue-router'
import BottomNavigation from './components/BottomNavigation.vue';
</script>

<template>
  <v-app>
    <v-app-bar
        app
        color="surface" 
        density="compact"
        elevation="1">
        <v-app-bar-title
          class="text-center text-green font-weight-bold"
        >
          my readings </v-app-bar-title>
      </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <BottomNavigation />
  </v-app>
</template>

<style scoped>
</style>
