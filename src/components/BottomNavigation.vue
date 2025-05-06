<template>
    <v-layout class="overflow-visible" style="height: 56px;">
        <v-bottom-navigation v-model="selected" color="primary" active grow mode="shift">
            <v-btn v-for="menuItem in menuItems" :key="menuItem.path" :to="menuItem.path" :value="menuItem.path"
                replace>
                <v-icon>{{ menuItem.icon }}</v-icon>
                <span>{{ menuItem.text }}</span>
            </v-btn>

        </v-bottom-navigation>
    </v-layout>
</template>

<script setup>
import { ref } from 'vue'

const selected = ref(0)

const menuItems = [
    { icon: 'mdi-home-outline', text: 'Home', path: '/' },
    { icon: 'mdi-book-open-outline', text: 'Books', path: '/books' },
    { icon: 'mdi-magnify', text: 'Search', path: '/search' },
    { icon: 'mdi-account-outline', text: 'Profile', path: '/profile' }
]
</script>