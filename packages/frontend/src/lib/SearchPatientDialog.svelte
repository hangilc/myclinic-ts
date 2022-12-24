<script lang="ts">
  import type { Patient } from "myclinic-model";
  import { setFocus } from "./set-focus";
  import SurfaceModal from "./SurfaceModal.svelte";
  import SelectItem from "./SelectItem.svelte";
  import { pad } from "./pad";
  import { writable, type Writable } from "svelte/store";
  import api from "./api";

  export let destroy: () => void;
  export let title: string;
  export let onEnter: (selected: Patient) => void;
  export let onSingleResult: (result: Patient, destroy: () => void) => void = (
    _r,
    _d
  ) => {};
  export let enterButton: string = "選択";
  let searchText: string = "";
  let result: Patient[] = [];
  let selected: Writable<Patient | undefined> = writable(undefined);

  async function doSearch() {
    selected.set(undefined);
    const t = searchText.trim();
    if (t !== "") {
      result = await api.searchPatientSmart(t);
      if (result.length === 1) {
        selected.set(result[0]);
        onSingleResult(result[0], destroy);
      }
    }
  }

  function doEnter(): void {
    if ($selected != undefined) {
      destroy();
      onEnter($selected);
    }
  }
</script>

<SurfaceModal {destroy} {title}>
  <form on:submit|preventDefault={doSearch}>
    <input type="text" bind:value={searchText} use:setFocus />
    <button type="submit">検索</button>
  </form>
  <div class="result">
    {#each result as p (p.patientId)}
      <SelectItem {selected} data={p}>
        [{pad(p.patientId, 4, "0")}] {p.fullName()} ({p.fullYomi()})
      </SelectItem>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={$selected == undefined}
      >{enterButton}</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  form {
    margin: 6px;
    margin-left: 0;
  }

  .result {
    height: 10rem;
    width: 18rem;
    resize: vertical;
    overflow-y: auto;
    overflow-x: hidden;
    border: 1px solid gray;
    padding: 6px;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin: 10px 0 6px 0;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
