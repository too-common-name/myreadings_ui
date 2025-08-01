<template>
  <div class="splash-screen">
    <div class="splash-content">
      <v-icon class="book-icon" size="100" color="primary">mdi-book-open-variant</v-icon>
      <h1 class="app-title text-h4 text-primary font-weight-bold mt-4">my readings</h1>
    </div>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--v-theme-primary);
  z-index: 9999;
  transition: opacity 0.5s ease-in-out, visibility 0.5s;
}

.splash-screen.fade-out {
  opacity: 0;
  visibility: hidden;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.book-icon {
  animation: bounce 2s infinite ease-in-out;
}

.app-title {
  animation: fade-in 1s forwards ease-in-out;
  animation-delay: 0.5s;
  opacity: 0;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
