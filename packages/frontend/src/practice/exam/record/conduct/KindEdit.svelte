<script lang="ts">
  import api from "@/lib/api";
  import {
    ConductKind,
    ConductKindObject,
    type ConductEx,
    type ConductKindType,
  } from "myclinic-model";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";

  export let conduct: ConductEx;
  export let onClose: () => void;
  let show = false;
  let selected: Writable<ConductKindType> = writable(
    ConductKindObject.fromTag(conduct.kind)
  );

  export function open(): void {
    show = true;
  }

  function close(): void {
    show = false;
    onClose();
  }

  async function doEnter() {
    const kind = $selected;
    await api.updateConduct({
      conductId: conduct.conductId,
      visitId: conduct.visitId,
      kindStore: kind.code,
    });
    close();
  }
</script>

{#if show}
  <div class="top">
    <div class="title">処置種類編集</div>
    <div class="select">
      {#each Object.keys(ConductKind) as kindKey}
        {@const kind = ConductKindObject.fromKeyString(kindKey)}
        <SelectItem {selected} data={kind}>
          {kind.rep}
        </SelectItem>
      {/each}
    </div>
    <div class="commands">
      <button on:click={doEnter}>入力</button>
      <button on:click={close}>キャンセル</button>
    </div>
  </div>
{/if}

<style>
  .top {
    margin: 10px 0;
    border: 1px solid gray;
    padding: 10px;
  }

  .title {
    font-weight: bold;
    margin-bottom: 10px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .commands :global(button) {
    margin-left: 4px;
  }
</style>
