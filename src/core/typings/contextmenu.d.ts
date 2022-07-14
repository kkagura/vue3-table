import { h } from "vue";

export interface ContextmenuItemData {
  icon?: string;
  label: string;
  commond: string;
  context?: any;
  children?: ContextmenuItemData[];
  render?: (data: ContextmenuItemData) => ReturnType<typeof h>;
  visible?: boolean;
}
