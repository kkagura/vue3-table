<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { reactive } from "vue";
import Table from "./core/Table.vue";
const state = reactive({
  data: {
    rows: [],
    cols: [],
  },
  selectRange: null,
});
</script>

<template>
  <Table :state="state" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>
