<script lang="ts">
  import Modal from "../Modal.svelte";
  import DatePicker from "./DatePicker.svelte";

  export let onEnter: (value: Date) => void;
  let date: Date | null;
  let modal: Modal;

  export function open(init: Date): void {
    date = init;
    modal.open();
  }

  function doEnter(value: Date, close: () => void): void {
    close();
    onEnter(value);
  }
</script>

<Modal bind:this={modal} let:close>
  <DatePicker bind:date={date} onCancel={close} onEnter={(d) => doEnter(d, close)}/>
</Modal>
