<template>
  <v-select
    v-model="selectedValue"
    :items="items"
    item-title="name"
    item-value="readingListId"
    variant="outlined"
    density="compact"
    label="Add to reading list"
    @update:modelValue="handleSelection"
    rounded
    :hide-details="true"
  ></v-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { ReadingList } from '@/models/ReadingList';

const props = defineProps({
  items: {
    type: Array as () => ReadingList[],
    default: () => []
  },
  modelValue: {
    type: String as () => string | null,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const selectedValue = ref<string | null>(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  selectedValue.value = newVal;
});

const handleSelection = (selectedId: string | null) => {
  emit('update:modelValue', selectedId);
};
</script>