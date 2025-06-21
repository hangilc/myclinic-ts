<script lang="ts">
  import type { 剤形区分 } from "@/lib/denshi-shohou/denshi-shohou";
  import SubmitIcon from "./icons/SubmitIcon.svelte";
  import CancelIcon from "./icons/CancelIcon.svelte";
  import { toHankaku } from "../zenkaku";
  import "./widgets/style.css";

  export let 剤形区分: 剤形区分;
  export let 調剤数量: number;
  export let isEditing: boolean;

  let inputText: string = 調剤数量.toString();

  function doEnter() {
    const d = parseInt(toHankaku(inputText.trim()));
    if (isNaN(d)) {
      alert("日数・回数が整数でありません。");
      return;
    }
    if (d <= 0) {
      alert("日数・回数が正の値でありません。");
      return;
    }
    調剤数量 = d;
    inputText = d.toString();
    isEditing = false;
  }

  function doCancel() {
    inputText = 調剤数量.toString();
    isEditing = false;
  }

  function doEdit() {
    inputText = 調剤数量.toString();
    isEditing = true;
  }

  function nissuuKaisuu(剤形区分: 剤形区分): string {
    return 剤形区分 === "内服" ? "日数" : "回数";
  }
</script>

<div>
  {#if isEditing}
    <div class="label">{nissuuKaisuu(剤形区分)}設定</div>
    <form on:submit|preventDefault={doEnter}>
      <input type="text" style="width:3rem" bind:value={inputText} />
      {nissuuKaisuu(剤形区分)}
      <SubmitIcon onClick={doEnter} />
      <CancelIcon onClick={doCancel} />
    </form>
  {:else}
    <div class="label">{nissuuKaisuu(剤形区分)}</div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={doEdit}>
      {調剤数量}{剤形区分 === "内服" ? "日分" : "回分"}
    </div>
  {/if}
</div>
