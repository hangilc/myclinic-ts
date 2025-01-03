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
  import {
    type DiseaseData,
    type DiseaseEnterData,
    type ShuushokugoMaster,
  } from "myclinic-model";
  import { extractDrugNames } from "./drugs-visit";
  import { hasMatchingDrugDisease, type DrugDisease } from "@/lib/drug-disease";
  import { cache } from "@/lib/cache";
  import { writable, type Writable } from "svelte/store";
  import SelectrDiseaseForDrugDialog from "./SelectrDiseaseForDrugDialog.svelte";
  import Drugs from "./Drugs.svelte";
  import EditDrugDiseaseDialog from "./EditDrugDiseaseDialog.svelte";
  import { DateWrapper } from "myclinic-util";
  import {
    hasMatchingShinryouDiseases,
    type ShinryouDisease,
  } from "@/lib/shinryou-disease";
  import EditShinryouDiseaseDialog from "./EditShinryouDiseaseDialog.svelte";
  import { diseaseDeleted, diseaseEntered, diseaseUpdated } from "@/app-events";
  import Shinryou from "./Shinryou.svelte";
  import type { number } from "valibot";

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
  let shinryouWithoutMatchingDisease: {
    name: string;
    fixes: {
      label: string;
      exec: () => Promise<void>;
    }[];
  }[] = [];
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
        drugsWithouMatchingDisease = [];
        shinryouWithoutMatchingDisease = [];
        $env = undefined;
      } else {
        $env = await DiseaseEnv.create(p);
        checkDrugs();
        await checkShinryou();
        doMode("current");
      }
    })
    // diseaseEntered.subscribe(async (d) => {
    //   if (d) {
    //     update();
    //   }
    // }),
    // diseaseUpdated.subscribe(async (d) => {
    //   if (d) {
    //     update();
    //   }
    // }),
    // diseaseDeleted.subscribe(async (d) => {
    //   if (d) {
    //     update();
    //   }
    // })
  );

  async function update() {
    const patient = $currentPatient;
    if (patient) {
      $env = await DiseaseEnv.create(patient);
      checkDrugs();
      await checkShinryou();
      doMode("current");
    }
  }

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

  async function checkShinryou() {
    shinryouWithoutMatchingDisease = [];
    const diseaseNames: string[] =
      $env?.currentList?.map((disease) => {
        return disease.byoumeiMaster.name;
      }) ?? [];
    const shinryouMap: Record<
      string,
      {
        fixes: {
          label: string;
          exec: () => Promise<void>;
        }[];
      }
    > = {};
    $env?.visits.forEach((visit) => {
      visit.shinryouList.forEach((shinryou) => {
        const shinryouName = shinryou.master.name;
        shinryouMap[shinryouName] = { fixes: [] };
      });
    });
    const shinryouNames = Object.keys(shinryouMap);
    const shinryouDiseases: ShinryouDisease[] =
      await cache.getShinryouDiseases();
    const ctx = createContext(
      $env?.patient.patientId ?? 0,
      DateWrapper.from(new Date()).asSqlDate()
    );
    shinryouWithoutMatchingDisease = [];
    for (let shinryouName of shinryouNames) {
      const m = hasMatchingShinryouDiseases(
        shinryouName,
        diseaseNames,
        shinryouDiseases,
        ctx
      );
      if (m === true) {
        // nop;
      } else {
        const fixes = m;
        shinryouWithoutMatchingDisease.push({ name: shinryouName, fixes });
      }
    }
    shinryouWithoutMatchingDisease = shinryouWithoutMatchingDisease;
  }

  function fixName(fix: {
    pre: string[];
    name: string;
    post: string[];
  }): string {
    return [...fix.pre, fix.name, ...fix.post].join("");
  }

  async function doAddDisease(data: DiseaseEnterData) {
    const diseaseId: number = await api.enterDiseaseEx(data);
    const d: DiseaseData = await api.getDiseaseEx(diseaseId);
    env.update((optEnv) => {
      if (optEnv) {
        optEnv.addDisease(d);
      }
      return optEnv;
    });
  }

  async function doTenkiEnter(result: [number, string, string][]) {
    const promises = result.map((r) => {
      const [diseaseId, date, reason] = r;
      return api.endDisease(diseaseId, parseSqlDate(date), reason);
    });
    await Promise.all(promises);
    env.update((orig) => {
      if( orig ){
        orig.removeFromCurrentList(result.map((d) => d[0]));
      }
      return orig;
    });
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
            onEnter: async (data: DiseaseEnterData) => {
              const diseaseId: number = await api.enterDiseaseEx(data);
              const d: DiseaseData = await api.getDiseaseEx(diseaseId);
              env.update((optEnv) => {
                if (optEnv) {
                  optEnv.addDisease(d);
                }
                return optEnv;
              });
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
        const b = new Edit({
          target: workarea,
          props: {
            env,
            onDelete: (diseaseId: number) => {
              env.update((optEnv) => {
                if (optEnv) {
                  optEnv.remove(diseaseId);
                  optEnv.editTarget = undefined;
                }
                return optEnv;
              });
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
            onChanged: async () => {
              drugDiseases = await cache.getDrugDiseases();
              checkDrugs();
            },
          },
        });
        clear = () => b.$destroy();
        break;
      }
      case "shinryou": {
        const b: Shinryou = new Shinryou({
          target: workarea,
          props: {
            onChanged: async () => {
              await checkShinryou();
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
      await api.enterDiseaseEx(data);
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

  function createContext(
    patientId: number,
    at: string
  ): {
    enterDisease: (diseaseName: string, adjNames: string[]) => Promise<void>;
  } {
    async function enterDisease(
      diseaseName: string,
      adjNames: string[]
    ): Promise<void> {
      const dmaster = await api.resolveByoumeiMasterByName(diseaseName, at);
      if (!dmaster) {
        alert(`不明な病名：${diseaseName}`);
        throw new Error(`no such byoumei: ${diseaseName}`);
      }
      const amasters = await Promise.all(
        adjNames.map((adjName) =>
          api.resolveShuushokugoMasterByName(adjName, at)
        )
      );
      const adjCodes: number[] = [];
      for (let m of amasters) {
        if (!m) {
          alert("不明の病名修飾語");
          throw new Error("invalid disease adj");
        }
        adjCodes.push(m.shuushokugocode);
      }
      const data: DiseaseEnterData = {
        patientId,
        byoumeicode: dmaster.shoubyoumeicode,
        startDate: at,
        adjCodes,
      };
      await api.enterDiseaseEx(data);
    }
    return { enterDisease };
  }

  function doAddDiseaseForShinryou(name: string) {
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
          if (item.kind === "disease-check") {
            if (item.fix) {
              const patientId = $env?.patient.patientId;
              if (patientId) {
                const dname = item.fix.diseaseName;
                const anames = item.fix.adjNames;
                const at = DateWrapper.from(new Date()).asSqlDate();
                const ctx = createContext(patientId, at);
                await ctx.enterDisease(dname, anames);
              }
            }
          }
          checkShinryou();
        },
      },
    });
  }

  function doSelectDiseaseForShinryou(name: string) {}

  function doChangeMode(mode: Mode) {
    env.update((orig) => {
      if (orig) {
        orig.mode = mode;
      }
      return orig;
    });
  }
</script>

{#if $currentPatient !== undefined && $env !== undefined}
  <RightBox title="病名" display={true}>
    <div style="margin-top:6px;">
      {#if $env.mode === "current"}
        <Current {env} onSelect={(d) => {}} />
      {:else if $env.mode === "add"}
        <Add {env} onEnter={doAddDisease} />
      {:else if $env.mode === "tenki"}
        <Tenki {env} onEnter={doTenkiEnter} />
      {:else if $env.mode === "edit"}
        EDIT
      {:else if $env.mode === "drugs"}
        DRUGS
      {:else if $env.mode === "shinryou"}
        SHINRYOU
      {/if}
    </div>
    <div class="commands">
      <a href="javascript:void(0)" on:click={() => doChangeMode("current")}
        >現行</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("add")}>追加</a>
      <a href="javascript:void(0)" on:click={() => doChangeMode("tenki")}
        >転機</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("edit")}>編集</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("drugs")}
        >薬剤</a
      >
      <a href="javascript:void(0)" on:click={() => doChangeMode("shinryou")}
        >診療</a
      >
    </div>
  </RightBox>
{/if}

<RightBox title="病名" display={!!env} dataCy="disease-box">
  <div class="workarea" bind:this={workarea} />
  <div>
    {#each drugsWithouMatchingDisease as d (d.id)}
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
  <div>
    {#each shinryouWithoutMatchingDisease as s}
      <div class="without-matching-disease">
        <div>{s.name}</div>
        {#each s.fixes as fix}
          <div>
            <span class="fix-name">{fix.label}</span>
            <button on:click={fix.exec}>fix</button>
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
    <a
      href="javascript:void(0)"
      on:click={() => doMode("shinryou")}
      data-cy="edit-link">診療</a
    >
  </div>
</RightBox>

<style>
  .workarea {
    margin-top: 6px;
  }

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

  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
</style>
