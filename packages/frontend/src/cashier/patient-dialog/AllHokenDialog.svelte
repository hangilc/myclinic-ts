<script lang="ts">
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import type { Hoken } from "./hoken";
  import type {
    Kouhi,
    Koukikourei,
    Patient,
    Roujin,
    Shahokokuho,
  } from "myclinic-model";
  import type { Readable } from "svelte/store";
  import { classify } from "@/lib/partition";

  export let patient: Readable<Patient>;
  export let allHoken: Readable<Hoken[]>;
  export let ops: {
    goback: () => void;
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
        <div class={`hoken-box ${hoken.hokenType}`}>
          <div>{hoken.rep}</div>
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
    max-height: 400px;
    overflow-y: auto;
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
  }
</style>
