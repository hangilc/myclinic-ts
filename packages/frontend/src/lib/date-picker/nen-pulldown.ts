import NenPulldown from "./NenPulldown.svelte"

export function nenPulldown(nenList: () => number[], nen: () => number, onChange: (n: number) => void): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: NenPulldown = new NenPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        event,
        nenList: nenList(),
        nen: nen(),
        onChange,
      }
    })
  }
}