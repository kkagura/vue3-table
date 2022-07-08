import { reactive } from "vue";
import { defaultCell, defaultColWidth, defaultRowHeight } from "../config";
import { Col, Coordinate, Row, State } from "../typings";

export function useStore() {
  const state: State = reactive({
    data: {
      rows: [],
      cols: [],
    },
    selectRange: null,
  });
  function insertRow(i: number) {
    const colCount = state.data.cols.length;
    const row: Row = {
      height: defaultRowHeight,
      idx: i,
      cells: new Array(colCount).fill({ ...defaultCell }),
    };
    state.data.rows.splice(i, 0, row);
  }

  function insertCol(i: number) {
    const col: Col = {
      width: defaultColWidth,
      idx: i,
    };
    state.data.cols.splice(i, 0, col);
  }

  function setSelectionRange(start: Coordinate, end: Coordinate) {
    state.selectRange = [start, end];
  }
  return {
    state,
    actions: {
      insertRow,
      insertCol,
      setSelectionRange,
    },
  };
}
