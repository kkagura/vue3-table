<template>
  <table :class="ns.b()">
    <colgroup>
      <col v-for="col in state.data.cols" :width="col.width" />
    </colgroup>
    <tbody :class="ns.e('body')">
      <tr
        :class="ns.e('row')"
        v-for="row in state.data.rows"
        :style="{ height: `${row.height}px` }"
      >
        <td :class="ns.e('cell')" v-for="cell in row.cells"></td>
      </tr>
    </tbody>
  </table>
</template>
<script lang="ts" setup>
import { provide } from "vue";
import { useNamespace } from "./hooks/useNameSpace";
import { useStore } from "./store";
import { tableContextKey } from "./tokens";
const store = useStore();
const { state, actions } = store;
provide(tableContextKey, store);

const ns = useNamespace("table");

const init = () => {
  for (let i = 0; i < 3; i++) {
    actions.insertCol(i);
  }
  for (let i = 0; i < 3; i++) {
    actions.insertRow(i);
  }
};
init();
</script>

<style lang="less" scoped>
.fe-table {
  border-collapse: collapse;
  &__cell {
    border: 1px solid #d8dad9;
  }
}
</style>
