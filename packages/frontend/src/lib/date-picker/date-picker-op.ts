import DatePicker2 from "./DatePicker2.svelte";

export function openDatePickerPulldown(
  date: Date,
  anchor: HTMLElement | SVGSVGElement,
  onEnter: (d: Date) => void
): void {
  let m: DatePicker2 = new DatePicker2({
    target: document.body,
    props: {
      date,
      anchor,
      onEnter,
      destroy: () => m.$destroy()
    }
  });
}
