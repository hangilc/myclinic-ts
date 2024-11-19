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
  import type {
    DiseaseData,
    DiseaseEnterData,
    ShuushokugoMaster,
  } from "myclinic-model";
  import { extractDrugNames } from "./drugs-visit";
  import { hasMatchingDrugDisease, type DrugDisease } from "@/lib/drug-disease";
  import { cache } from "@/lib/cache";
  import { writable, type Writable } from "svelte/store";
  import SelectrDiseaseForDrugDialog from "./SelectrDiseaseForDrugDialog.svelte";
  import Drugs from "./Drugs.svelte";
  import EditDrugDiseaseDialog from "./EditDrugDiseaseDialog.svelte";
  import { DateWrapper } from "myclinic-util";

  const unsubs: (() => void)[] = [];
  let env: Writable<DiseaseEnv | undefined> = writable(undefined);
  let workarea: HTMLElement;
  let clear: () => void = () => {};
  let drugDiseases: DrugDisease[] = [];
  let drugsWithouMatchingDisease: {
    id: number;
    name: string;
    fixes: {
      pre: string[];
      name: string;
      post: string[];
    }[];
  }[] = [];
  let drugsWithouMatchingDiseaseIndex = 1;

  init();

  async function init() {
    drugDiseases = await cache.getDrugDiseases();
    console.log("drugDiseases", drugDiseases);
  }

  unsubs.push(
    currentPatient.subscribe(async (p) => {
      if (p == null) {
        clear();
        clear = () => {};
        drugsWithouMatchingDisease = [];
        $env = undefined;
      } else {
        $env = await DiseaseEnv.create(p);
        checkDrugs();
        doMode("current");
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  async function checkDrugs() {
    drugsWithouMatchingDisease = [];
    const texts = $env?.visits.flatMap((visit) => visit.texts) ?? [];
    const drugNames: string[] = extractDrugNames(texts);
    const diseaseNames: string[] =
      $env?.currentList?.map((disease) => {
        return disease.byoumeiMaster.name;
      }) ?? [];
    for (let drugName of drugNames) {
      const m = hasMatchingDrugDisease(drugName, diseaseNames, drugDiseases);
      if (m === true) {
        continue;
      } else {
        drugsWithouMatchingDisease.push({
          id: drugsWithouMatchingDiseaseIndex++,
          name: drugName,
          fixes: m,
        });
      }
    }
  }

  function fixName(fix: {
    pre: string[];
    name: string;
    post: string[];
  }): string {
    return [...fix.pre, fix.name, ...fix.post].join("");
  }

  async function doMode(mode: Mode) {
    clear();
    switch (mode) {
      case "current": {
        const b = new Current({
          target: workarea,
          props: {
            env,
            onSelect: (d: DiseaseData) => {
              env.update((optEnv) => {
                if (optEnv) {
                  optEnv.editTarget = d;
                }
                return optEnv;
              });
              // envValue.editTarget = d;
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
            env,
            // patientId: envValue.patient.patientId,
            // examples: envValue.examples,
            onEnter: async (data: DiseaseEnterData) => {
              const diseaseId: number = await api.enterDiseaseEx(data);
              const d: DiseaseData = await api.getDiseaseEx(diseaseId);
              env.update((optEnv) => {
                if (optEnv) {
                  optEnv.addDisease(d);
                }
                return optEnv;
              });
              // envValue.addDisease(d);
              checkDrugs();
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
            // diseases: envValue.currentList,
            env,
            onEnter: async (result: [number, string, string][]) => {
              const promises = result.map((r) => {
                const [diseaseId, date, reason] = r;
                return api.endDisease(diseaseId, parseSqlDate(date), reason);
              });
              await Promise.all(promises);
              $env?.removeFromCurrentList(result.map((d) => d[0]));
              doMode("tenki");
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      case "edit": {
        await $env?.fetchAllList();
        // await envValue.fetchAllList();
        const b = new Edit({
          target: workarea,
          props: {
            env,
            // diseases: env.allList ?? [],
            // editTarget: envValue.editTarget,
            onDelete: (diseaseId: number) => {
              env.update((optEnv) => {
                if (optEnv) {
                  optEnv.remove(diseaseId);
                  optEnv.editTarget = undefined;
                }
                return optEnv;
              });
              // envValue.remove(diseaseId);
              // envValue.editTarget = undefined;
              checkDrugs();
              doMode("edit");
            },
            onUpdate: (entered: DiseaseData) => {
              env.update((optEnv) => {
                if (optEnv) {
                  optEnv.updateDisease(entered);
                  optEnv.editTarget = undefined;
                }
                return optEnv;
              });
              // envValue.updateDisease(entered);
              // envValue.editTarget = undefined;
              checkDrugs();
              doMode("edit");
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      case "drugs": {
        const b: Drugs = new Drugs({
          target: workarea,
          props: {
            env,
            onChanged: async () => {
              drugDiseases = await cache.getDrugDiseases();
              checkDrugs();
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
          const dds = await cache.getDrugDiseases();
          dds.push(created);
          await api.setDrugDiseases(dds);
          cache.clearDrugDiseases();
          drugDiseases = dds;
          if (created.fix) {
            await addDiseaseByFix(created.fix);
          }
          checkDrugs();
        },
      },
    });
    // const d: AddDiseaseForDrugDialog = new AddDiseaseForDrugDialog({
    //   target: document.body,
    //   props: {
    //     destroy: () => d.$destroy(),
    //     drugName,
    //     env,
    //     onAdded: (d: DiseaseData) => {
    //       env.update((optEnv) => {
    //         if (optEnv) {
    //           optEnv.addDisease(d);
    //         }
    //         return optEnv;
    //       });
    //       checkDrugs();
    //     },
    //     onRegistered: () => checkDrugs(),
    //   },
    // });
  }

  function doSelectDiseaseForDrug(drugName: string) {
    const d: SelectrDiseaseForDrugDialog = new SelectrDiseaseForDrugDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        drugName,
        env,
        onSelected: async () => {
          drugDiseases = await cache.getDrugDiseases();
          checkDrugs();
        },
      },
    });
  }

  async function addDiseaseByFix(fix: {
    pre: string[];
    name: string;
    post: string[];
  }): Promise<boolean> {
    const at = $env?.visits[0].visitedAt.substring(0, 10);
    const patientId = $env?.patient.patientId;
    if (at && patientId) {
      const adjList: ShuushokugoMaster[] = [];
      [...fix.pre, ...fix.post].forEach(async (name) => {
        const m = await api.resolveShuushokugoMasterByName(name, at);
        if (!m) {
          alert(`invalid name: ${name}`);
          return;
        } else {
          adjList.push(m);
        }
      });
      const disease = await api.resolveByoumeiMasterByName(fix.name, at);
      if (!disease) {
        alert(`invalid name: ${name}`);
        return false;
      }
      const data: DiseaseEnterData = {
        patientId: patientId,
        byoumeicode: disease.shoubyoumeicode,
        startDate: at,
        adjCodes: adjList.map((m) => m.shuushokugocode),
      };
      const diseaseId: number = await api.enterDiseaseEx(data);
      const d: DiseaseData = await api.getDiseaseEx(diseaseId);
      env.update((optEnv) => {
        if (optEnv) {
          optEnv.addDisease(d);
        }
        return optEnv;
      });
      return true;
    } else {
      return false;
    }
  }

  async function doFix(fix: { pre: string[]; name: string; post: string[] }) {
    if (await addDiseaseByFix(fix)) {
      checkDrugs();
    }
  }
</script>

<RightBox title="病名" display={!!env} dataCy="disease-box">
  <div class="workarea" bind:this={workarea} />
  <div class="drug-without-matching-disease-wrapper">
    {#each drugsWithouMatchingDisease as d (d.id)}
      <div class="drug-without-matching-disease">
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
    <a
      href="javascript:void(0)"
      on:click={() => doMode("drugs")}
      data-cy="edit-link">薬剤</a
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

  .fix-name {
    color: darkgreen;
  }

  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
</style>
