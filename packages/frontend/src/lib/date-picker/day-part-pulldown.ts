import DayPartPulldown from "./DayPartPulldown.svelte"

export function dayPartPulldown(dayList: () => number[], day: () => number, onChange: (day: number) => void): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: DayPartPulldown = new DayPartPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        dayList: dayList(),
        day: day(),
        onChange,
        event,
      }
    })
  }
}