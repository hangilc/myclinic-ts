<script lang="ts">
  import type { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
  import { onMount } from "svelte";
  import type { Hoken } from "../../hoken";
  import { classify } from "@/lib/partition";
  import ShahokokuhoBox from "../../hoken-box/ShahokokuhoBox.svelte";
  import KoukikoureiBox from "../../hoken-box/KoukikoureiBox.svelte";
  import KouhiBox from "../../hoken-box/KouhiBox.svelte";

  export let init: () => Promise<Hoken[]>;
  export let onShahokokuhoSelect: (shahokokuho: Shahokokuho, usageCount: number) => void;
  export let onKoukikoureiSelect: (koukikourei: Koukikourei, usageCount: number) => void;
  export let onKouhiSelect: (kouhi: Kouhi, usageCount: number) => void;
  let shahokokuhoList: { shahokokuho: Shahokokuho; usageCount: number }[] = [];
  let koukikoureiList: { koukikourei: Koukikourei; usageCount: number }[] = [];
  let kouhiList: { kouhi: Kouhi; usageCount: number }[] = [];

  function mkClassified(list: Hoken[]): Record<string, Hoken[]> {
    const c = classify(list, (h) => h.slug);
    Object.values(c).forEach((list: Hoken[]) => {
      list.sort(
        (a: Hoken, b: Hoken) => -a.validFrom.localeCompare(b.validFrom)
      );
    });
    return c;
  }

  onMount(async () => {
    const classified = mkClassified(await init());
    if (classified.shahokokuho) {
      shahokokuhoList = classified.shahokokuho.map((h) => ({
        shahokokuho: h.asShahokokuho,
        usageCount: h.usageCount,
      }));
    } else {
      shahokokuhoList = [];
    }
    if (classified.koukikourei) {
      koukikoureiList = classified.koukikourei.map((h) => ({
        koukikourei: h.asKoukikourei,
        usageCount: h.usageCount,
      }));
    } else {
      koukikoureiList = [];
    }
    if (classified.kouhi) {
      kouhiList = classified.kouhi.map((h) => ({
        kouhi: h.asKouhi,
        usageCount: h.usageCount,
      }));
    } else {
      koukikoureiList = [];
    }
  });
</script>

<div>
  {#each shahokokuhoList as h (h.shahokokuho.shahokokuhoId)}
    <div class="shahokokuho box">
      <ShahokokuhoBox shahokokuho={h.shahokokuho} usageCount={h.usageCount} />
      <button on:click={() => onShahokokuhoSelect(h.shahokokuho, h.usageCount)}>選択</button>
    </div>
  {/each}
  {#each koukikoureiList as h (h.koukikourei.koukikoureiId)}
    <div class="koukikourei">
      <KoukikoureiBox koukikourei={h.koukikourei} usageCount={h.usageCount} />
      <button on:click={() => onKoukikoureiSelect(h.koukikourei, h.usageCount)}>選択</button>
    </div>
  {/each}
  {#each kouhiList as h (h.kouhi.kouhiId)}
    <div class="kouhi">
      <KouhiBox kouhi={h.kouhi} usageCount={h.usageCount} />
      <button on:click={() => onKouhiSelect(h.kouhi, h.usageCount)}>選択</button>
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
