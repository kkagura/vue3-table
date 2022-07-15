<template>
  <div :class="ns.em('cell', 'inner')">{{ cell.value }}</div>
</template>

<script lang="ts" setup>
import { PropType, toRefs } from "vue";
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
</script>

<style lang="less" scoped></style>
