<template>
  <div :class="ns.b()">
    <table :class="ns.e('inner')" :style="computedStyle">
      <colgroup>
        <col v-for="col in state.data.cols" :width="col.width" />
      </colgroup>
      <tbody
        @mousedown.prevent="handleMousedown"
        @mouseup.prevent=""
        @contextmenu.prevent="handleContextmenuInteraction"
        :class="ns.e('body')"
      >
        <tr
          :class="ns.e('row')"
          v-for="(row, rowIdx) in state.data.rows"
          :style="{ height: `${row.height}px` }"
        >
          <template v-for="(cell, colIdx) in row.cells">
            <td
              v-if="!cell.merged"
              :class="createCellClass(rowIdx, colIdx)"
              :rowspan="cell.rowspan"
              :colspan="cell.colspan"
              :data-col="colIdx"
              :data-row="rowIdx"
            ></td>
          </template>
        </tr>
      </tbody>
    </table>
    <div :class="ns.be('controller', 'column')">
      <div
        :class="ns.bem('controller', 'column', 'bar')"
        v-for="(col, colIdx) in state.data.cols"
        :style="{ width: `${col.width}px` }"
        @click="actions.setSelectionCol(colIdx)"
      ></div>
    </div>
    <div :class="ns.be('controller', 'row')">
      <div
        :class="ns.bem('controller', 'row', 'bar')"
        v-for="(row, rowIdx) in state.data.rows"
        :style="{ height: `${row.height}px` }"
        @click="actions.setSelectionRow(rowIdx)"
      ></div>
    </div>
    <div
      :class="ns.be('controller', 'point')"
      @click="actions.setSelectionAll"
    ></div>
  </div>
  <Contextmenu
    v-model:visible="contextmenuContext.show"
    :client-x="contextmenuContext.position.x"
    :client-y="contextmenuContext.position.y"
    @menu-click="handleMenuClick"
    :contextmenus="contextmenus"
  ></Contextmenu>
</template>
<script lang="ts" setup>
import { computed, PropType, provide, reactive, ref } from "vue";
import Contextmenu from "./components/Contextmenu.vue";
import { useNamespace } from "./hooks/useNameSpace";
import { useStore } from "./store";
import { tableContextKey } from "./tokens";
import { Cell, Coordinate, State } from "./typings";
import { ContextmenuItemData } from "./typings/contextmenu";
import { findParent } from "./utils/dom";
const props = defineProps({
  state: {
    type: Object as PropType<State>,
    required: true,
  },
});
const store = useStore(props.state);
const { state, actions, utils } = store;
provide(tableContextKey, store);

const ns = useNamespace("table");

const init = () => {
  for (let i = 0; i < 10; i++) {
    actions.insertCol(i);
  }
  for (let i = 0; i < 10; i++) {
    actions.insertRow(i);
  }
};
init();

const computedStyle = computed(() => {
  const width = state.data.cols.reduce((prev, curr) => prev + curr.width, 0);
  return {
    width: `${width}px`,
  };
});

//  判断单元格是否被选中
const isCellSelected = (rowIdx: number, colIdx: number) => {
  const { selectionRange } = state;
  if (!selectionRange) {
    return false;
  }
  const [start, end] = selectionRange;
  const minRowIdx = Math.min(start[0], end[0]);
  const maxRowIdx = Math.max(start[0], end[0]);
  const minColIdx = Math.min(start[1], end[1]);
  const maxColIdx = Math.max(start[1], end[1]);
  return (
    rowIdx >= minRowIdx &&
    rowIdx <= maxRowIdx &&
    colIdx >= minColIdx &&
    colIdx <= maxColIdx
  );
};
const cellCls = ns.e("cell");
const createCellClass = (rowIdx: number, colIdx: number) => {
  return [cellCls, isCellSelected(rowIdx, colIdx) ? ns.is("selected") : ""];
};

//  所有的mousedown事件集合
const mousedownEvents: ((e: MouseEvent) => void)[] = [];
const handleMousedown = (e: MouseEvent) => {
  mousedownEvents.forEach((handler) => handler(e));
};

//  处理选中相关的交互
const handleSelectionInteraction = (e: MouseEvent) => {
  const startDom = findParent(e.target as HTMLElement, cellCls);
  if (!startDom) {
    state.selectionRange = null;
    return;
  }
  const colIdx = Number(startDom.getAttribute("data-col"));
  const rowIdx = Number(startDom.getAttribute("data-row"));
  if (e.which === 3) {
    if (!isCellSelected(rowIdx, colIdx)) {
      actions.setSelectionRange([rowIdx, colIdx], [rowIdx, colIdx]);
    }
  }
  if (e.which !== 1) {
    return;
  }
  const start: Coordinate = [rowIdx, colIdx];
  let end: Coordinate = [rowIdx, colIdx];
  actions.setSelectionRange(start, end);
  const handleMousemove = (e: MouseEvent) => {
    const endDom = findParent(e.target as HTMLElement, cellCls);
    if (!endDom) {
      return;
    }
    const colIdx = Number(endDom.getAttribute("data-col"));
    const rowIdx = Number(endDom.getAttribute("data-row"));
    end = [rowIdx, colIdx];
    const x1 = Math.min(start[0], rowIdx);
    const y1 = Math.min(start[1], colIdx);
    const x2 = Math.max(start[0], rowIdx);
    const y2 = Math.max(start[1], colIdx);
    actions.setSelectionRange([x1, y1], [x2, y2]);
  };
  const handleMouseup = () => {
    window.removeEventListener("mousemove", handleMousemove);
    window.removeEventListener("mouseup", handleMouseup);
    window.removeEventListener("mouseleave", handleMouseup);
  };
  window.addEventListener("mousemove", handleMousemove);
  window.addEventListener("mouseup", handleMouseup);
  window.addEventListener("mouseleave", handleMouseup);
};

//  处理右键面板
const contextmenuContext = reactive({
  show: false,
  position: {
    x: 0,
    y: 0,
  },
});

const contextmenus = computed<ContextmenuItemData[]>(() => {
  const selected = utils.getSelectionCells();
  const selectionLength = selected.length;
  const columns = [
    {
      label: "在上方插入一行",
      commond: "insertRowAtUp",
    },
    {
      label: "在左侧插入一列",
      commond: "insertColAtLeft",
    },
    {
      label: "删除选中行",
      commond: "deleteSelectionRows",
    },
    {
      label: "删除选中列",
      commond: "deleteSelectionCols",
    },
    {
      label: "合并单元格",
      commond: "mergeCells",
      visible: selectionLength > 1,
    },
    {
      label: "拆分单元格",
      commond: "splitCell",
      visible:
        selectionLength === 1 &&
        selected[0] &&
        (selected[0].colspan > 1 || selected[0].rowspan > 1),
    },
  ];
  return columns;
});
const handleContextmenuInteraction = (e: MouseEvent) => {
  if (e.which !== 3) {
    return;
  }
  contextmenuContext.position.x = e.clientX;
  contextmenuContext.position.y = e.clientY;
  contextmenuContext.show = true;
};
const handlers: Record<string, Function> = {
  mergeCells() {
    actions.mergeCells();
  },
  insertColAtLeft() {
    if (!state.selectionRange) {
      return;
    }
    const colIdx = state.selectionRange[0][1];
    actions.insertCol(colIdx);
    state.selectionRange[0][1] += 1;
    state.selectionRange[1][1] += 1;
  },
  insertRowAtUp() {
    if (!state.selectionRange) {
      return;
    }
    const rowIdx = state.selectionRange[0][0];
    actions.insertRow(rowIdx);
    state.selectionRange[0][0] = state.selectionRange[0][0] + 1;
    state.selectionRange[1][0] = state.selectionRange[1][0] + 1;
  },
  deleteSelectionRows() {
    if (!state.selectionRange) {
      return;
    }
    const start = state.selectionRange[0][0];
    const end = state.selectionRange[1][0];
    actions.deleteRows(start, end - start + 1);
    state.selectionRange = null;
  },
  deleteSelectionCols() {
    if (!state.selectionRange) {
      return;
    }
    const start = state.selectionRange[0][1];
    const end = state.selectionRange[1][1];
    actions.deleteCols(start, end - start + 1);
    state.selectionRange = null;
  },
  splitCell() {
    actions.splitCell();
  },
};
const handleMenuClick = (commond: string, context: any) => {
  console.log(commond);
  handlers[commond] && handlers[commond](context);
};

mousedownEvents.push(handleSelectionInteraction);
</script>

<style lang="less" scoped>
.fe-table {
  padding: 20px;
  position: relative;
  &__inner {
    border-collapse: collapse;
  }
  &__cell {
    border: 1px solid #d8dad9;
    position: relative;
    &.is-selected {
      &::after {
        content: " ";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(192, 217, 252, 0.5);
        pointer-events: none;
      }
    }
  }
  &-controller__column {
    position: absolute;
    display: flex;
    height: 14px;
    left: 20px;
    top: 7px;
    background-color: #f4f5f5;
    border-right: 1px solid #d8dad9;
    &--bar {
      border-width: 1px 0 1px 1px;
      border-color: #d8dad9;
      border-style: solid;
      cursor: pointer;
      &:hover {
        background-color: #e8e9e8;
      }
    }
  }
  &-controller__row {
    position: absolute;
    width: 14px;
    left: 7px;
    top: 20px;
    background-color: #f4f5f5;
    border-bottom: 1px solid #d8dad9;
    &--bar {
      border-width: 1px 1px 0px 1px;
      border-color: #d8dad9;
      border-style: solid;
      cursor: pointer;
      &:hover {
        background-color: #e8e9e8;
      }
    }
  }

  &-controller__point {
    position: absolute;
    top: 7px;
    left: 7px;
    background-color: #f4f5f5;
    border-width: 1px 0 0px 1px;
    border-color: #d8dad9;
    border-style: solid;
    width: 13px;
    height: 13px;
    border-top-left-radius: 50%;
    cursor: pointer;
    &:hover {
      background-color: #e8e9e8;
    }
  }
}
</style>
