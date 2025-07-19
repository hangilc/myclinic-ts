<script lang="ts">
  import Commands from "./workarea/Commands.svelte";
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import { 検査値データ等レコードEdit } from "../denshi-edit";
  import ClinicalInfoRecord from "./ClinicalInfoRecord.svelte";
  import Link from "./workarea/Link.svelte";
  import ExamInfoRecord from "./ExamInfoRecord.svelte";

  export let info: 検査値データ等レコードEdit[] | undefined;
  export let destroy: () => void;
  export let update: (value: 検査値データ等レコードEdit[] | undefined) => void;

  function doClose() {
    destroy();
  }

  function doDelete(record: 検査値データ等レコードEdit): void {
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
    info.push(検査値データ等レコードEdit.fromObject({ "検査値データ等": ""}));
    info = info;
    update(info);
  }
</script>

<Workarea>
  <Title>検査情報</Title>
  {#each info ?? [] as record (record.id)}
    <ExamInfoRecord bind:record onChange={onChange} onDelete={doDelete}/>
  {/each}
  <Commands>
    <Link onClick={doAdd}>追加</Link>
    <button on:click={doClose}>閉じる</button>
  </Commands>
</Workarea>
