import MonthPulldown from "./MonthPulldown.svelte";

export function monthPulldown(event: MouseEvent, month: number, onChange: (month: number) => void) {
  const d: MonthPulldown = new MonthPulldown({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      event,
      month,
      onChange,
    }
  })
}
