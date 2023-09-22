import PopupMenu from "./PopupMenu.svelte"

export function popupTrigger(menu: () => [string, () => void][]): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const p: PopupMenu = new PopupMenu({
      target: document.body,
      props: {
        destroy: () => p.$destroy(),
        menu: menu(),
        event
      }
    });
  }
}

export function popupTriggerAdmin(
  isAdmin: () => boolean, adminMenus: () => [string, () => void][], menus: () => [string, () => void][]):
  (event: MouseEvent) => void {
  function f(): [string, () => void][] {
    const m: [string, () => void][] = [];
    if (isAdmin()) {
      m.push(...adminMenus());
    }
    m.push(...menus());
    return m;
  }
  return popupTrigger(f);
}