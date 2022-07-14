export const findParent = (el: HTMLElement, cls: string) => {
  let target: HTMLElement | null = el;
  while (target) {
    if (target.classList.contains(cls)) {
      return target;
    }
    target = target.parentElement;
  }
  return null;
};
