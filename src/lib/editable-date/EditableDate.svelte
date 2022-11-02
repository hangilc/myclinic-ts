<script lang="ts">
  import * as kanjidate from "kanjidate"
  import DateForm from "../date-form/DateForm.svelte"
  import Modal from "@/lib/Modal.svelte"
    import DatePicker from "../date-picker/DatePicker.svelte";

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
  let modalForm: Modal;
  let form: DateForm
  updateRepr();
  let modalPicker: Modal;
  
  function updateRepr(): void {
    repr = format(date);
  }

  function doClick(): void {
    modalForm.open();
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

  function doPickerEnter(value: Date, close: () => void): void {
    date = value;
    updateRepr();
    close();
  }

  function doCalClick(): void {
    modalPicker.open();
  }

</script>

<div class="disp" bind:this={disp}>
  <span class="repr" on:click={doClick}>{repr}</span>
  <svg xmlns="http://www.w3.org/2000/svg" width="1.1em" class="calendar-icon" on:click={doCalClick}
    fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
</div>
<Modal bind:this={modalForm} let:close={close} screenOpacity="0.2">
  <DateForm date={new Date} bind:this={form} 
    onEnter={d => doFormEnter(d, close)} onCancel={close}/>
</Modal>
<Modal bind:this={modalPicker} let:close={close}>
  <DatePicker date={date} onCancel={close} onEnter={d => doPickerEnter(d, close)}/>
</Modal>

<style>
  .disp {
    display: inline-flex;
    justify-items: center;
  }

  .disp .repr {
    cursor: pointer;
  }

  .calendar-icon {
    color: #666;
    display: inline-block;
    margin-top: -3px;
    margin-left: 6px;
    cursor: pointer;
  }
</style>
