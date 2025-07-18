<script lang="ts">
  import { DateWrapper } from "myclinic-util";
  import Commands from "./workarea/Commands.svelte";
  import Link from "./workarea/Link.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import EditableDate from "@/lib/editable-date/EditableDate.svelte";

  export let destroy: () => void;
  export let validUpto: string | undefined;
  export let onEnter: (value: string | undefined) => void;
  export let onCancel: () => void;

  let date: Date | null = validUpto 
    ? DateWrapper.fromOnshiDate(validUpto).asDate()
    : null;


  function doCancel() {
    destroy();
    onCancel();
  }

  function doDelete() {
    destroy();
    onEnter(undefined);
  }

  function doEnter() {
    destroy();
    if( date == null ){
      onEnter(undefined);
    } else {
      let value = DateWrapper.fromDate(date).asOnshiDate();
      onEnter(value);
    }
  }
</script>

<Workarea>
  <Title>有効期限</Title>
  <div>
    <EditableDate bind:date={date} />
  </div>
  <Commands>
    <Link onClick={doDelete}>削除</Link>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>