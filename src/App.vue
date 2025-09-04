<template>
  <v-app>
    <SplashScreen v-if="showSplash" :class="{ 'fade-out': startFadeOut }"/>
    <template v-else>
      <v-app-bar
          app
          color="surface" 
          density="compact"
          elevation="1">
          <v-app-bar-title
            class="text-center text-primary font-weight-bold"
          >
            my readings </v-app-bar-title>
        </v-app-bar>

      <v-main>
        <router-view />
      </v-main>

      <BottomNavigationBar />
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import BottomNavigationBar from '@/components/BottomNavigationBar.vue';
import SplashScreen from '@/components/SplashScreen.vue';

const showSplash = ref(true);
const startFadeOut = ref(false);

onMounted(() => {
  const splashSeen = sessionStorage.getItem('splashSeen');

  if (splashSeen) {
    showSplash.value = false;
  } else {
    setTimeout(() => {
      startFadeOut.value = true; 
      setTimeout(() => {
        showSplash.value = false;
        sessionStorage.setItem('splashSeen', 'true');
      }, 500);
    }, 2000);
  }
});
</script>

<style scoped>
</style>
