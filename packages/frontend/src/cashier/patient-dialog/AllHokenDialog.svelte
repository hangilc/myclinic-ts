<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Hoken } from "./hoken";
  import type { Kouhi, Koukikourei, Patient, Roujin, Shahokokuho } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import { classify } from "@/lib/partition";

  export let patient: Readable<Patient>;
  export let allHoken: Readable<Hoken[]>;
  export let ops: {
    goback: () => void,
  }

  $: console.log(allHoken);

  const classified: Record<string, Hoken[]> = classify($allHoken, h => h.hokenType);
  Object.values(classified).forEach((list: Hoken[]) => {
    list.sort((a: Hoken, b: Hoken) => - a.validFrom.localeCompare(b.validFrom))
  })
</script>

<SurfaceModal destroy={ops.goback} title="保険履歴" width="400px">
  <div>
    ({$patient.patientId}) {$patient.fullName(" ")}
  </div>
  {#each Object.keys(classified) as hokenName}
    {#each classified[hokenName] as hoken}
      <div>
        {hoken.rep}
      </div>
    {/each}
  {/each}
  <div class="commands">
    <button on:click={ops.goback}>閉じる</button>
  </div>

</SurfaceModal>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }
</style>