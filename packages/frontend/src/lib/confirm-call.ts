import Confirm from "./Confirm.svelte";

export function confirm(
  message: string,
  yesProc: () => void,
  noProc: () => void = () => {}
): void {
  const conf: Confirm = new Confirm({
    target: document.body,
    props: {
      text: message,
      destroy: () => conf.$destroy(),
      yesProc,
      noProc,
    },
  });
}
