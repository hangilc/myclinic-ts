import NenPulldown from "./NenPulldown.svelte";

export function nenPulldown(nenList: number[], nen: number, onChange: (nen: number) => void): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    const d: NenPulldown = new NenPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        event,
        nenList,
        nen,
        onChange,
      }
    })
  };
}
