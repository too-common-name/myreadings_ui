<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" max-width="500px">
    <v-card>
      <v-card-title class="headline">Create New Reading List</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="name"
          label="List Name"
          required
          :rules="[v => !!v || 'Name is required']"
        ></v-text-field>
        <v-textarea
          v-model="description"
          label="Description (Optional)"
          rows="3"
        ></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" text @click="handleClose">Cancel</v-btn>
        <v-btn color="primary" variant="flat" @click="handleCreate" :disabled="!name">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue', 'create-list']);

const name = ref('');
const description = ref('');

const handleClose = () => {
  emit('update:modelValue', false);
};

const handleCreate = () => {
  if (name.value) {
    emit('create-list', { name: name.value, description: description.value });
  }
};
</script>

