export interface Cell {
  rowspan: number;
  colspan: number;
  field: string;
  contentType: string;
}

export interface Col {
  idx: number;
  width: number;
}

export interface Row {
  idx: number;
  height: number;
  cells: Cell[];
}

export type Coordinate = [number, number];

export interface State {
  data: {
    cols: Col[];
    rows: Row[];
  };
  selectRange: [Coordinate, Coordinate] | null;
}
