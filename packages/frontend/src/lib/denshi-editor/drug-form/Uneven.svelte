<script lang="ts">
  import CheckCircle from "@/icons/CheckCircle.svelte";
  import XCircle from "@/icons/XCircle.svelte";
  import type { 不均等レコード } from "@/lib/denshi-shohou/presc-info";
  import { toHankaku } from "@/lib/zenkaku";
  import TrashLink from "../icons/TrashLink.svelte";
  import "../widgets/style.css";
  import SubmitLink from "../icons/SubmitLink.svelte";
  import CancelLink from "../icons/CancelLink.svelte";

  export let 不均等レコード: 不均等レコード | undefined;
  export let isEditing: boolean;
  let inputText: string = serialize(不均等レコード);

  if (inputText === "") {
    isEditing = true;
  }

  function doEnter() {
    try {
      不均等レコード = deserialize(inputText);
      isEditing = false;
    } catch (e) {
      alert(e);
      return;
    }
  }

  function doEdit() {
    inputText = serialize(不均等レコード);
    isEditing = true;
  }

  function doCancel() {
    inputText = serialize(不均等レコード);
    isEditing = false;
  }

  function serialize(r: 不均等レコード | undefined): string {
    if (r) {
      let parts: string[] = [r.不均等１回目服用量, r.不均等２回目服用量];
      [
        r.不均等３回目服用量,
        r.不均等４回目服用量,
        r.不均等５回目服用量,
      ].forEach((e) => {
        if (e) {
          parts.push(e);
        }
      });
      return parts.join("-");
    } else {
      return "";
    }
  }

  function deserialize(s: string): 不均等レコード | undefined {
    s = s.trim();
    if (s === "") {
      return undefined;
    } else {
      s = toHankaku(s);
      let parts: string[] = [];
      for (let e of s.split(/\s*-\s*/)) {
        let f = parseFloat(e);
        if (isNaN(f)) {
          throw new Error(`数値でありません: ${e}`);
        } else {
          parts.push(f.toString());
        }
      }
      if (parts.length < 2) {
        throw new Error(`分割数が少なすぎます（２つ以上必要）`);
      }
      return {
        不均等１回目服用量: parts[0],
        不均等２回目服用量: parts[1],
        不均等３回目服用量: parts[2],
        不均等４回目服用量: parts[3],
        不均等５回目服用量: parts[4],
      };
    }
  }

  function doDelete() {
    不均等レコード = undefined;
    isEditing = false;
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
  {#if isEditing}
    <form on:submit|preventDefault={doEnter} class="with-icons">
      <input type="text" bind:value={inputText} />
      <SubmitLink onClick={doEnter} />
      <CancelLink onClick={doCancel} />
      <TrashLink onClick={doDelete} />
    </form>
  {:else}
    <div on:click={doEdit} class="cursor-pointer with-icons">{inputText} <TrashLink onClick={doDelete} /></div>
  {/if}
</div>

<style>
</style>
