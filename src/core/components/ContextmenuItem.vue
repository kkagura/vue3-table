<script lang="ts">
import { PropType, defineComponent, h, inject } from "vue";
import { ContextmenuItemData } from "../typings/contextmenu";
import { useNamespace } from "../hooks/useNameSpace";
import ContextmenuList from "./ContextmenuList.vue";
import { contextmenuContextKey } from "../tokens";
const ns = useNamespace("contextmenu-item");

export default defineComponent({
  props: {
    menuItem: {
      type: Object as PropType<ContextmenuItemData>,
      required: true,
    },
  },
  setup(props, ctx) {
    const context = inject(contextmenuContextKey);
    const onClick = () => {
      context?.onClick(props.menuItem.commond, props.menuItem.context);
    };
    const renderer = () => {
      if (props.menuItem.render) {
        return props.menuItem.render(props.menuItem);
      }
      return h("div", { class: ns.b() }, [
        h("div", { class: ns.e("content"), onClick }, [
          h("i", { class: ns.e("icon") }),
          h("span", { class: ns.e("label") }, props.menuItem.label),
        ]),
        props.menuItem.children?.length
          ? h("div", { class: ns.e("children") }, [
              h(ContextmenuList, {
                menus: props.menuItem.children,
              }),
            ])
          : null,
      ]);
    };
    return () => renderer();
  },
});
</script>

<style lang="less" scoped>
.fe-contextmenu-item {
  line-height: 36px;
  padding: 0 22px;
  margin: 4px 0;
  cursor: pointer;
  position: relative;
  min-width: 140px;
  &:hover {
    background-color: #f5f7fa;
  }
  &__children {
    position: absolute;
    right: 0;
    margin-right: -100%;
    top: 0;
    background-color: #fff;
    box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
    border: 1px solid #d8dad9;
    border-radius: 4px;
  }
}
</style>
