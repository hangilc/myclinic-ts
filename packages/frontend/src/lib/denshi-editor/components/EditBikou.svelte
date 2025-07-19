<script lang="ts">
  import Commands from "./workarea/Commands.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import { 備考レコードEdit } from "../denshi-edit";
  import BikouRecord from "./BikouRecord.svelte";
  import Link from "./workarea/Link.svelte";

  export let bikou: 備考レコードEdit[] | undefined;
  export let destroy: () => void;
  export let update: (value: 備考レコードEdit[] | undefined) => void;

  function doClose() {
    destroy();
  }

  function doDelete(record: 備考レコードEdit): void {
    if( bikou !== undefined ){
      let bs = bikou.filter(r => r.id !== record.id);
      bikou = bs.length === 0 ? undefined : bs;
      update(bikou);
    }
  }

  function onChange(): void {
    update(bikou);
  }

  function doAdd(): void {
    if( bikou === undefined ){
      bikou = [];
    }
    bikou.push(備考レコードEdit.fromObject({ 備考: ""}));
    update(bikou);
  }
</script>

<Workarea>
  <Title>備考</Title>
  {#each bikou ?? [] as record (record.id)}
    <BikouRecord bind:record onChange={onChange} onDelete={doDelete}/>
  {/each}
  <Commands>
    <Link onClick={doAdd}>追加</Link>
    <button on:click={doClose}>閉じる</button>
  </Commands>
</Workarea>
