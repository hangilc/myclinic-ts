import ShowError from "./ShowError.svelte"

export function showError(message: string): void {
  let comp: ShowError;
  comp = new ShowError({
    target: document.body,
    props: {
      message,
      onClose: () => comp.$destroy()
    }
  });
  comp.open();
}
