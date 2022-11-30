import DatePickerPulldown from "./DatePickerPulldown.svelte";

export function openDatePickerPulldown(
  init: Date,
  anchor: HTMLElement | SVGSVGElement,
  onEnter: (d: Date) => void
): void {
  let m: DatePickerPulldown | undefined = undefined;

  m = new DatePickerPulldown({
    target: document.body,
    props: {
      init,
      anchor,
      onEnter,
      destroy: () => m?.$destroy()
    }
  });
}
