<script lang="ts">
  import { DateWrapper } from "myclinic-util";
  import Commands from "./workarea/Commands.svelte";
  import Link from "./workarea/Link.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";

  export let destroy: () => void;
  export let validUpto: { value: string | undefined };
  export let onEnter: () => void;

  let date: Date | null = validUpto.value 
    ? DateWrapper.fromOnshiDate(validUpto.value).asDate()
    : null;


  function doCancel() {
    destroy();
  }

  function doDelete() {
    destroy();
    validUpto.value = undefined;
    onEnter();
  }

  function doEnter() {
    destroy();
    onEnter();
  }

  function doFormChange() {
    if( date == null ){
      validUpto.value = undefined;
    } else {
      validUpto.value = DateWrapper.fromDate(date).asOnshiDate();
    }
  }
</script>

<Workarea>
  <Title>有効期限</Title>
  <div>
    <EditableDate bind:date={date} onChange={doFormChange}/>
  </div>
  <Commands>
    <Link onClick={doDelete}>削除</Link>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>