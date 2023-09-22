import DateFormPulldown from "./DateFormPulldown.svelte"

export function dateFormPulldown(init: () => Date | null, onEnter: (d: Date | null) => void): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: DateFormPulldown = new DateFormPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        event,
        init: init(),
        onEnter,
      }
    })
  }
}