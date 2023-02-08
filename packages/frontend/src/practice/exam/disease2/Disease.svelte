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
  let env: DiseaseEnv | undefined = undefined;
  let workarea: HTMLElement;
  let clear: () => void = () => {};

  unsubs.push(
    currentPatient.subscribe(async (p) => {
      if (p == null) {
        clear();
        clear = () => {};
      } else {
        env = await DiseaseEnv.create(p);
        doMode("current");
      }
    })
  );

  onDestroy(() => {
    unsubs.forEach((f) => f());
  });

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
</script>

<RightBox title="病名" display={!!env} dataCy="disease-box">
  <div class="workarea" bind:this={workarea} />
  <div class="commands">
    <a href="javascript:void(0)" on:click={() => doMode("current")} data-cy="current-link">現行</a>
    <a href="javascript:void(0)" on:click={() => doMode("add")} data-cy="add-link">追加</a>
    <a href="javascript:void(0)" on:click={() => doMode("tenki")} data-cy="tenki-link">転機</a>
    <a href="javascript:void(0)" on:click={() => doMode("edit")} data-cy="edit-link">編集</a>
  </div>
</RightBox>

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
