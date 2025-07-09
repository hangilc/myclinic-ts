<script lang="ts">
  import type { 薬品情報Wrapper } from "../denshi-tmpl";
  import DrugNameField from "./DrugNameField.svelte";
  import Commands from "./workarea/Commands.svelte";
import Title from "./workarea/Title.svelte";
import Workarea from "./workarea/Workarea.svelte";

  export let destroy: () => void;
  export let drug: 薬品情報Wrapper;
  export let at: string;
  export let onChange: () => void;
  let data = drug.clone();

  let isEdigintName = drug.data.薬品レコード.薬品コード === "";

  function doCancel() {
    destroy();
  }

  function doEnter() {
    drug.assign(data);
    destroy();
    onChange();
  }
</script>

<Workarea>
  <Title>薬品編集</Title>
  <DrugNameField drug={data} {at} bind:isEditing={isEdigintName} {onChange} />
  <Commands>
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>