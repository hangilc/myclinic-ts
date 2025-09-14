<script lang="ts">
  import Commands from "./workarea/Commands.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import { 提供診療情報レコードEdit } from "../denshi-edit";
  import ClinicalInfoRecord from "./ClinicalInfoRecord.svelte";
  import Link from "./workarea/Link.svelte";

  export let info: 提供診療情報レコードEdit[] | undefined;
  export let destroy: () => void;
  export let update: (value: 提供診療情報レコードEdit[] | undefined) => void;

  function doClose() {
    destroy();
  }

  function doDelete(record: 提供診療情報レコードEdit): void {
    if( info !== undefined ){
      let bs = info.filter(r => r.id !== record.id);
      info = bs.length === 0 ? undefined : bs;
      update(info);
    }
  }

  function onChange(): void {
    update(info);
  }

  function doAdd(): void {
    if( info === undefined ){
      info = [];
    }
    info.push(提供診療情報レコードEdit.fromObject({ コメント: ""}));
    info = info;
    update(info);
  }
</script>

<Workarea>
  <Title>提供診療情報</Title>
  {#each info ?? [] as record (record.id)}
    <ClinicalInfoRecord bind:record onChange={onChange} onDelete={doDelete}/>
  {/each}
  <Commands>
    <Link onClick={doAdd}>追加</Link>
    <button on:click={doClose}>閉じる</button>
  </Commands>
</Workarea>
