<template>
  <div @click="handleClick" :class="ns.em('cell', 'inner')">
    <div
      :class="ns.em('cell', 'input')"
      :contenteditable="editable"
      @blur="editable = false"
      ref="inputRef"
      :spellcheck="false"
      @input="handleInput"
    >
      {{ cell.value }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, PropType, ref, toRefs } from "vue";
import { useNamespace } from "./hooks/useNameSpace";
import { Cell } from "./typings";
const ns = useNamespace("table");
const prop = defineProps({
  cell: {
    type: Object as PropType<Cell>,
    required: true,
  },
});
const { cell } = toRefs(prop);
const editable = ref(false);
const inputRef = ref();

const handleClick = () => {
  editable.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleInput = (e: Event) => {
  const div = e.target as HTMLElement;
  cell.value.value = div.innerText;
};
</script>

<style lang="less" scoped>
.fe-table__cell--inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px;
  display: flex;
  align-items: center;
  line-height: 1;
  cursor: text;
  font-size: 14px;
  line-height: 20px;
  .fe-table__cell--input {
    border: none;
    background-color: transparent;
    font-size: 14px;
    line-height: 20px;
    height: 20px;
    width: 100%;
    font-weight: 300;
    &:focus-visible {
      outline: none;
    }
  }
}
</style>
