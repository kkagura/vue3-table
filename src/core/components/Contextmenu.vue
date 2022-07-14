<template>
  <teleport to="body">
    <div :style="computedStyles" v-show="visible" :class="cls">
      <ContextmenuList :menus="contextmenus"></ContextmenuList>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  PropType,
  provide,
  reactive,
} from "vue";
import { ContextmenuItemData } from "../typings/contextmenu";
import { useNamespace } from "../hooks/useNameSpace";
import ContextmenuList from "./ContextmenuList.vue";
import { findParent } from "../utils/dom";
import { contextmenuContextKey } from "../tokens";
const ns = useNamespace("contextmenu");

const props = defineProps({
  clientX: {
    type: Number,
    required: true,
  },
  clientY: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    required: true,
  },
  contextmenus: {
    type: Array as PropType<ContextmenuItemData[]>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "menuClick", commond: string, context: any): void;
}>();
const visible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val),
});
const computedStyles = computed(() => {
  const { clientX, clientY } = props;
  return {
    left: `${clientX}px`,
    top: `${clientY}px`,
  };
});

const context = reactive({
  onClick(commond: string, context: any) {
    emit("menuClick", commond, context);
    visible.value = false;
  },
});
provide(contextmenuContextKey, context);

const cls = ns.b();
const handleBlur = (e: MouseEvent) => {
  const contextmenu = findParent(e.target as HTMLElement, cls);
  if (!contextmenu) {
    visible.value = false;
  }
};
onMounted(() => {
  window.addEventListener("mousedown", handleBlur);
});
onUnmounted(() => {
  window.removeEventListener("mousedown", handleBlur);
});
</script>

<style lang="less" scoped>
.fe-contextmenu {
  position: fixed;
  background-color: #fff;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  border: 1px solid #d8dad9;
  border-radius: 4px;
}
</style>
