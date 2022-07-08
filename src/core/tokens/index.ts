import { InjectionKey } from "vue";
import { useStore } from "../store";

export const tableContextKey: InjectionKey<ReturnType<typeof useStore>> =
  Symbol("table-context-key");
