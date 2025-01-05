<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "../disease-env";
  import EditShinryouDiseaseDialog from "./EditShinryouDiseaseDialog.svelte";
  import { cache } from "@/lib/cache";
  import {
    createFix,
    createFix as createShinryouFix,
    type Fix,
  } from "@/lib/shinryou-disease";

  export let env: Writable<DiseaseEnv | undefined>;

  function doAddDiseaseForShinryou(name: string) {
    const curEnv = $env;
    const patientId = curEnv?.patient?.patientId;
    const at = curEnv?.checkingDate;
    if (curEnv && patientId && at) {
      const d: EditShinryouDiseaseDialog = new EditShinryouDiseaseDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          title: "診療病名の追加",
          shinryouName: name,
          onEnter: async (item) => {
            let cur = await cache.getShinryouDiseases();
            cur = [...cur, item];
            await cache.setShinryouDiseases(cur);
            const ctx = curEnv.createShinryouContext(patientId, at);
            const fix = createFix(item, ctx);
            if (fix) {
              await fix.exec();
              await curEnv.updateCurrentList();
              await curEnv.updateAllList();
              await curEnv.checkDrugs();
            }
            await curEnv.checkShinryou();
            $env = curEnv;
          },
        },
      });
    }
  }

  async function doFix(fix: Fix) {
    await fix.exec();
    const cur = $env;
    if (cur) {
      await cur.updateCurrentList();
      await cur.updateAllList();
      await cur.checkDrugs();
      await cur.checkShinryou();
      $env = cur;
    }
  }

  function doSelectDiseaseForShinryou(name: string) {}
</script>

{#if $env}
  <div>
    {#each $env.shinryouWithoutMatchingDisease as s}
      <div class="without-matching-disease">
        <div>{s.name}</div>
        {#each s.fixes as fix}
          <div>
            <span class="fix-name">{fix.label}</span>
            <button on:click={() => doFix(fix)}>fix</button>
          </div>
        {/each}
        <div>
          <button on:click={() => doAddDiseaseForShinryou(s.name)}
            >病名追加</button
          >
          <button on:click={() => doSelectDiseaseForShinryou(s.name)}
            >病名選択</button
          >
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .without-matching-disease {
    font-size: 12px;
    color: red;
    border: 1px solid red;
    border-radius: 4px;
    margin: 4px 0;
    padding: 4px;
  }

  .without-matching-disease div + div {
    margin-top: 4px;
  }

  .fix-name {
    color: darkgreen;
  }
</style>
