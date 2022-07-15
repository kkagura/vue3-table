import { reactive, watch } from "vue";
import { defaultCell, defaultColWidth, defaultRowHeight } from "../config";
import { Col, Coordinate, Row, State, Cell } from "../typings";
import { isObjectEqual, isRangeIntersected } from "../utils";

export function useStore(state: State) {
  //  遍历所有单元格
  const eachCell = (
    callback: (cell: Cell, rowIdx: number, colIdx: number) => boolean | void
  ) => {
    const { rows } = state.data;
    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const { cells } = rows[rowIdx];
      for (let colIdx = 0; colIdx < cells.length; colIdx++) {
        const cell = cells[colIdx];
        const restart = callback(cell, rowIdx, colIdx);
        //  回调函数返回true的时候代表要重置遍历索引
        //  有些情况下判断条件发生改变，需要重新遍历
        if (restart) {
          rowIdx = -1;
          break;
        }
      }
    }
  };
  //  根据坐标获取某个单元格
  const getCell = (rowIdx: number, colIdx: number) => {
    return state.data.rows[rowIdx].cells[colIdx];
  };

  const insertRow = (i: number) => {
    const colCount = state.data.cols.length;
    const row: Row = {
      height: defaultRowHeight,
      idx: i,
      cells: new Array(colCount)
        .fill(null)
        .map(() => JSON.parse(JSON.stringify(defaultCell))),
    };
    eachCell((cell, rowIdx, colIdx) => {
      if (cell.rowspan > 1) {
        if (i > rowIdx && i < cell.rowspan + rowIdx) {
          for (let i = colIdx; i < colIdx + cell.colspan; i++) {
            const next = row.cells[i];
            next.merged = true;
          }
          cell.rowspan += 1;
        }
      }
    });
    state.data.rows.splice(i, 0, row);
  };

  const deleteRow = (i: number) => {
    eachCell((cell, rowIdx, colIdx) => {
      if (cell.rowspan > 1) {
        if (rowIdx === i) {
          const next = getCell(rowIdx + 1, colIdx);
          next.merged = false;
          next.rowspan = cell.rowspan - 1;
          next.colspan = cell.colspan;
        } else if (i > rowIdx && i < cell.rowspan + rowIdx) {
          cell.rowspan -= 1;
        }
      }
    });
    state.data.rows.splice(i, 1);
  };

  const deleteRows = (i: number, count: number) => {
    for (let rowIdx = i + count - 1; rowIdx >= i; rowIdx--) {
      deleteRow(rowIdx);
    }
  };

  const setSelectionRow = (i: number) => {
    let startRow = i,
      endRow = i;
    eachCell((cell, rowIdx) => {
      if (cell.rowspan > 1) {
        const end = cell.rowspan + rowIdx - 1;
        if (isRangeIntersected([startRow, endRow], [rowIdx, end])) {
          let changed = false;
          if (rowIdx < startRow) {
            startRow = rowIdx;
            changed = true;
          }
          if (end > endRow) {
            endRow = end;
            changed = true;
          }
          return changed;
        }
      }
    });
    const colCount = state.data.cols.length - 1;
    state.selectionRange = [
      [startRow, 0],
      [endRow, colCount],
    ];
  };

  const setSelectionCol = (i: number) => {
    let startCol = i,
      endCol = i;
    eachCell((cell, rowIdx, colIdx) => {
      if (cell.colspan > 1) {
        const end = cell.colspan + colIdx - 1;
        if (isRangeIntersected([startCol, endCol], [colIdx, end])) {
          let changed = false;
          if (colIdx < startCol) {
            startCol = colIdx;
            changed = true;
          }
          if (end > endCol) {
            endCol = end;
            changed = true;
          }
          return changed;
        }
      }
    });
    const rowCount = state.data.rows.length - 1;
    state.selectionRange = [
      [0, startCol],
      [rowCount, endCol],
    ];
  };

  const setSelectionAll = () => {
    state.selectionRange = [
      [0, 0],
      [state.data.rows.length - 1, state.data.cols.length - 1],
    ];
  };

  const insertCol = (i: number) => {
    const col: Col = {
      width: defaultColWidth,
      idx: i,
    };
    for (let j = 0; j < state.data.rows.length; j++) {
      const cell = JSON.parse(JSON.stringify(defaultCell));
      state.data.rows[j].cells.splice(i, 0, cell);
    }
    eachCell((cell, rowIdx, colIdx) => {
      if (cell.colspan > 1) {
        if (i > colIdx && i < colIdx + cell.colspan) {
          const curr = getCell(rowIdx, i);
          curr.merged = true;
          cell.colspan += 1;
        }
      }
    });
    state.data.cols.splice(i, 0, col);
  };

  const deleteCol = (i: number) => {
    eachCell((cell, rowIdx, colIdx) => {
      if (cell.colspan > 1) {
        if (colIdx === i) {
          const next = getCell(rowIdx + 1, colIdx);
          next.merged = false;
          next.colspan = cell.colspan - 1;
          next.rowspan = cell.rowspan;
        } else if (i > colIdx && i < cell.colspan + colIdx) {
          cell.colspan -= 1;
        }
      }
    });
    state.data.rows.forEach((row) => {
      row.cells.splice(i, 1);
    });
    state.data.cols.splice(i, 1);
  };

  const deleteCols = (i: number, count: number) => {
    for (let colIdx = i + count - 1; colIdx >= i; colIdx--) {
      deleteCol(colIdx);
    }
  };

  const setSelectionRange = (start: Coordinate, end: Coordinate) => {
    let minx = start[0],
      miny = start[1],
      maxx = end[0],
      maxy = end[1];
    eachCell((cell, rowIdx, colIdx) => {
      const endx = rowIdx + cell.rowspan - 1;
      const endy = colIdx + cell.colspan - 1;

      let changed = false;
      if (
        isRangeIntersected([minx, maxx], [rowIdx, endx]) &&
        isRangeIntersected([miny, maxy], [colIdx, endy])
      ) {
        // if (minx <= endx && maxx >= rowIdx && miny <= endy && maxy >= colIdx) {
        if (rowIdx < minx) {
          minx = rowIdx;
          changed = true;
        }
        if (endx > maxx) {
          maxx = endx;
          changed = true;
        }
        if (colIdx < miny) {
          miny = colIdx;
          changed = true;
        }
        if (endy > maxy) {
          maxy = endy;
          changed = true;
        }
        if (changed) {
          rowIdx = 0;
          colIdx = 0;
          return true;
        }
      }
    });
    const newRange = [
      [minx, miny],
      [maxx, maxy],
    ] as [Coordinate, Coordinate];
    if (!isObjectEqual(newRange, state.selectionRange) || true) {
      state.selectionRange = newRange;
    }
  };

  const getSelectionCells = () => {
    if (!state.selectionRange) {
      return [];
    }
    const cells = new Set<Cell>();
    const [[r1, c1], [r2, c2]] = state.selectionRange;
    for (let i = r1; i <= r2; i++) {
      for (let j = c1; j <= c2; j++) {
        const cell = getCell(i, j);
        if (cell.merged !== true) {
          cells.add(cell);
        }
      }
    }
    return Array.from(cells);
  };

  const mergeCells = () => {
    if (!state.selectionRange) {
      return;
    }
    const [[rowStartIdx, colStartIdx], [rowEndIdx, colEndIdx]] =
      state.selectionRange;
    const minRow = Math.min(rowStartIdx, rowEndIdx);
    const maxRow = Math.max(rowStartIdx, rowEndIdx);
    const minCol = Math.min(colStartIdx, colEndIdx);
    const maxCol = Math.max(colStartIdx, colEndIdx);
    const row = state.data.rows[minRow];
    const cell = row.cells[minCol];
    cell.colspan = maxCol - minCol + 1;
    cell.rowspan = maxRow - minRow + 1;
    state.data.rows.slice(minRow, maxRow + 1).forEach((row, i) => {
      const start = minCol + (i === 0 ? 1 : 0);
      const end = start + maxCol - minCol + (i === 0 ? 0 : 1);
      for (let i = start; i < end; i++) {
        const cell = row.cells[i];
        cell.merged = true;
      }
    });
  };

  const splitCell = () => {
    if (state.selectionRange) {
      const [r1, c1] = state.selectionRange[0];
      const cell = getCell(r1, c1);
      const { colspan, rowspan } = cell;
      for (let i = r1; i < r1 + rowspan; i++) {
        for (let j = c1; j < c1 + colspan; j++) {
          const cell = getCell(i, j);
          cell.merged = false;
          cell.colspan = 1;
          cell.rowspan = 1;
        }
      }
    }
  };

  return {
    state,
    actions: {
      mergeCells,
      splitCell,
      insertRow,
      insertCol,
      deleteCols,
      deleteRows,
      setSelectionRange,
      setSelectionRow,
      setSelectionCol,
      setSelectionAll,
    },
    utils: {
      eachCell,
      getCell,
      getSelectionCells,
    },
  };
}
