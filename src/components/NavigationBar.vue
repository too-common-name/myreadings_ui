<template>
    <v-toolbar color="primary">
        <v-spacer></v-spacer>
        <v-toolbar-title>my readings</v-toolbar-title>
        <v-btn class="text-none" variant="plain">My Books</v-btn>
        <v-spacer></v-spacer>
        <v-text-field v-model="search" placeholder="Cerca..." single-line hide-details prepend-inner-icon="mdi-magnify"
            dense variant="underlined"></v-text-field>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-account"></v-btn>
        <v-spacer></v-spacer>
    </v-toolbar>
</template>

<script>
export default {
    data() {
        return {
            search: '',
        };
    },
    watch: {
        search(newValue) {
            console.log('Hai cercato:', newValue);
            this.$emit('search-input', newValue);
        },
    },
};
</script>

<style scoped>
.v-toolbar-title {
    flex: none;
}
</style>