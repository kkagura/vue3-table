<template>
  <ul :class="ns.e('list')">
    <li v-for="menu in menuData">
      <ContextmenuItem :menu-item="menu"></ContextmenuItem>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import { ContextmenuItemData } from "../typings/contextmenu";
import { useNamespace } from "../hooks/useNameSpace";
import ContextmenuItem from "./ContextmenuItem.vue";
const ns = useNamespace("contextmenu");

const props = defineProps({
  menus: {
    type: Array as PropType<ContextmenuItemData[]>,
    required: true,
  },
});
const menuData = computed(() =>
  props.menus.filter((menu) => menu.visible !== false)
);
</script>
