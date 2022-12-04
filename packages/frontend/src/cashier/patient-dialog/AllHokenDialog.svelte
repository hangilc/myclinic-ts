<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Hoken } from "./hoken";
  import type { Kouhi, Koukikourei, Patient, Shahokokuho } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import { classify } from "@/lib/partition";
  import ShahokokuhoBox from "./hoken-box/ShahokokuhoBox.svelte";
  import KoukikoureiBox from "./hoken-box/KoukikoureiBox.svelte";
  import RoujinBox from "./hoken-box/RoujinBox.svelte";
  import KouhiBox from "./hoken-box/KouhiBox.svelte";

  export let patient: Readable<Patient>;
  export let allHoken: Readable<Hoken[]>;
  export let ops: {
    goback: () => void,
    moveToShahokokuhoEdit: (h: Shahokokuho) => void,
    moveToKoukikoureiEdit: (h: Koukikourei) => void,
    moveToKouhiEdit: (h: Kouhi) => void,
  };

  let classified = {} as Record<string, Hoken[]>;

  allHoken.subscribe((list) => {
    classified = classify(list, (h) => h.hokenType);
    Object.values(classified).forEach((list: Hoken[]) => {
      list.sort(
        (a: Hoken, b: Hoken) => -a.validFrom.localeCompare(b.validFrom)
      );
    });
  });
</script>

<SurfaceModal destroy={ops.goback} title="保険履歴" width="400px">
  <div>
    ({$patient.patientId}) {$patient.fullName(" ")}
  </div>
  <div class="hoken-list">
    {#each Object.keys(classified) as hokenName}
      {#each classified[hokenName] as hoken (hoken.key)}
        {@const hokenType = hoken.hokenType}
        {@const usageCount = hoken.usageCount}
        <div class={`hoken-box ${hokenType}`}>
          {#if hokenType === "shahokokuho"}
            <ShahokokuhoBox shahokokuho={hoken.asShahokokuho} {usageCount} 
            onEdit={ops.moveToShahokokuhoEdit}/>
          {:else if hokenType === "koukikourei"}
            <KoukikoureiBox koukikourei={hoken.asKoukikourei} {usageCount} 
            onEdit={ops.moveToKoukikoureiEdit}/>
          {:else if hokenType === "roujin"}
            <RoujinBox roujin={hoken.asRoujin} {usageCount} />
          {:else if hokenType === "kouhi"}
            <KouhiBox kouhi={hoken.asKouhi} {usageCount} 
            onEdit={ops.moveToKouhiEdit}/>
          {/if}
        </div>
      {/each}
    {/each}
  </div>
  <div class="commands">
    <button on:click={ops.goback}>閉じる</button>
  </div>
</SurfaceModal>

<style>
  .hoken-box {
    border-style: solid;
    border-width: 2px;
    border-radius: 6px;
    margin-bottom: 4px;
    padding: 4px;
  }

  .hoken-list {
    max-height: 500px;
    overflow-y: auto;
    padding: 6px 0;
  }

  .hoken-box.shahokokuho {
    border-color: blue;
  }

  .hoken-box.koukikourei {
    border-color: orange;
  }

  .hoken-box.roujin {
    border-color: yellow;
  }

  .hoken-box.kouhi {
    border-color: gray;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }
</style>
