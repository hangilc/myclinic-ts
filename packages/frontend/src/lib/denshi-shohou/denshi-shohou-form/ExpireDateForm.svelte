<script lang="ts">
  import Trash from "@/icons/Trash.svelte";
  import XCircle from "@/icons/XCircle.svelte";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";
  import { DateWrapper } from "myclinic-util";

  export let expireDate: string | undefined;
  export let onDone: (expireDate: string | undefined) => void;
  export let onCancel: () => void;

  let date: Date | null = resolveDateFromExpireDate();

  function resolveDateFromExpireDate(): Date | null {
    if( expireDate === undefined ){
      return null;
    } else {
      return DateWrapper.fromOnshiDate(expireDate).asDate();
    }
  }

  function doChange() {
    if( date == null ){
      onDone(undefined);
    } else {
      onDone(DateWrapper.fromDate(date).asOnshiDate());
    }
  }
</script>
<div>
  <div style="font-weight:bold;">使用期限設定</div>
  <div>
    <EditableDate bind:date={date} onChange={doChange}/>
    <a href="javascript:void(0)" style="position:relative;top:3px;"
    on:click={() => onDone(undefined)}>
      <Trash />
    </a>
   <a href="javascript:void(0)" style="position:relative;top:3px;"
    on:click={onCancel}>
      <XCircle />
    </a>
  </div>
</div>