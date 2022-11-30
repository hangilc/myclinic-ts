import DateFormPulldown from "./DateFormPulldown.svelte";

let m: DateFormPulldown | undefined = undefined;

export function openDateFormPulldown(
  initDate: Date | null,
  anchor: HTMLElement,
  onEnter: (d: Date | null) => void,
  isNullable: boolean = false
): void {
  const m = new DateFormPulldown({
    target: document.body,
    props: {
      date: initDate,
      anchor,
      onEnter: onEnter,
      destroy: () => m?.$destroy(),
      isNullable
    }
  });
}
