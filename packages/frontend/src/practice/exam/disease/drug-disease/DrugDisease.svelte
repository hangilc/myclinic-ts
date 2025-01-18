<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { DiseaseEnv } from "../disease-env";
  import api from "@/lib/api";
  import SelectrDiseaseForDrugDialog from "./SelectDiseaseForDrugDialog.svelte";
  import EditDrugDiseaseDialog from "./EditDrugDiseaseDialog.svelte";
  import { DateWrapper } from "myclinic-util";
  import type { DrugDisease } from "@/lib/drug-disease";
  import { cache } from "@/lib/cache";
  import { enterDiseaseByNames } from "../enter-disease-by-names";

  export let env: Writable<DiseaseEnv | undefined>;

  function fixName(fix: {
    pre: string[];
    name: string;
    post: string[];
  }): string {
    return [...fix.pre, fix.name, ...fix.post].join("");
  }

  async function doFix(fix: { pre: string[]; name: string; post: string[] }) {
    const diseaseEntered = await addDiseaseByFix(fix);
    const cur = $env;
    if (cur) {
      if (diseaseEntered) {
        await cur.updateCurrentList();
        await cur.updateAllList();
        await cur.checkShinryou();
      }
      await cur.checkDrugs();
      $env = cur;
    }
  }

  async function addDiseaseByFix(fix: {
    pre: string[];
    name: string;
    post: string[];
  }): Promise<boolean> {
    const { pre, name, post } = fix;
    const curEnv = $env;
    const at = curEnv?.checkingDate;
    const patientId = $env?.patient.patientId;
    if (curEnv && at && patientId) {
      const entered = await enterDiseaseByNames(patientId, at, name, [...pre, ...post]);
      if( typeof entered === "string" ){
        alert(entered);
        console.error(entered);
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  async function doAddDiseaseForDrug(drugName: string) {
    const d: EditDrugDiseaseDialog = new EditDrugDiseaseDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "薬剤病名の追加",
        item: {
          drugName,
          diseaseName: "",
        },
        at: DateWrapper.from(new Date()).asSqlDate(),
        onEnter: async (created: DrugDisease) => {
          let cur = await cache.getDrugDiseases();
          cur = [...cur, created];
          await api.setDrugDiseases(cur);
          cache.clearDrugDiseases();
          let e = $env;
          if (created.fix) {
            await addDiseaseByFix(created.fix);
            if (e) {
              await e.updateCurrentList();
              await e.updateAllList();
            }
          }
          if (e) {
            await e.checkDrugs();
            await e.checkShinryou();
            $env = e;
          }
        },
      },
    });
  }

  function doSelectDiseaseForDrug(drugName: string) {
    const d: SelectrDiseaseForDrugDialog = new SelectrDiseaseForDrugDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        drugName,
        env,
        onSelected: async () => {
          let e = $env;
          if (e) {
            await e.checkDrugs();
            $env = e;
          }
        },
      },
    });
  }
</script>

{#if $env}
  <div>
    {#each $env.drugsWithoutMatchingDisease as d (d.id)}
      <div class="without-matching-disease">
        <div>{d.name}</div>
        {#each d.fixes as fix}
          <div>
            <span class="fix-name">{fixName(fix)}</span>
            <button on:click={() => doFix(fix)}>fix</button>
          </div>
        {/each}
        <div>
          <button on:click={() => doAddDiseaseForDrug(d.name)}>病名追加</button>
          <button on:click={() => doSelectDiseaseForDrug(d.name)}
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
