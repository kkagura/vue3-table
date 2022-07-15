import { reactive } from "vue";
import { useNamespace } from "../hooks/useNameSpace";
import { State } from "../typings";
import { findParent } from "../utils/dom";

export const useColControllerEvent = (state: State) => {
  //  拖拽相关事件
  const handleColControllerMousemove = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    if (rect.width > 12 && rect.right - e.pageX < 8) {
      target.style.cursor = "col-resize";
    } else {
      target.style.cursor = "";
    }
  };

  const handleColControllerMousedown = (e: MouseEvent, colIdx: number) => {
    let startx = e.pageX;
    const mousemove = (e: MouseEvent) => {
      const offsetx = e.pageX - startx;
      startx = e.pageX;
      const col = state.data.cols[colIdx];
      const w = col.width + offsetx;
      if (w > 12) {
        col.width = w;
      }
    };
    const mouseup = () => {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mouseleave", mouseup);
    };
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mouseleave", mouseup);
  };

  return {
    handleColControllerMousemove,
    handleColControllerMousedown,
  };
};

export const useRowControllerEvent = (state: State) => {
  //  拖拽相关事件
  const handleRowControllerMousemove = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    if (rect.height > 12 && rect.bottom - e.pageY < 8) {
      target.style.cursor = "row-resize";
    } else {
      target.style.cursor = "";
    }
  };

  const handleRowControllerMousedown = (e: MouseEvent, rowIdx: number) => {
    let starty = e.pageY;
    const mousemove = (e: MouseEvent) => {
      const offsety = e.pageY - starty;
      starty = e.pageY;
      const row = state.data.rows[rowIdx];
      const h = row.height + offsety;
      if (h > 12) {
        row.height = h;
      }
    };
    const mouseup = () => {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mouseleave", mouseup);
    };
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mouseleave", mouseup);
  };

  return {
    handleRowControllerMousemove,
    handleRowControllerMousedown,
  };
};

const ns = useNamespace("table");
const bodyCls = ns.e("body");
const tolerance = 4;
export const useTableControllerEvent = (state: State) => {
  const resizeContext = reactive({
    dir: "x" as "x" | "y",
    position: 0,
    idx: 0,
    visible: false,
  });
  let pause = false;
  const handleControllerMousemove = (e: MouseEvent) => {
    if (pause) {
      return;
    }
    const target = e.target as HTMLElement;
    const body = findParent(target, bodyCls);
    if (!body) {
      return;
    }
    const rect = body.getBoundingClientRect();
    const x = e.pageX - rect.left;
    const y = e.pageY - rect.top;
    let distanceX = Infinity;
    let distanceY = Infinity;
    let w = 0;
    let i = 0;
    for (; i < state.data.cols.length; i++) {
      const col = state.data.cols[i];
      w += col.width;
      if (Math.abs(w - x) < distanceX) {
        distanceX = Math.abs(w - x);
        if (distanceX <= tolerance) {
          break;
        }
      }
    }
    let h = 0;
    let j = 0;
    for (; j < state.data.rows.length; j++) {
      const row = state.data.rows[j];
      h += row.height;
      if (Math.abs(h - y) < distanceY) {
        distanceY = Math.abs(h - y);
        if (distanceY <= tolerance) {
          break;
        }
      }
    }
    if (distanceX > tolerance && distanceY > tolerance) {
      resizeContext.visible = false;
    } else if (distanceX < distanceY) {
      resizeContext.dir = "x";
      resizeContext.idx = i;
      resizeContext.position = w - 2;
      resizeContext.visible = true;
    } else {
      resizeContext.dir = "y";
      resizeContext.idx = j;
      resizeContext.position = h - 2;
      resizeContext.visible = true;
    }
  };
  const handleControllerMouseleave = () => {
    resizeContext.visible = false;
  };
  const handleControllerMousedown = (e: MouseEvent) => {
    const body = findParent(e.target as HTMLElement, ns.b());
    if (!body) {
      return;
    }
    pause = true;
    let starty = e.pageY;
    let startx = e.pageX;
    const i = resizeContext.idx;
    const rect = body.getBoundingClientRect();
    const mousemove = (e: MouseEvent) => {
      if (resizeContext.dir === "x") {
        resizeContext.position = e.pageX - rect.left - 2;
      } else {
        resizeContext.position = e.pageY - rect.top - 2;
      }
    };
    const mouseup = (e: MouseEvent) => {
      if (resizeContext.dir === "x") {
        const offsetx = e.pageX - startx;
        const col = state.data.cols[i];
        const w = col.width + offsetx;
        col.width = Math.max(12, w);
      } else {
        const offsety = e.pageY - starty;
        const row = state.data.rows[i];
        const h = row.height + offsety;
        row.height = Math.max(12, h);
      }
      pause = false;
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      window.removeEventListener("mouseleave", mouseup);
    };
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    window.addEventListener("mouseleave", mouseup);
  };
  return {
    resizeContext,
    handleControllerMousemove,
    handleControllerMouseleave,
    handleControllerMousedown,
  };
};
