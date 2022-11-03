<script lang="ts">
  import Modal from "../Modal.svelte";
  import DatePicker from "./DatePicker.svelte";

  export let onEnter: (value: Date) => void;
  let modal: Modal;
  let initDate: Date | null = null;

  export function open(init: Date): void {
    initDate = init;
    modal.open();
  }

  function doEnter(d: Date, close: () => void): void {
    close();
    onEnter(d);
  }
</script>

<Modal bind:this={modal} let:close>
  <DatePicker onCancel={close} onEnter={(d) => doEnter(d, close)} {initDate} />
</Modal>
