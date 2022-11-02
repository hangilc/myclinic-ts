<script lang="ts">
  import * as kanjidate from "kanjidate"
  import DateForm from "../date-form/DateForm.svelte"
  import Modal from "@/lib/Modal.svelte"

  export let date: Date | null;
  export let format: (date: Date | null) => string =
    (date: Date | null) => {
      if( date == null ){
        return "（未設定）";
      } else {
        return kanjidate.format(kanjidate.f2, date);
      }
    }
  let repr: string;
  let disp: HTMLElement;
  let modal: Modal;
  let form: DateForm
  updateRepr();
  
  function updateRepr(): void {
    repr = format(date);
  }

  function doClick(): void {
    modal.open();
  }

  function doFormEnter(value: Date | null, close: () => void): void {
    try {
      date = value;
      updateRepr();
    } catch(ex){
      console.error(ex);
    }
    close();
  }

</script>

<span class="disp" on:click={doClick} bind:this={disp}>{repr}</span>
<Modal bind:this={modal} let:close={close} screenOpacity="0.2">
  <DateForm date={new Date} bind:this={form} 
    onEnter={d => doFormEnter(d, close)} onCancel={close}/>
</Modal>

<style>
  .disp {
    cursor: pointer;
  }
</style>