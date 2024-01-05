<script lang="ts">
  import type { Koukikourei, Shahokokuho } from "myclinic-model";
  import { onMount } from "svelte";
  import type { Hoken } from "../../hoken";
  import { classify } from "@/lib/partition";
  import ShahokokuhoBox from "../../hoken-box/ShahokokuhoBox.svelte";
  import KoukikoureiBox from "../../hoken-box/KoukikoureiBox.svelte";

  export let init: () => Promise<Hoken[]>;
  let shahokokuhoList: { shahokokuho: Shahokokuho; usageCount: number }[] = [];
  let koukikoureiList: { koukikourei: Koukikourei; usageCount: number }[] = [];

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
  });
</script>

<div class="wrapper">
  {#each shahokokuhoList as h (h.shahokokuho.shahokokuhoId) }
    <div class="shahokokuho"><ShahokokuhoBox shahokokuho={h.shahokokuho} usageCount={h.usageCount}/></div>
  {/each}
  {#each koukikoureiList as h (h.koukikourei.koukikoureiId) }
  <div class="koukikourei"><KoukikoureiBox koukikourei={h.koukikourei} usageCount={h.usageCount}/></div>
  {/each}
</div>

<style>
  .wrapper {
    width: 300px;
    height: 342px;
    overflow: auto;
  }

  .shahokokuho {
    border-color: blue;
  }

  .koukikourei {
    border-color: orange;
  }

  /* .kouhi {
    border-color: gray;
  } */


</style>
