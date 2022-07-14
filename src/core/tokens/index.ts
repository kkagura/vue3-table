import { InjectionKey } from "vue";
import { useStore } from "../store";

export const tableContextKey: InjectionKey<ReturnType<typeof useStore>> =
  Symbol("table-context-key");

export const contextmenuContextKey: InjectionKey<{
  onClick(commond: string, context: any): void;
}> = Symbol("contextmenu-context-key");
