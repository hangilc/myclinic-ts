import Confirm from "./Confirm.svelte"

export function confirm(message: string, proc: () => void): void {
  const conf = new Confirm({
    target: document.body,
    props: {
      text: message
    }
  });
  conf.confirm(proc);
}