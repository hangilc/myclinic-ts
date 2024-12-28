<script lang="ts">
  import { DateWrapper } from "myclinic-util";
  import EditableDate from "../editable-date/EditableDate.svelte";

  export let kigen: string | undefined;
  export let onEnter: (value: string | undefined) => void;
  let date: Date | null;

  $: date = dateOfKigen(kigen)

  function dateOfKigen(kigen: string | undefined): Date | null {
    if( kigen == undefined ){
      return null;
    } else {
      return DateWrapper.fromOnshiDate(kigen).asDate();
    }
  }

  function onChange() {
    if( date == null ){
      onEnter(undefined);
    } else {
      onEnter(DateWrapper.from(date).asOnshiDate());
    }
  }

  function doClear() {
    onEnter(undefined);
  }
</script>
<div style="border:1px solid gray;border-radius:4px;padding:10px;margin:4px 0;">
  有効期限：<EditableDate bind:date={date} onChange={onChange} />
  <a href="javascript:void(0)" on:click={doClear}>クリア</a>
</div>