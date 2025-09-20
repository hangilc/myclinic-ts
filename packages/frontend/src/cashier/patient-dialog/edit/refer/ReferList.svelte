<script lang="ts">
  import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
  import type { Hoken } from "../../hoken";
  import ShahokokuhoBox from "../../hoken-box/ShahokokuhoBox.svelte";
  import KoukikoureiBox from "../../hoken-box/KoukikoureiBox.svelte";
  import KouhiBox from "../../hoken-box/KouhiBox.svelte";

  export let init: () => Promise<Hoken[]>;
  export let onShahokokuhoSelect: (
    shahokokuho: Shahokokuho,
    usageCount: number,
  ) => void;
  export let onKoukikoureiSelect: (
    koukikourei: Koukikourei,
    usageCount: number,
  ) => void;
  export let onKouhiSelect: (kouhi: Kouhi, usageCount: number) => void;
  let list: Hoken[] = [];

  initList();

  async function initList() {
    list = await init();
  }


</script>

<div>
  {#each list as hoken (hoken.key)}
    <div>
      {#if hoken.slug === "shahokokuho"}
        <div class="shahokokuho box">
          <ShahokokuhoBox
            shahokokuho={hoken.asShahokokuho}
            usageCount={hoken.usageCount}
          />
          <button
            on:click={() =>
              onShahokokuhoSelect(hoken.asShahokokuho, hoken.usageCount)}
            >選択</button
          >
        </div>
      {:else if hoken.slug === "koukikourei"}
        <div class="koukikourei box">
          <KoukikoureiBox
            koukikourei={hoken.asKoukikourei}
            usageCount={hoken.usageCount}
          />
          <button
            on:click={() =>
              onKoukikoureiSelect(hoken.asKoukikourei, hoken.usageCount)}
            >選択</button
          >
        </div>
      {:else if hoken.slug === "kouhi"}
        <div class="kouhi box">
          <KouhiBox kouhi={hoken.asKouhi} usageCount={hoken.usageCount} />
          <button on:click={() => onKouhiSelect(hoken.asKouhi, hoken.usageCount)}
            >選択</button
          >
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .box {
    border-style: solid;
    border-width: 2px;
    border-radius: 6px;
    margin-bottom: 4px;
    padding: 4px;
  }

  .shahokokuho {
    border-color: blue;
  }

  .koukikourei {
    border-color: orange;
  }

  .kouhi {
    border-color: gray;
  }
</style>
