<script lang="ts">
  import Add from "./add/Add.svelte";
  import Current from "./Current.svelte";
  import Tenki from "./Tenki.svelte";
  import Edit from "./edit/Edit.svelte";
  import { currentPatient } from "../ExamVars";
  import { onDestroy, tick } from "svelte";
  import RightBox from "../RightBox.svelte";
  import { DiseaseEnv } from "./disease-env";
  import type { Mode } from "./mode";
  import api from "@/lib/api";
  import { parseSqlDate } from "@/lib/util";
  import type { DiseaseData, DiseaseEnterData } from "myclinic-model";

  const unsubs: (() => void)[] = [];
  let comp: undefined | typeof Current = undefined;
  let env: DiseaseEnv | undefined = undefined;
  let workarea: HTMLElement;
  let clear: () => void = () => {};

  function setWorkarea(e: HTMLElement): void {
    workarea = e;
  }

  unsubs.push(
    currentPatient.subscribe(async (p) => {
      if (p == null) {
        env = undefined;
        comp = undefined;
      } else {
        env = await DiseaseEnv.create(p);
        comp = Current;
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

  async function doMode(mode: Mode) {
    clear();
    let c: typeof comp;
    switch (mode) {
      case "current": {
        c = Current;
        break;
      }
      case "add": {
        if (env == null) {
          return;
        }
        const envValue = env;
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
        c = undefined;
        break;
      }
      case "tenki": {
        if (env == null) {
          return;
        }
        const envValue = env;
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
        c = undefined;
        break;
      }
      case "edit": {
        if (env == null) {
          return;
        }
        const envValue = env;
        await envValue.fetchAllList();
        const b = new Edit({
          target: workarea,
          props: {
            diseases: env.allList ?? [],
            onDelete: (diseaseId: number) => {
              envValue.remove(diseaseId);
              doMode("current")
            }
          }
        })
        clear = () => b.$destroy();
        c = undefined;
        break;
      }
      default: {
        c = undefined;
        break;
      }
    }
    if (c === comp) {
      comp = undefined;
      await tick();
      comp = c;
    } else {
      comp = c;
    }
  }
</script>

{#if env != undefined}
  <RightBox title="病名">
    <div class="workarea" use:setWorkarea>
      <svelte:component this={comp} {env} {doMode} />
    </div>
    <div class="commands">
      <a href="javascript:void(0)" on:click={() => doMode("current")}>現行</a>
      <a href="javascript:void(0)" on:click={() => doMode("add")}>追加</a>
      <a href="javascript:void(0)" on:click={() => doMode("tenki")}>転機</a>
      <a href="javascript:void(0)" on:click={() => doMode("edit")}>編集</a>
    </div>
  </RightBox>
{/if}

<style>
  .workarea {
    margin-top: 6px;
  }

  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }
</style>
