import Confirm from "./Confirm.svelte";

export function confirm(
  message: string,
  yes: () => void,
  no: () => void = () => {}
): void {
  const conf = new Confirm({
    target: document.body,
    props: {
      text: message,
    },
  });
  conf.confirm(yes, no);
}
