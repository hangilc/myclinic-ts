<script lang="ts">
  import Add from "./add/Add.svelte";
  import Current from "./Current.svelte";
  import Tenki from "./Tenki.svelte";
  import Edit from "./edit/Edit.svelte";
  import { currentPatient } from "../exam-vars";
  import { onDestroy } from "svelte";
  import RightBox from "../RightBox.svelte";
  import { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";
  import api from "@/lib/api";
  import { parseSqlDate } from "@/lib/util";
  import type { DiseaseData, DiseaseEnterData } from "myclinic-model";
  import { extractDrugNames } from "./drugs-visit";
  import { hasMatchingDrugDisease, type DrugDisease } from "@/lib/drug-disease";
  import { cache } from "@/lib/cache";
  import AddDiseaseForDrugDialog from "./AddDiseaseForDrugDialog.svelte";
  import RegisterDiseaseForDrugDialog from "./RegisterDiseaseForDrugDialog.svelte";

  const unsubs: (() => void)[] = [];
  let env: DiseaseEnv | undefined = undefined;
  let workarea: HTMLElement;
  let clear: () => void = () => {};
  let drugDiseases: DrugDisease[] = [];
  let drugsWithouMatchingDisease: { id: number; name: string }[] = [];
  let drugsWithouMatchingDiseaseIndex = 1;

  init();

  async function init() {
    drugDiseases = await cache.getDrugDiseases();
  }

  unsubs.push(
    currentPatient.subscribe(async (p) => {
      if (p == null) {
        clear();
        clear = () => {};
        env = undefined;
      } else {
        env = await DiseaseEnv.create(p);
        checkDrugs();
        doMode("current");
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  async function checkDrugs() {
    if (env) {
      const drugNames: string[] = extractDrugNames(env.lastVisit?.texts ?? []);
      const diseaseNames: string[] = env.currentList.map((disease) => {
        return disease.byoumeiMaster.name;
      });
      drugsWithouMatchingDisease = [];
      for (let drugName of drugNames) {
        if (!hasMatchingDrugDisease(drugName, diseaseNames, drugDiseases)) {
          drugsWithouMatchingDisease.push({
            id: drugsWithouMatchingDiseaseIndex++,
            name: drugName,
          });
        }
      }
    }
  }

  async function doMode(mode: Mode) {
    if (env == null) {
      return;
    }
    const envValue = env;
    clear();
    switch (mode) {
      case "current": {
        const b = new Current({
          target: workarea,
          props: {
            list: env.currentList,
            onSelect: (d: DiseaseData) => {
              envValue.editTarget = d;
              doMode("edit");
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      case "add": {
        const b = new Add({
          target: workarea,
          props: {
            patientId: envValue.patient.patientId,
            examples: envValue.examples,
            onEnter: async (data: DiseaseEnterData) => {
              const diseaseId: number = await api.enterDiseaseEx(data);
              const d: DiseaseData = await api.getDiseaseEx(diseaseId);
              envValue.addDisease(d);
              doMode("add");
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      case "tenki": {
        const b = new Tenki({
          target: workarea,
          props: {
            diseases: envValue.currentList,
            onEnter: async (result: [number, string, string][]) => {
              const promises = result.map((r) => {
                const [diseaseId, date, reason] = r;
                return api.endDisease(diseaseId, parseSqlDate(date), reason);
              });
              await Promise.all(promises);
              envValue.removeFromCurrentList(result.map((d) => d[0]));
              doMode("tenki");
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      case "edit": {
        await envValue.fetchAllList();
        const b = new Edit({
          target: workarea,
          props: {
            diseases: env.allList ?? [],
            editTarget: envValue.editTarget,
            onDelete: (diseaseId: number) => {
              envValue.remove(diseaseId);
              envValue.editTarget = undefined;
              doMode("edit");
            },
            onUpdate: (entered: DiseaseData) => {
              envValue.updateDisease(entered);
              envValue.editTarget = undefined;
              doMode("edit");
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      default: {
        break;
      }
    }
  }

  async function doAddDiseaseForDrug(drugName: string) {
    if (env?.lastVisit) {
      const d: AddDiseaseForDrugDialog = new AddDiseaseForDrugDialog({
        target: document.body,
        props: {
          destroy: () => d.$destroy(),
          drugName,
          at: env.lastVisit.visitedAt.substring(0, 10),
          patientId: env.patient.patientId,
          onAdded: (d: DiseaseData) => {
            env?.addDisease(d);
          },
          onRegistered: () => checkDrugs(),
        },
      });
    }
  }

  async function doRegisterDiseaseForDrug(drugName: string) {
    const d: RegisterDiseaseForDrugDialog = new RegisterDiseaseForDrugDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        drugName,
        onRegistered: () => {
          checkDrugs();
        }
      }
    })
  }
</script>

<RightBox title="病名" display={!!env} dataCy="disease-box">
  <div class="workarea" bind:this={workarea} />
  <div class="drug-without-matching-disease-wrapper">
    {#each drugsWithouMatchingDisease as d (d.id)}
      <div class="drug-without-matching-disease">
        <div>{d.name}</div>
        <div>
          <button on:click={() => doAddDiseaseForDrug(d.name)}>病名追加</button>
          <button on:click={() => doRegisterDiseaseForDrug(d.name)}>病名登録</button>
        </div>
      </div>
    {/each}
  </div>
  <div class="commands">
    <a
      href="javascript:void(0)"
      on:click={() => doMode("current")}
      data-cy="current-link">現行</a
    >
    <a
      href="javascript:void(0)"
      on:click={() => doMode("add")}
      data-cy="add-link">追加</a
    >
    <a
      href="javascript:void(0)"
      on:click={() => doMode("tenki")}
      data-cy="tenki-link">転機</a
    >
    <a
      href="javascript:void(0)"
      on:click={() => doMode("edit")}
      data-cy="edit-link">編集</a
    >
  </div>
</RightBox>

<style>
  .workarea {
    margin-top: 6px;
  }

  .drug-without-matching-disease {
    font-size: 12px;
    color: red;
    border: 1px solid red;
    border-radius: 4px;
    margin: 4px 0;
    padding: 4px;
  }

  .drug-without-matching-disease div + div {
    margin-top: 4px;
  }

  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
</style>
