<script lang="ts">
  import type { Patient } from "myclinic-model";
  import { setFocus } from "./set-focus";
  import Dialog from "./Dialog.svelte";
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
  let enterButtonElement: HTMLButtonElement;

  async function doSearch() {
    selected.set(undefined);
    const t = searchText.trim();
    if (t !== "") {
      result = await api.searchPatientSmart(t);
      if (result.length === 1) {
        selected.set(result[0]);
        enterButtonElement.disabled = false;
        enterButtonElement.focus();
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

  function doKeyDown(_e: KeyboardEvent) {

  }
</script>

<Dialog {destroy} {title}>
  <form on:submit|preventDefault={doSearch}>
    <input
      type="text"
      bind:value={searchText}
      use:setFocus
      data-cy="search-text-input"
    />
    <button type="submit">検索</button>
  </form>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="result" on:keydown={doKeyDown}>
    {#each result as p (p.patientId)}
      <SelectItem {selected} data={p}>
        <span data-cy="search-result-item" data-patient-id={p.patientId}>
          [{pad(p.patientId, 4, "0")}] {p.fullName()} ({p.fullYomi()})
        </span>
      </SelectItem>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doEnter} disabled={$selected == undefined} bind:this={enterButtonElement}
      >{enterButton}</button
    >
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

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
